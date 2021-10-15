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
    }

    fast-picker-menu-option{
      background: #FFFFFF;
      font-family: Segoe UI;
      font-size: 14px;
      line-height: 20px;

      color: rgba(0, 0, 0, 0.83);
      position: inherit;
      width: 368px;
      height: 44px;
      left: 1861px;
      top: 1771px;

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
      margin-left: 15px;

      font-family: Segoe UI;
      font-size: 12px;
      line-height: 16px;

      color: rgba(0, 0, 0, 0.55);
    }
  </style>
      <fast-picker-menu id="custom-menu">
      ${picker.hasPeople ? peoplePickerRepeatTemplate(picker) : html`<p>No people found</p>`}
      ${picker.hasChannels ? channelPickerRepeatTemplate(picker) : html`<p>No channels found</p>`}
      </fast-picker-menu>
    `;
}
