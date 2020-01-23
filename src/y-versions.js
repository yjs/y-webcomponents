
import * as dcomps from 'd-components'
import * as component from 'lib0/component.js'
import * as dom from 'lib0/dom.js'

const versionSelectedEvent = 'y-version-selected'
export const defineVersions = component.createComponentDefiner(() => {
  dcomps.defineButton()
  component.defineListComponent()
  const Item = component.createComponent('y-versions-item', {
    style: `
      :host {

      }
      d-button {
        --background-color: inherit;
        --active-color: #30bced77;
      }

      d-button > div {
        margin: 10px 5px;
      }
    `,
    template: '<d-button><div><b><slot name="name"></slot></b><i><slot name="date"></slot></i></div></d-button>',
    state: /** @type {any} */ (null),
    childStates: {
      'd-button': ({ active }) => ({ active })
    },
    slots: ({ version, index }) => ({
      name: `<div>${version.name || `Version ${index}`}</div>`,
      date: version.date ? `<div>${version.date.toLocaleDateString()} - ${version.date.toLocaleTimeString()}</div>` : `<div></div>`
    }),
    listeners: {
      [dcomps.buttonPressedEvent]: (event, component) => {
        dom.emitCustomEvent(component, versionSelectedEvent, { bubbles: true, detail: component.state })
      }
    }
  })
  return component.createComponent('y-versions', {
    template: '<d-button id="create-version"><div>Create Version</div></d-button><d-button id="unselect-version"><div>Unselect</div></d-button><lib0-list></lib0-list>',
    style: `
      :host {
        display: flex;
        flex-direction: column;
      }

      d-button {
        text-align: center;
      }

      #create-version > div, #unselect-version > div {
        margin: .5rem .2rem;
        font-weight: bold;
        font-size: 1.25em;
      }

      #unselect-version {
        --background-color: #ee6352;
      }

      :host([selected]) #create-version, :host(:not([selected])) #unselect-version {
        display: none;
      }

      :host(:not([selected])) y-versions-item:nth-last-child(2n) {
        --background-color: #eee;
      }
      :host(:not([selected])) y-versions-item:first-child {
        --background-color: #45a55533;
      }
      lib0-list {
        overflow-y: auto;
      }
    `,
    attrs: {
      selected: 'number'
    },
    state: { versions: /** @type {Array<any>} */ ([]), selected: /** @type {null|number} */ (null), addVersion: () => { console.log('add version') }, selectVersion: (v, i) => { console.log('selected version', v, i) }, unselectVersion: () => { console.log('unselect version') } },
    childStates: {
      'lib0-list': state => ({ list: [{ version: { name: '> Changes since last version', date: null }, index: -1, active: state.selected === -1 }].concat(state.versions.map((version, index) => ({ version, index, active: index === state.selected })) || []), Item })
    },
    listeners: {
      [dcomps.buttonPressedEvent]: /** @param {any} event */ (event, component) => {
        if (event.target.id === 'create-version') {
          component.state.addVersion()
        } else if (event.target.id === 'unselect-version') {
          component.updateState({ selected: null })
          component.state.unselectVersion()
        }
      },
      [versionSelectedEvent]: /** @param {any} event */ (event, component) => {
        const { version, index } = event.detail
        if (component.state.selected === index) {
          component.updateState({ selected: null })
          component.state.unselectVersion()
        } else {
          component.updateState({ selected: index })
          component.state.selectVersion(version, index)
        }
      }
    },
  })
})
