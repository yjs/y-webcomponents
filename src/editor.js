import * as component from 'lib0/component.js'

/**
 * @param {HTMLElement} el
 */
const defaultParser = el => {
  switch (el.nodeName) {
    case 'p':
    case 'span':
    case 'div':
      return {
        type: 'text',
        content: el.textContent
      }
  }
}

export const defineEditor = component.createComponentDefiner(() => {
  component.createComponent('d-editor-p', {
    template: '<slot></slot>',
    state: {
      content: '<p>hello world</p>',
      parser: defaultParser
    },
    attrs: {
      editable: 'bool'
    },
    slots: state => ({
      default: `${state.content}`
    }),
    onStateChange: (state, prevState, component) => {
      component.setAttribute('contenteditable', state.editable + '')
    }
  })
  return component.createComponent('d-editor', {
    template: '<h1 contenteditable="true">editor</h1><slot></slot>',
    state: {
      content: '<p>hello world</p>',
      editable: true,
      nodes: {
        'd-editor-p': true,
        'd-editor-img': true,
        // 'd-pdf': import('./d-editor-pdf.js')
      },
      parser: defaultParser
    },
    attrs: {
      editable: 'bool'
    },
    slots: state => ({
      default: `${state.content}`
    }),
    onStateChange: (state, prevState, component) => {
      component.setAttribute('contenteditable', state.editable + '')
    }
  })
})
