import { Person, Team, Channel } from '@microsoft/microsoft-graph-types';
import { TemplateResult, html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { personMenuContentTemplate, channelMenuTemplate, itemContentsTemplate } from './mgt-picker-fast-templates';
import { MgtPicker } from './mgt-picker';
import { DropdownItem } from '../../graph/graph.teams-channels';
import { IDynamicPerson } from '../..';

function personPickerMenuOption(person: Person, picker: MgtPicker): TemplateResult {
  return html`
    <fast-picker-menu-option
        .contentsTemplate="${personMenuContentTemplate(person)}"
        value="person-${person.id}"
        @click=${event => picker.handlePickerMenuClick(event, 'people')}>
    </fast-picker-menu-option>
    `;
}

function peoplePickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <div class="entity-text">People</div>
      ${repeat(
        picker.people,
        x => x.id,
        val => personPickerMenuOption(val, picker)
      )}
    `;
}

function channelPickerOption(channel: DropdownItem, team: Team, picker: MgtPicker): TemplateResult {
  return html`
    <fast-picker-menu-option
      .contentsTemplate="${channelMenuTemplate}"
      value="channel-${team.displayName}- ${channel.item.displayName}"
      @click=${event => picker.handlePickerMenuClick(event, 'channels')}>
    </fast-picker-menu-option>
  `;
}

function channelPickerMenuOption(item: DropdownItem, picker: MgtPicker): TemplateResult {
  return html`
    ${repeat(
      item.channels,
      x => x,
      val => channelPickerOption(val, item.item, picker)
    )}
    `;
}

function channelPickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <div class="entity-text">Channels</div>
      
      ${repeat(
        picker.teamItems,
        x => x,
        val => channelPickerMenuOption(val, picker)
      )}
    `;
}

export function pickerDropDownMenuTemplate(picker: MgtPicker): TemplateResult {
  return html`
  <style>
    #custom-menu{
      background: #FFFFFF;
      min-height: 250px;
      max-height: 100%;
      color: black;
      padding: 12px 0px;
      box-shadow: 0px 1.6px 3.6px rgba(0, 0, 0, 0.13), 0px 0px 2.9px rgba(0, 0, 0, 0.11);
      border-radius: 4px;
    }

    fast-picker-menu-option{
      background: #FFFFFF;
      font-family: var(--font-family,var(--default-font-family));
      font-size: var(--font-size,14px);
      line-height: var(--line-height,20px);
      color: rgba(0, 0, 0, 0.83);
      position: inherit;
      padding: 0px;
      height: 44px;
      background: #FFFFFF;
      border-radius: 0px;
    }

    fast-picker-menu-option:hover{
      background: rgba(0, 0, 0, 0.05);
      border-radius: 2px;
    }

    .entity-text {
      width: 36px;
      height: 16px;
      font-family: var(--font-family,var(--default-font-family));
      padding: 9px;
      font-size: var(--font-size,12px);
      line-height: var(--line-height,16px);
      color: rgba(0, 0, 0, 0.55);
    }

    fast-picker-list-item{
      /**TODO: Change this to the new select/deselect design */
      color: #000000;
      width: auto;
      height: 24px;
      background: rgba(0, 0, 0, 0.07);
      border-radius: 20px;
    }

    .channel{
      display: flex;
    }
    .channel-image p{
      border: var(--avatar-border,0);
      border-radius: var(--avatar-border-radius,50%);
      position: relative;
      width: 24px;
      height: 24px;
      background: #767676;
      color: #FFFFFF;
      text-align: center;
      line-height: 24px;
    }
    .channel-name{
      position: inherit;
      width: inherit;
      padding: 15px 0px 12px 4px;
      font-family: var(--font-family,var(--default-font-family));
      font-weight: var(--font-weight,600);
      font-size: var(--font-size,14px);
      line-height: 20px;
      color: rgba(0, 0, 0, 0.83);
    }
    .not-found-text{
      padding: 9px 0px 9px 13px;
      width: 145px;
      height: 16px;
      font-family: Segoe UI;
      font-size: 12px;
      line-height: 16px;
      color: rgba(0, 0, 0, 0.55);
    }
  </style>
      <fast-picker-menu id="custom-menu">
      ${
        picker.hasPeople
          ? peoplePickerRepeatTemplate(picker)
          : html`<div class="entity-text">People</div><p class="not-found-text">No people found</p>`
      }
      ${
        picker.hasChannels
          ? channelPickerRepeatTemplate(picker)
          : html`<div class="entity-text">Channels</div><p class="not-found-text">No channels found</p>`
      }
      </fast-picker-menu>
    `;
}

