import { html, ViewTemplate, when } from '@microsoft/fast-element';
import { Team } from '@microsoft/microsoft-graph-types';
import { TemplateResult, html as litHtml } from 'lit-html';
import { repeat as litRepeat } from 'lit-html/directives/repeat';

import { MgtPicker } from './mgt-picker';

export const optionContentsTemplate: ViewTemplate = html`
  <mgt-person
      :userId="${x => x.value}"
      view="twoLines"
      line2-property="jobTitle">
  </mgt-person>
`;

const personContentTemplate: ViewTemplate = html`
  <mgt-person user-id="${x => x.value.substring(7)}" view="oneLine"></mgt-person>
`;

const channelContentTemplate: ViewTemplate = html`
  <p>${x => x.value.substring(8)}</p>
`;

// TODO: find a way to display selected items
export const itemContentsTemplate: ViewTemplate = html`
  ${when(x => x.value.startsWith('person'), personContentTemplate)}
  ${when(x => x.value.startsWith('channel'), channelContentTemplate)}
`;

function personPickerMenuOption(id: string): TemplateResult {
  return litHtml`
    <fast-picker-menu-option value="${'person-' + id}">
      <mgt-person
        user-id="${id}"
        view="twoLines"
        line2-property="jobTitle"></mgt-person>
    </fast-picker-menu-option>
  `;
}

function channelPickerMenuOption(channel: Team): TemplateResult {
  return litHtml`
    <fast-picker-menu-option value="${'channel-' + channel.displayName}"></fast-picker-menu-option>
  `;
}

function peoplePickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return litHtml`
    <div>People</div>
    ${litRepeat(
      picker.people,
      x => x.id,
      val => personPickerMenuOption(val.id)
    )}
  `;
}

function channelPickerRepeatTemplate(picker: MgtPicker): TemplateResult {
  return litHtml`
    <div>Channels</div>
    ${litRepeat(
      picker.channels,
      x => x.id,
      val => channelPickerMenuOption(val)
    )}
  `;
}

export function pickerDropDownMenuTemplate(picker: MgtPicker): TemplateResult {
  console.log(picker.people, picker.channels);
  return litHtml`
    <fast-picker-menu id="custom-menu">
    ${picker.hasPeople ? peoplePickerRepeatTemplate(picker) : litHtml`<p>No people found</p>`}
    ${picker.hasChannels ? channelPickerRepeatTemplate(picker) : litHtml`<p>No channels found</p>`}
    </fast-picker-menu>
  `;
}
