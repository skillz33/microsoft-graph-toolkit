import { html, ViewTemplate } from '@microsoft/fast-element';

export const optionContentsTemplate: ViewTemplate = html`
  <mgt-person
      user-id="${x => x.value}"
      view="twoLines"
      line2-property="jobTitle"
  ></mgt-person>
`;

export const itemContentsTemplate: ViewTemplate = html`

    <mgt-person user-id="${x => x.value}" view="oneLine"></mgt-person>

`;
