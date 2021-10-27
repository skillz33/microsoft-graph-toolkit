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
  <style>
    mgt-person img {
      width: var(--avatar-size-s,var(--avatar-size,24px));
      height: var(--avatar-size-s,var(--avatar-size,24px));
    }
  </style>
  <mgt-person user-id="${x => x.value.substring(7)}" view="oneline" fetch-image></mgt-person>
  <div class="close-icon">\uE711</div>
`;

export const channelContentTemplate: ViewTemplate = html`
  <style>
    .selected-team {
      display: flex;
      height: 24px;
    }
    .selected-team-icon{
      border: var(--avatar-border,0);
      border-radius: var(--avatar-border-radius,50%);
      position: inherit;
      width: 24px;
      height: 24px;
      background: #767676;
      color: #FFFFFF;
      text-align: center;
      line-height: 24px;
      padding: 0px 2px 0px 0px;
    }
    .selected-team-name{
      position: inherit;
      width: inherit;
      padding: 0px 0px 12px 4px;
      font-family: var(--font-family,var(--default-font-family));
      font-weight: var(--font-weight,600);
      font-size: var(--font-size,14px);
      line-height: 24px;
      color: rgba(0, 0, 0, 0.83);
    }
    .selected-team > div > .close-icon{
      padding: 7px 0px 7px 7px;
    }
  </style>
  
  <div class="selected-team">
    <div class="selected-team-icon">${x => x.value.substring(8, 9)}</div>
    <div class="selected-team-name">${x => x.value.substring(8)}
  </div>
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
      padding: 7px;
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
