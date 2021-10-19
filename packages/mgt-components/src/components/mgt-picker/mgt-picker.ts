import { MgtTemplatedComponent, Providers, ProviderState } from '@microsoft/mgt-element';
import { customElement, property, query, state, html } from 'lit-element';
import { debounce } from '../../utils/Utils';
import { findPeople, getPeople } from '../../graph/graph.people';
import { IDynamicPerson } from '../../graph/types';
import { itemContentsTemplate } from './mgt-picker-fast-templates';
import { pickerDropDownMenuTemplate } from './mgt-picker-lit-templates';
import { Channel } from '@microsoft/microsoft-graph-types';
import { DropdownItem, getChannels } from '../../graph/graph.teams-channels';
import { MgtPeoplePicker, MgtTeamsChannelPicker } from '../components';
import { styles } from './mgt-picker-css';

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

  /**
   * Maximum number of results to return per entity.
   * @type {Channel[]}
   */
  @property({
    attribute: 'max-results',
    type: Object
  })
  public maxResults: Channel[] = [];
  private _defaultMaxResults: number = 10;

  @query('fast-picker') private picker;

  @state() private defaultPeople: IDynamicPerson[];

  @state() private defaultTeamItems: DropdownItem[];
  @state() public teamItems: DropdownItem[];

  @state() private isLoading: boolean = true;

  @state() public hasPeople: boolean = false;
  @state() public hasChannels: boolean = false;

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
  public render() {
    return html`
      <style>
        fast-picker input {
          position: inherit;
          width: 368px;
          height: 32px;
          left: 10px;
          top: 0px;

          background: #FFFFFF;
          border: 2px solid #BEBEBE;
          box-sizing: border-box;
          border-radius: 2px;

          font-family: Segoe UI;
          font-size: 14px;
          line-height: 20px;
          color: #2B2B2B;

          flex: none;
        }

        /**TODO: find out why this is not working */
        fast-picker input::focus{
          border: 2px solid #605E5C;
          box-sizing: border-box;
        }
      </style>
      <fast-picker
        max-selected="1"
        no-suggestions-text="No suggestions available"
        suggestions-available-text="Suggestions available"
        loading-text="Loading"
        label="Start typing to search people, chats, and channels"
        filter-selected="false"
        filter-query="false"
        @querychange=${this.queryChanged}
        @keyup="${this.onUserKeyUp}"
        .showLoading=${this.isLoading}
        .listItemContentsTemplate=${itemContentsTemplate}>
      ${pickerDropDownMenuTemplate(this)}
    </fast-picker>
    `;
  }

  private queryChanged(e) {
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
    const hasMaxResults = this.maxResults;
    console.log(this.maxResults);
    const maxValue = 10; // TODO: update this to be an attribute

    if (provider && provider.state === ProviderState.SignedIn) {
      if (entityHasChannels && !hasChannelScopes) {
        return;
      }
      if (entityHasPeople && !hasPeopleScopes) {
        return;
      }

      if (hasMaxResults) {
      }

      const input = this.userInput.toLowerCase();
      const graph = provider.graph.forComponent(this);

      const hasDefaultPeople = this.defaultPeople.length > 0 && entityHasPeople;
      const hasDefaultTeamItems = this.defaultTeamItems.length > 0 && entityHasChannels;

      if (this.entityTypes.length > 0) {
        this.isLoading = true;
        if (entityHasPeople && !hasDefaultPeople) this.defaultPeople = await getPeople(graph);
        if (entityHasChannels && !hasDefaultTeamItems) {
          this.defaultTeamItems = await getChannels(graph);
        }

        if (input) {
          if (entityHasPeople) {
            // TODO: report bug - workaround for picker not updating when input changes
            this.people = [];
            this.people = await findPeople(graph, input);
          }

          if (entityHasChannels) {
            this.teamItems = [];
            this.teamItems = await getChannels(graph, maxValue, input);
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
        if (this.teamItems && this.teamItems.length > 0) {
          this.hasChannels = true;
        } else {
          this.hasChannels = false;
        }
      }
    }

    this.isLoading = false;
  }

  /**
   * Perform the search after a Key Up event is fired.
   *
   * @param event KeyBoard typing event fired after pressing a key.
   */
  private onUserKeyUp(event: KeyboardEvent): void {
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
}
