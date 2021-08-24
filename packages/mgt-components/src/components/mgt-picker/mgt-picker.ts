import { MgtTemplatedComponent, Providers, ProviderState } from '@microsoft/mgt-element';
import { customElement, html, property, query, state, TemplateResult } from 'lit-element';
import { findPeople, getPeople } from '../../graph/graph.people';
import { IDynamicPerson } from '../../graph/types';
import { itemContentsTemplate, optionContentsTemplate } from './mgt-picker-fast-templates';

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
    return this;
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
      ></fast-picker>
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
        this.people = await findPeople(graph, input);
      } else {
        this.people = this.defaultPeople;
      }

      console.log(this.people);
    }

    this.isLoading = false;

    // const provider = Providers.globalProvider;
    // if (!people && provider && provider.state === ProviderState.SignedIn) {
    //   const graph = provider.graph.forComponent(this);

    //   if (!input.length && this._isFocused) {
    //     if (this.defaultPeople) {
    //       people = this.defaultPeople;
    //     } else {
    //       if (this.groupId) {
    //         if (this._groupPeople === null) {
    //           try {
    //             this._groupPeople = await findGroupMembers(
    //               graph,
    //               null,
    //               this.groupId,
    //               this.showMax,
    //               this.type,
    //               this.transitiveSearch
    //             );
    //           } catch (_) {
    //             this._groupPeople = [];
    //           }
    //         }
    //         people = this._groupPeople || [];
    //       } else if (this.type === PersonType.person || this.type === PersonType.any) {
    //         people = await getPeople(graph, this.userType);
    //       } else if (this.type === PersonType.group) {
    //         let groups = (await findGroups(graph, '', this.showMax, this.groupType)) || [];
    //         if (groups[0]['value']) {
    //           groups = groups[0]['value'];
    //         }
    //         people = groups;
    //       }
    //       this.defaultPeople = people;
    //     }
    //   }
    //   this._showLoading = false;

    //   if (
    //     (this.defaultSelectedUserIds || this.defaultSelectedGroupIds) &&
    //     !this.selectedPeople.length &&
    //     !this.defaultSelectedUsers
    //   ) {
    //     this.defaultSelectedUsers = await getUsersForUserIds(graph, this.defaultSelectedUserIds);
    //     this.defaultSelectedGroups = await getGroupsForGroupIds(graph, this.defaultSelectedGroupIds);

    //     this.defaultSelectedGroups = this.defaultSelectedGroups.filter(group => {
    //       return group !== null;
    //     });

    //     this.defaultSelectedUsers = this.defaultSelectedUsers.filter(user => {
    //       return user !== null;
    //     });

    //     this.selectedPeople = [...this.defaultSelectedUsers, ...this.defaultSelectedGroups];
    //     this.requestUpdate();
    //     this.fireCustomEvent('selectionChanged', this.selectedPeople);
    //   }

    //   if (input) {
    //     people = [];

    //     if (this.groupId) {
    //       people =
    //         (await findGroupMembers(graph, input, this.groupId, this.showMax, this.type, this.transitiveSearch)) || [];
    //     } else {
    //       if (this.type === PersonType.person || this.type === PersonType.any) {
    //         try {
    //           people = (await findPeople(graph, input, this.showMax, this.userType)) || [];
    //         } catch (e) {
    //           // nop
    //         }

    //         if (people.length < this.showMax && this.userType !== UserType.contact) {
    //           try {
    //             const users = (await findUsers(graph, input, this.showMax)) || [];

    //             // make sure only unique people
    //             const peopleIds = new Set(people.map(p => p.id));
    //             for (const user of users) {
    //               if (!peopleIds.has(user.id)) {
    //                 people.push(user);
    //               }
    //             }
    //           } catch (e) {
    //             // nop
    //           }
    //         }
    //       }
    //       if ((this.type === PersonType.group || this.type === PersonType.any) && people.length < this.showMax) {
    //         let groups = [];
    //         try {
    //           groups = (await findGroups(graph, input, this.showMax, this.groupType)) || [];
    //           people = people.concat(groups);
    //         } catch (e) {
    //           // nop
    //         }
    //       }
    //     }
    //   }
    // }

    // //people = this.getUniquePeople(people);
    // this._foundPeople = this.filterPeople(people);
  }
}
