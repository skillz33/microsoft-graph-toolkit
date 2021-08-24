import { MgtTemplatedComponent } from '@microsoft/mgt-element';
import { customElement, html, property, TemplateResult } from 'lit-element';
import { optionContentsTemplate } from './mgt-picker-fast-templates';

@customElement('mgt-picker')
export class MgtPicker extends MgtTemplatedComponent {
  /**
   * Array of styles to apply to the element. The styles should be defined
   * using the `css` tag function.
   */
  // static get styles() {
  //   return styles;
  // }
  // protected get strings() {
  //   return strings;
  // }

  createRenderRoot() {
    return this;
  }

  public render() {
    return html`
      <fast-picker
        options="2804bc07-1e1f-4938-9085-ce6d756a32d2,e8a02cc7-df4d-4778-956d-784cc9506e5a,c8913c86-ceea-4d39-b1ea-f63a5b675166"
        no-suggestions-text="No suggestions available"
        suggestions-available-text="Suggestions available"
        loading-text="Loading"
        label="Select some things"
        .menuOptionContentsTemplate=${optionContentsTemplate}
      ></fast-picker>
    `;
  }
}
