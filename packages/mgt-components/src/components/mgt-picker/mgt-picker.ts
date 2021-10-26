import { MgtTemplatedComponent, Providers, ProviderState } from '@microsoft/mgt-element';
import { customElement, property, query, state, html, TemplateResult } from 'lit-element';
import { debounce } from '../../utils/Utils';
import { findPeople, getPeople } from '../../graph/graph.people';
import { IDynamicPerson } from '../../graph/types';
import { itemContentsTemplate, personMenuContentTemplate } from './mgt-picker-fast-templates';
import { pickerDropDownMenuTemplate, renderEntityBox, renderFastPickerInput } from './mgt-picker-lit-templates';
import { Channel } from '@microsoft/microsoft-graph-types';
import { DropdownItem, getChannels } from '../../graph/graph.teams-channels';
import { MgtPeoplePicker, MgtTeamsChannelPicker } from '../components';
import { styles } from './mgt-picker-css';

/** Match an entity to it's max-result value */
interface Entity {
  name: string;
  maxResults: number;
}

@customElement('mgt-picker')
export class MgtPicker extends MgtTemplatedComponent {
  /**
   * Array of styles to apply to the element. The styles should be defined
   * using the `css` tag function.
   */
  static get styles() {
    return styles;
  }
  // protected get strings() {
  //   return strings;
  // }
  private _debounceSearch: { (): void; (): void };

  constructor() {
    super();
    this.clearState();
  }

  /**
   * array of entities to be used to search the graph
   *
   * @type {string[]}
   * @memberof MgtPicker
   */
  @property({
    attribute: 'entity-types',
    converter: value => {
      return value.split(',').map(v => v.trim());
    },
    type: String
  })
  public entityTypes: string[];

  /**
   * Array of maximum number of values an entity can have. They are
   * matched with the entity-types i.e. if entity-types="people,channels" and
   * max-results="5", then people entity will have a maximum result
   * of 5 and channels will have the default maximum result value.
   *
   * @type {string[]}
   * @memberof MgtPicker
   */
  @property({
    attribute: 'max-results',
    converter: value => {
      return value.split(',').map(v => parseInt(v.trim()));
    },
    type: Number
  })
  public maxResults: number[];

  /**
   * containing object of IDynamicPerson.
   * @type {IDynamicPerson[]}
   */
  @property({
    attribute: 'people',
    type: Object
  })
  public people: IDynamicPerson[] = [];

  /**
   * containing object of Channels.
   * @type {Channel[]}
   */
  @property({
    attribute: 'channels',
    type: Object
  })
  public channels: Channel[] = [];

  @query('fast-picker') public picker;

  @state() private defaultPeople: IDynamicPerson[];

  @state() private defaultTeamItems: DropdownItem[];
  @state() public teamItems: DropdownItem[];

  @state() public isLoading: boolean = true;

  @state() public hasPeople: boolean = false;
  @state() public hasChannels: boolean = false;
  @state() private _defaultMaxResults: number = 10;
  @state() private _entityTypes: Entity[];
  @state() public _selectedChannels: DropdownItem[];
  @state() public _selectedPeople: IDynamicPerson[];

  /**
   * User input in search.
   *
   * @protected
   * @type {string}
   * @memberof MgtPicker
   */
  protected userInput: string;

  createRenderRoot() {
    const root = document.createElement('div');
    this.appendChild(root);
    return root;
  }

  //"2804bc07-1e1f-4938-9085-ce6d756a32d2,e8a02cc7-df4d-4778-956d-784cc9506e5a,c8913c86-ceea-4d39-b1ea-f63a5b675166"
  public render(): TemplateResult {
    return renderEntityBox(this);
  }

  public queryChanged(e) {
    this.isLoading = true;

    this.requestStateUpdate();
  }

