import { Person, Team, Channel } from '@microsoft/microsoft-graph-types';
import { TemplateResult, html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { personMenuContentTemplate, channelMenuTemplate } from './mgt-picker-fast-templates';
import { MgtPicker } from './mgt-picker';
import { DropdownItem } from '../../graph/graph.teams-channels';

function personPickerMenuOption(person: Person): TemplateResult {
  return html`
    <fast-picker-menu-option
        .contentsTemplate="${personMenuContentTemplate(person)}"
        value="person-${person.id}">
    </fast-picker-menu-option>
    `;
}

function peoplePickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <div class="entity-text">People</div>
      ${repeat(
        picker.people,
        x => x.id,
        val => personPickerMenuOption(val)
      )}
    `;
}

function channelPickerOption(channel: DropdownItem, team: Team): TemplateResult {
  return html`
    <fast-picker-menu-option
      .contentsTemplate="${channelMenuTemplate}"
      value="channel-${team.displayName}- ${channel.item.displayName}">
    </fast-picker-menu-option>
  `;
}

function channelPickerMenuOption(item: DropdownItem): TemplateResult {
  return html`
    ${repeat(
      item.channels,
      x => x,
      val => channelPickerOption(val, item.item)
    )}
    `;
}

function channelPickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <div class="entity-text">Channels</div>
      
      ${repeat(
        picker.teamItems,
        x => x,
        val => channelPickerMenuOption(val)
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
    .channel-image img{
      height: 24px;
      width: 24px;
      display: flex;
      overflow: hidden;
      border: var(--avatar-border,0);
      border-radius: var(--avatar-border-radius,50%);
      position: relative;
      padding: 10px 0px 10px 0px;
    }
    .channel-name{
      position: inherit;
      width: inherit;
      padding: 12px 0px 12px 4px;
      font-family: var(--font-family,var(--default-font-family));
      font-weight: var(--font-weight,600);
      font-size: var(--font-size,14px);
      line-height: 20px;
      color: rgba(0, 0, 0, 0.83);
    }
  </style>
      <fast-picker-menu id="custom-menu">
      ${picker.hasPeople ? peoplePickerRepeatTemplate(picker) : html`<p>No people found</p>`}
      ${picker.hasChannels ? channelPickerRepeatTemplate(picker) : html`<p>No channels found</p>`}
      </fast-picker-menu>
    `;
}
