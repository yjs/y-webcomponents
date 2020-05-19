
import * as component from 'lib0/component.js'
import * as dcomps from '../src/index.js'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

dcomps.defineConference()

const ydoc = new Y.Doc()
const provider = new WebrtcProvider('d-conference-demo', ydoc, { password: '0923141767-uia09e', filterBcConns: false })

component.createComponent('d-conference-demo', {
  template: '<d-conference></d-conference>',
  style: `
  d-conference {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  `,
  childStates: {
    'd-conference': state => ({
      provider, stream: state ? state.stream || null : null
    })
  },
  onStateChange: (state, prevState, component) => {
    if (prevState == null) {
      // @ts-ignore
      window.demo = { component, provider, ydoc }
    }
  }
})
