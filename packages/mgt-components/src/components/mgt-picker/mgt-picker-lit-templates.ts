import { Person, Team } from '@microsoft/microsoft-graph-types';
import { TemplateResult, html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import { personMenuContentTemplate, channelMenuTemplate } from './mgt-picker-fast-templates';
import { MgtPicker } from './mgt-picker';

function personPickerMenuOption(person: Person): TemplateResult {
  return html`
    <fast-picker-menu-option
        .contentsTemplate="${personMenuContentTemplate(person)}"
        value="person-${person.id}">
    </fast-picker-menu-option>
    `;
}

function channelPickerMenuOption(channel: Team): TemplateResult {
  return html`
    <fast-picker-menu-option
        .contentsTemplate="${channelMenuTemplate}"
        value="channel-${channel.displayName}">
    </fast-picker-menu-option>
    `;
}

function peoplePickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <div>People</div>
      ${repeat(
        picker.people,
        x => x.id,
        val => personPickerMenuOption(val)
      )}
    `;
}

function channelPickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <div>Channels</div>
      ${repeat(
        picker.channels,
        x => x.id,
        val => channelPickerMenuOption(val)
      )}
    `;
}

export function pickerDropDownMenuTemplate(picker: MgtPicker): TemplateResult {
  return html`
      <fast-picker-menu id="custom-menu">
      ${picker.hasPeople ? peoplePickerRepeatTemplate(picker) : html`<p>No people found</p>`}
      ${picker.hasChannels ? channelPickerRepeatTemplate(picker) : html`<p>No channels found</p>`}
      </fast-picker-menu>
    `;
}
