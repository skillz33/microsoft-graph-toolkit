import { MgtTemplatedComponent, Providers, ProviderState } from '@microsoft/mgt-element';
import { customElement, html, property, query, state, TemplateResult } from 'lit-element';
import { findPeople, getPeople } from '../../graph/graph.people';
import { IDynamicPerson } from '../../graph/types';
import { getOptionContentsTemplate, itemContentsTemplate, optionContentsTemplate } from './mgt-picker-fast-templates';

@customElement('mgt-picker')
export class MgtPicker extends MgtTemplatedComponent {
  /**
   * Array of styles to apply to the element. The styles should be defined
   * using the `css` tag function.
   */
  // static get styles() {
  //   return styles;
  // }
  // protected get strings() {
  //   return strings;
  // }

  /**
   * containing object of IDynamicPerson.
   * @type {IDynamicPerson[]}
   */
  @property({
    attribute: 'people',
    type: Object
  })
  public people: IDynamicPerson[] = [];

  @query('fast-picker') private picker;

  @state() private defaultPeople: IDynamicPerson[];

  @state() private isLoading: boolean = true;

  createRenderRoot() {
    const root = document.createElement('div');
    this.appendChild(root);
    return root;
  }

  //"2804bc07-1e1f-4938-9085-ce6d756a32d2,e8a02cc7-df4d-4778-956d-784cc9506e5a,c8913c86-ceea-4d39-b1ea-f63a5b675166"
  public render() {
    console.log(this.people.map(p => p.id).join(','));

    return html`
      <fast-picker
        .options=${this.people.map(p => p.id).join(',')}
        no-suggestions-text="No suggestions available"
        suggestions-available-text="Suggestions available"
        loading-text="Loading"
        label="Select some things"
        filter-selected="false"
        filter-query="false"
        @querychange=${this.queryChanged}
        .showLoading=${this.isLoading}
        .menuOptionContentsTemplate=${optionContentsTemplate}
        .listItemContentsTemplate=${itemContentsTemplate}
      >
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
    if (provider && provider.state === ProviderState.SignedIn) {
      const input = this.picker.query;
      const graph = provider.graph.forComponent(this);

      if (!this.defaultPeople) {
        this.isLoading = true;

        this.defaultPeople = await getPeople(graph);
      }

      if (input) {
        // TODO: report bug - workaround for picker not updating when input changes
        this.people = [];
        this.people = await findPeople(graph, input);
      } else {
        this.people = this.defaultPeople;
      }

      console.log(this.people);
    }

    this.isLoading = false;
  }
}