  /**
   * Async query to Graph for members of group if determined by developer.
   * set's `this.groupPeople` to those members.
   */
  protected async loadState(): Promise<void> {
    const provider = Providers.globalProvider;
    const entityHasChannels = this.entityTypes.includes('channels');
    const entityHasPeople = this.entityTypes.includes('people');
    const hasChannelScopes = await provider.getAccessTokenForScopes(...MgtTeamsChannelPicker.requiredScopes);
    const hasPeopleScopes = await provider.getAccessTokenForScopes(...MgtPeoplePicker.requiredScopes);

    if (provider && provider.state === ProviderState.SignedIn) {
      if (entityHasChannels && !hasChannelScopes) {
        return;
      }
      if (entityHasPeople && !hasPeopleScopes) {
        return;
      }

      const input = this.userInput.toLowerCase();
      const graph = provider.graph.forComponent(this);

      const hasDefaultPeople = this.defaultPeople.length > 0 && entityHasPeople;
      const hasDefaultTeamItems = this.defaultTeamItems.length > 0 && entityHasChannels;

      if (this.entityTypes.length > 0) {
        this._matchEntityToMaxResult();
        const teamsMaxResults = this._getMaxResultForEntity('channels');
        const peopleMaxResults = this._getMaxResultForEntity('people');

        this.isLoading = true;

        if (entityHasPeople && !hasDefaultPeople) this.defaultPeople = await findPeople(graph, '', peopleMaxResults);
        if (entityHasChannels && !hasDefaultTeamItems) {
          this.defaultTeamItems = await getChannels(graph, teamsMaxResults);
        }

        if (input) {
          if (entityHasPeople) {
            this.people = await findPeople(graph, input, peopleMaxResults);
          }

          if (entityHasChannels) {
            this.teamItems = await getChannels(graph, teamsMaxResults, input);
          }
        } else {
          this.people = this.defaultPeople;
          this.teamItems = this.defaultTeamItems;
        }

        if (this.people && this.people.length > 0) {
          this.hasPeople = true;
        } else {
          this.hasPeople = false;
        }
        if (this.teamItems && this.teamItems.length > 0 && this.checkChannelsExistInTeamItems(this.teamItems)) {
          this.hasChannels = true;
        } else {
          this.hasChannels = false;
        }
      }
    }

    this.isLoading = false;
  }

  /**
   * Matches an entity name to it's max-result value
   */
  private _matchEntityToMaxResult() {
    for (let i = 0; i < this.entityTypes.length; i++) {
      const entity = this.entityTypes[i];
      const maxResults = this.maxResults[i] ? this.maxResults[i] : this._defaultMaxResults;
      this._entityTypes.push({
        name: entity,
        maxResults: maxResults
      });
    }
  }

  /**
   * Perform the search after a Key Up event is fired.
   *
   * @param event KeyBoard typing event fired after pressing a key.
   */
  public onUserKeyUp(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    this.userInput = input.value;
    this.handleEntitySearch();
  }

  /**
   * Clears state of the component
   *
   * @protected
   * @memberof MgtPicker
   */
  protected clearState(): void {
    this.userInput = '';
    this.defaultTeamItems = [];
    this.defaultPeople = [];
    this.hasChannels = false;
    this.hasPeople = false;
    this._entityTypes = [];
    this._selectedPeople = [
      { id: '2804bc07-1e1f-4938-9085-ce6d756a32d2' },
      { id: 'e8a02cc7-df4d-4778-956d-784cc9506e5a' },
      { id: 'c8913c86-ceea-4d39-b1ea-f63a5b675166' }
    ];
    this._selectedChannels = [];
  }

  /**
   * Use debounce to perform a search after a delay.
   */
  private handleEntitySearch() {
    if (!this._debounceSearch) {
      this._debounceSearch = debounce(async () => {
        const loadingTimeout = setTimeout(() => {
          this.isLoading = true;
        }, 50);

        await this.loadState();

        clearTimeout(loadingTimeout);
        this.isLoading = false;
      }, 400);
    }

    this._debounceSearch();
  }

  /**
   * Returns the maximum result number for an entity or the
   * default return value.
   * @param entityName the name of an entity
   * @returns the maximum result number.
   */
  private _getMaxResultForEntity(entityName: string): number {
    for (const entity of this._entityTypes) {
      if (entity.name === entityName) {
        return entity.maxResults;
      }
    }
    return this._defaultMaxResults;
  }

  /**
   * Checks whether an array of team items have channels within it. The
   * graph returns the teams but the during a search, the channels are
   * checked and may return empty channel arrays.
   *
   * @param teamItems an array of team items with channels.
   * @returns
   */
  private checkChannelsExistInTeamItems(teamItems: DropdownItem[]): boolean {
    for (const team of teamItems) {
      const channels = team.channels;
      if (channels.length > 0) return true;
    }
    return false;
  }

  public handlePickerMenuClick(event: Event, entityType: string) {
    event.preventDefault();
    this.clearInput();
    // const pickerMenuHtml = event.target as HTMLElement;
    // console.log(pickerMenuHtml);
    // this.picker.query = personMenuContentTemplate({ id: '2804bc07-1e1f-4938-9085-ce6d756a32d2' });
  }

  private clearInput() {
    this.picker.query = '';
    this.userInput = '';
  }
}
