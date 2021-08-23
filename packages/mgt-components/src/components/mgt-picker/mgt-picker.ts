import { MgtTemplatedComponent } from '@microsoft/mgt-element';
import { customElement, html, property, TemplateResult } from 'lit-element';

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

  public render() {
    return html`
      <fast-design-system-provider use-defaults>
      <fast-picker
        selection="bananas,strawberries"
        options="apples,oranges,bananas,pears,pineapples,strawberries"
        no-suggestions-text="No suggestions available"
        suggestions-available-text="Suggestions available"
        loading-text="Loading"
        label="Select some things"
    ></fast-picker>
      </fast-design-system-provider>
    `;
  }
}
