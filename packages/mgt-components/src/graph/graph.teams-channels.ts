import { Team, Channel } from '@microsoft/microsoft-graph-types';
import { getAllMyTeams } from '../components/mgt-teams-channel-picker/mgt-teams-channel-picker.graph';
import { CacheService, CacheStore, IGraph, CacheItem } from '@microsoft/mgt-element';
import { schemas } from './cacheStores';

/** Checks if the Teams Store is enabled */
const getIsTeamsCacheEnabled = (): boolean => CacheService.config.teams.isEnabled && CacheService.config.isEnabled;

/** Defines the expiration time */
const getTeamItemsInvalidationTime = (): number =>
  CacheService.config.teams.invalidationPeriod || CacheService.config.defaultInvalidationPeriod;

/**
 * Team Items object stored in cache store.
 */
interface CacheTeamItems extends CacheItem {
  maxResults?: number;
  results: string[];
}

/**
 * Performs a graph request for teams and it's channels.
 *
 * @param graph IGraph
 * @param filter query string to search the graph
 * @returns TeamItems array
 */
export async function getChannels(graph: IGraph, top: number = 10, filter: string = ''): Promise<DropdownItem[]> {
  // TODO: use the top parameter
  let teams: Team[];
  let teamItemsCache: CacheStore<CacheTeamItems>;
  const hasFilter = filter !== '';
  let cacheKey = hasFilter ? `${filter}:${top}:teams` : `teams:${top}`;

  if (getIsTeamsCacheEnabled()) {
    const store = hasFilter ? schemas.teams.stores.teamsQuery : schemas.teams.stores.teamsItems;
    teamItemsCache = CacheService.getCache<CacheTeamItems>(schemas.teams, store);
    const result: CacheTeamItems = getIsTeamsCacheEnabled() ? await teamItemsCache.getValue(cacheKey) : null;
    if (result && getTeamItemsInvalidationTime() > Date.now() - result.timeCached) {
      return result.results.map(teamItem => JSON.parse(teamItem));
    }
  }

  teams = await getAllMyTeams(graph);
  teams = teams.filter(t => !t.isArchived);

  const batch = graph.createBatch();

  for (const team of teams) {
    let resourceUrl = `teams/${team.id}/channels`;
    if (hasFilter) {
      resourceUrl += `?$filter=contains(displayName, '${filter}')`;
    }
    batch.get(team.id, resourceUrl);
  }

  const responses = await batch.executeAll();

  for (const team of teams) {
    const response = responses.get(team.id);

    if (response && response.content && response.content.value) {
      team.channels = response.content.value.map(c => {
        return {
          item: c
        };
      });
    }
  }

  const dropDownItem = teams.map(t => {
    return {
      channels: t.channels as DropdownItem[],
      item: t
    };
  });

  if (getIsTeamsCacheEnabled() && dropDownItem) {
    const item = { maxResults: top, results: null };
    item.results = dropDownItem.map(teamItem => JSON.stringify(teamItem));
    teamItemsCache.putValue(cacheKey, item);
  }
  return dropDownItem;
}

/**
 * Drop down menu item
 *
 * @export
 * @interface DropdownItem
 */
export interface DropdownItem {
  /**
   * Teams channel
   *
   * @type {DropdownItem[]}
   * @memberof DropdownItem
   */
  channels?: DropdownItem[];
  /**
   * Microsoft Graph Channel or Team
   *
   * @type {(MicrosoftGraph.Channel | MicrosoftGraph.Team)}
   * @memberof DropdownItem
   */
  item: Channel | Team;
}
