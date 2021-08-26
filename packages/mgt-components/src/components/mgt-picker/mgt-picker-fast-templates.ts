import { html, ViewTemplate, when } from '@microsoft/fast-element';
import { MgtPicker } from './mgt-picker';

export const getOptionContentsTemplate = (picker: MgtPicker) => {
  console.log(picker.hasTemplate('person'));
  return html`
  ${when(
    x => picker.hasTemplate('person'),
    html`
    ${x => picker.renderTemplateFast('person', x.value)}
  `
  )}
  ${when(
    x => !picker.hasTemplate('person'),
    html`
    <mgt-person
        :userId="${x => x.value}"
        view="twoLines"
        line2-property="jobTitle"
    ></mgt-person>
  `
  )}
`;
};

export const optionContentsTemplate: ViewTemplate = html`
    <mgt-person
        :userId="${x => x.value}"
        view="twoLines"
        line2-property="jobTitle"
    ></mgt-person>
`;

export const itemContentsTemplate: ViewTemplate = html`
    <mgt-person user-id="${x => x.value}" view="oneLine"></mgt-person>
`;
