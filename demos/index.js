
import * as component from 'lib0/component.js'
import * as ycomps from '../src/index.js'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

ycomps.defineVersions()

const ydoc = new Y.Doc()
const provider = new WebsocketProvider('wss://demos.yjs.dev', 'y-components-demo', ydoc)
const awareness = provider.awareness
awareness.setLocalState({ color: '#6eeb83', name: 'Frankly Frank' + Math.floor(Math.random() * 10) })

// @ts-ignore
window.awareness = awareness

component.createComponent('d-demos', {
  template: '<y-whiteboard></y-whiteboard><y-versions></y-versions>',
  style: `
    y-versions {
      max-height: 500px;
    }
  `,
  state: { versions: [] },
  childStates: {
    'y-versions': ({ versions }, component) => ({ versions, addVersion: () => { component.updateState({ versions: versions.concat([{ date: new Date() }]) }) } }),
    'y-whiteboard': () => ({ type: ydoc.getArray('whiteboard') })
  }
})
