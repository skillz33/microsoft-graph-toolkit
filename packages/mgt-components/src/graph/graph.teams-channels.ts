import { Team, Channel } from '@microsoft/microsoft-graph-types';
import { getAllMyTeams } from '../components/mgt-teams-channel-picker/mgt-teams-channel-picker.graph';
import { IGraph } from '@microsoft/mgt-element';

export async function getChannels(graph: IGraph, filter: string = ''): Promise<DropdownItem[]> {
  let teams: Team[];
  teams = await getAllMyTeams(graph);
  teams = teams.filter(t => !t.isArchived);

  const batch = graph.createBatch();

  for (const team of teams) {
    let resourceUrl = `teams/${team.id}/channels`;
    if (filter) {
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
  console.log('filter ', filter);
  console.log('dropDownItem ', dropDownItem);
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