function renderCloseIcon(): TemplateResult {
  return html`
    <style>
      .close-icon{
        font-family: 'FabricMDL2Icons';
        position: inherit;
        width: 12px;
        height: 12px;
        left: calc(50% - 12px/2 + 51.5px);
        top: calc(50% - 12px/2 - 0.5px);
        font-size: 12px;
        line-height: 100%;
        display: flex;
        align-items: center;
        text-align: center;
        color: #767676;
        padding: 7px 4px 7px 4px;
        cursor: pointer;
      }
    </style>
    <div class="close-icon">\uE711</div>
  `;
}

export function renderPerson(person: IDynamicPerson): TemplateResult {
  return html`
    <mgt-person
      user-id="${person.id}"
      fetch-image
      view="oneLine"></mgt-person>`;
}

function renderSelected(selectedTemplate: TemplateResult) {
  return html`
  <style>
    .selected-entity {
      position: inherit;
      width: fit-content;
      height: 24px;
      left: 15px;
      top: 15px;
      display: flex;
      background: rgba(0, 0, 0, 0.07);
      border-radius: 20px;
      margin: 3px
    }
  </style>
  <div class="selected-entity">
    ${selectedTemplate}
    ${renderCloseIcon()}
  </div>
  `;
}

function renderSelectedPeople(people: IDynamicPerson[]): TemplateResult {
  return html`${people.map(person => renderSelected(renderPerson(person)))}`;
}

function renderSelectedChannels(channels: DropdownItem[]): TemplateResult {
  return html`${channels.map(channel => renderSelected(html`<p>TODO: Update</p>`))}`;
}

export function renderSelectedEntities(picker: MgtPicker): TemplateResult {
  return html`
    <style>
      .selected {
        flex: 1 0 auto;
        display: flex;
        flex-wrap: wrap;
        vertical-align: middle;
        margin: 0px 8px;
        list-style-type: none;
        font-style: normal;
        font-weight: 400;
        overflow: hidden;
      }
    </style>

    <div class="selected">
      ${
        !!picker._selectedPeople.length
          ? renderSelectedPeople(picker._selectedPeople)
          : !!picker._selectedChannels.length
          ? renderSelectedChannels(picker._selectedChannels)
          : null
      }
    </div>`;
}

export function renderFastPickerInput(picker: MgtPicker): TemplateResult {
  return html`
    <style>
      fast-picker input {
        position: inherit;
        width: 368px;
        height: 32px;
        left: 10px;
        top: 0px;

        background: #FFFFFF;
        border: none;

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
      placeholder="Start typing to search people, chats, and channels"
      filter-selected="false"
      filter-query="false"
      @querychange=${picker.queryChanged}
      @keyup="${picker.onUserKeyUp}"
      .showLoading=${picker.isLoading}
      .listItemContentsTemplate=${itemContentsTemplate}>
        ${pickerDropDownMenuTemplate(picker)}
  </fast-picker>
  `;
}

export function renderEntityBox(picker: MgtPicker): TemplateResult {
  return html`
  <style>
    .entity-box {
      position: inherit;
      width: 368px;
      left: 10px;
      top: 0px;
      background-color: var(--input-background-color,#fff);
      border-top: var(--input-border-top,var(--input-border,2px solid #605e5c));
      border-right: var(--input-border-right,var(--input-border,2px solid #605e5c));
      border-bottom: var(--input-border-bottom,var(--input-border,2px solid #605e5c));
      border-left: var(--input-border-left,var(--input-border,2px solid #605e5c));
      padding: 0px;
      flex: display
    }
  </style>
  <div class="entity-box">
    ${renderSelectedEntities(picker)}${renderFastPickerInput(picker)}
  </div>
  `;
}
