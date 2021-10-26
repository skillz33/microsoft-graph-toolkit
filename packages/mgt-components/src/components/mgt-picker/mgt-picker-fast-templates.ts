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
  <div class="close-icon">\uE711</div>
`;

export const channelContentTemplate: ViewTemplate = html`
  <div class="selected-team-name">${x => x.value.substring(8)}</div>
  <div class="close-icon">\uE711</div>
`;

export const itemContentsTemplate: ViewTemplate = html`
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
  ${when(x => x.value.startsWith('person'), personContentTemplate)}
  ${when(x => x.value.startsWith('channel'), channelContentTemplate)}
`;

export function personMenuContentTemplate(person: Person): ViewTemplate {
  return html`
    <mgt-person
      :personDetails=${x => person}
      fetch-image
      view="oneLine"></mgt-person>
  `;
}

export const channelMenuTemplate: ViewTemplate = html`
 <div class="channel">
    <div class="channel-image"><p>${x => x.value.substring(8, 9)}</p></div>
    <div class="channel-name">${x => x.value.substring(8)}</div>
  </div>
`;
