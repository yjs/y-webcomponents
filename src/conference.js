/* global MediaStream  */

/**
 * @todo optimize video stream options (noise cancellation etc..)
 * @module conference
 */

import * as component from 'lib0/component.js'
import * as dom from 'lib0/dom.js'
import * as map from 'lib0/map.js'

const aspect16to9 = 1920 / 1080

const blockHost = ':host { display: block; }'

export const defineConference = component.createComponentDefiner(() => {
  component.defineListComponent()

  component.createComponent('d-conference-video', {
    template: '<video></video>',
    style: `
    ${blockHost}
    video {
      width: 100%;
      height: 100%;
      display: block;
    }
    `,
    state: { stream: /** @type {any} */ (null), audio: true },
    onStateChange: (state, prevState, component) => {
      if (state && state.stream && (prevState === null || prevState.stream !== state.stream)) {
        const videoOnlyStream = state.audio !== false ? state.stream : new MediaStream(state.stream.getVideoTracks())
        const video = /** @type {HTMLVideoElement} */ (dom.querySelector(/** @type {any} */ (component.shadowRoot), 'video'))
        if ('srcObject' in video) {
          video.srcObject = videoOnlyStream
        } else {
          // @ts-ignore
          video.src = window.URL.createObjectURL(videoOnlyStream) // for older browsers
        }
        video.play()
      }
    }
  })

  const ConferencePeer = component.createComponent('d-conference-peer', {
    template: '<d-conference-video></d-conference-video>',
    style: `
    ${blockHost}
    d-conference-video {
      width: 100%;
      height: 100%;
    }
    `,
    childStates: {
      'd-conference-video': state => ({ stream: state.remoteStream, audio: state.audio })
    },
    state: { conn: /** @type {any} */ (null), stream: /** @type {any} */ (null), remoteStream: /** @type {any} */ (null), audio: true },
    onStateChange: (state, prevState, component) => {
      // was bound and either stream or conn changed => remove old stream
      if (prevState != null && prevState.conn != null && (state == null || state.stream !== prevState.stream || prevState.conn !== state.conn) && prevState.conn.peer.streams.length > 0) {
        prevState.conn.peer.removeStream(prevState.stream)
      }
      // is bound and either stream or conn changed => add new stream
      if (state && state.conn && state.stream && (prevState == null || prevState.stream !== state.stream || prevState.conn !== state.conn)) {
        state.conn.peer.addStream(state.stream)
      }
      // conn defined and conn changed
      if (state && state.conn && (prevState == null || state.conn !== prevState.conn)) {
        state.conn.peer.on('stream', remoteStream => {
          if ((component.state || {}).conn === state.conn) {
            component.updateState({ remoteStream })
          }
        })
      }
    }
  })
  component.createComponent('d-conference-live', {
    template: '<div id="vids"><d-conference-video id="self"></d-conference-video><lib0-list></lib0-list></div><d-conference-peer id="active"></d-conference-peer><div id="controls"></div>',
    style: `
    ${blockHost}
    :host {
      background-color: #111;
      width: 100%;
      height: 100%;
      position: relative;
    }
    #vids {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 1;
      width: 10em;
    }
    lib0-list > * {
      margin-bottom: .1em;
    }
    #self {
      border-bottom: 1px solid var(--user-color, blue);
      margin-bottom: .7em;
    }
    #active {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      z-index: 0;
      padding-right: 10.3em;
      padding-left: .3em;
    }
    #controls {
      position: absolute;
      left: 50%;
      right: 50%;
      bottom: 1.5em;
      height: 1em;
      width: 5em;
      margin-left: -2.5em;
      margin-right: -2.5em;
      background-color: blue;
    }
  `,
    childStates: {
      'lib0-list': state => ({ list: state.peers.map(conn => ({ conn, stream: state.stream })), Item: ConferencePeer }),
      '#self': state => ({ stream: state.stream, audio: false }),
      '#active': state => ({ conn: state.peers[0], audio: false })
    },
    state: { provider: /** @type {any} */ (null), stream: null, peers: [] },
    onStateChange: (state, prevState, component) => {
      if ((prevState == null || prevState.provider == null) && state.provider != null) {
        const provider = state.provider
        const awareness = provider.awareness
        provider.key.then(() => {
          awareness.setLocalStateField('peerId', provider.room.peerId)
        })
        const updatePeerlist = () => {
          const activeUsers = map.map(provider.awareness.getStates(), state => state)
          const peers = map.map(state.provider.room.webrtcConns, peer => peer).filter(conn => activeUsers.findIndex(state => state.peerId === conn.remotePeerId) >= 0)
          console.log('peers changed', state.provider.room.webrtcConns, awareness.getStates(), peers)
          component.updateState({ peers })
        }
        provider.on('peers', updatePeerlist)
        awareness.on('change', updatePeerlist)
      }
    }
  })
  component.createComponent('d-conference', {
    template: '<d-conference-live></d-conference-live><slot name="error"></slot>',
    style: `
    ${blockHost}
    :host {
      font-size: 4vmax;
    }
    `,
    state: { provider: /** @type {any} */ (null), streamPromise: /** @type {any} */ (null), stream: /** @type {any} */ (null), error: /** @type {Error|null} */ (null) },
    childStates: {
      'd-conference-live': state => ({ provider: state.stream ? state.provider : null, stream: state.stream })
    },
    slots: state => {
      /**
       * @type {Object<string,any>}
       */
      const slots = {}
      if (state.error) {
        slots.error = `<div>${state.error.toString()}</div>`
      }
      return slots
    },
    onStateChange: (state, prevState, component) => {
      if (state && state.streamPromise == null && state.stream == null) {
        const streamPromise = navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', aspectRatio: aspect16to9 }, audio: { echoCancellation: true, noiseSuppression: true } })
        streamPromise.then(stream => {
          component.updateState({ stream, streamPromise: null })
        }).catch(error => {
          component.updateState({ streamPromise: null, error })
        })
        component.updateState({
          streamPromise
        })
      }
    }
  })
})
