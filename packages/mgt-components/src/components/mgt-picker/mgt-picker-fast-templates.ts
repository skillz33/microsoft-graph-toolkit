import { html, ViewTemplate, when } from '@microsoft/fast-element';
import { Person, Team } from '@microsoft/microsoft-graph-types';

export const optionContentsTemplate: ViewTemplate = html`
  <mgt-person
      :userId="${x => x.value}"
      view="twoLines"
      line2-property="jobTitle">
  </mgt-person>
`;

export const personContentTemplate: ViewTemplate = html`
  <mgt-person user-id="${x => x.value.substring(7)}" view="oneLine"></mgt-person>
`;

export const channelContentTemplate: ViewTemplate = html`
  <div class="selected-team-name">${x => x.value.substring(8)}</div>
`;

export const itemContentsTemplate: ViewTemplate = html`
  ${when(x => x.value.startsWith('person'), personContentTemplate)}
  ${when(x => x.value.startsWith('channel'), channelContentTemplate)}
`;

export function personMenuContentTemplate(person: Person): ViewTemplate {
  return html`
    <mgt-person
      :personDetails=${x => person}
      fetch-image
      view="twoLines"
      line2-property="jobTitle"></mgt-person>
  `;
}

export const channelMenuTemplate: ViewTemplate = html`
  <p>${x => x.value.substring(8)}</p>
`;
