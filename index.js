
import * as component from 'lib0/component.js'
import * as dom from 'lib0/dom.js'

component.defineListComponent()
component.defineLazyLoadingComponent()
/**
 * @example
 *    <my-blue></my-blue>
 * 
 * @example
 *    <my-blue><h1 slot="content">my blue headline</h1></my-blue>
 */
export const MyBlueComponent = component.createComponent(`my-blue`, {
  template: `<slot name="content">Hello World</slot>`,
  style: 'slot[name="content"] { color: blue; };',
})

export const SomeList = component.createComponent('some-list', {
  template: `<lib0-list></lib0-list>`,
  state: { someContent: ['A', 'B', 'C'] },
  attrs: {
    someContent: 'json'
  },
  childStates: {
    'lib0-list': state => ({ list: state.someContent })
  }
})
