public module concur

import sys/dom // withWindow
import std/data/dict // dict
import sys/dom/types // htmlElement
import sys/dom/document // body
import sys/dom/html/window // document

import concur/dom
import concur/props

abstract struct internalSt<h>(prevNode: ref<h, maybe<vnode>>, container: htmlElement)

// NOTE: I have to spell out all the effect types in the type sigs because I get runtime errors without them.
// "`_bind_render` is undefined". Seems like a compiler bug.

// Render
public fun render<s,e>(view: (s, internalSt<sys/dom/types/hdom>) -> <st<sys/dom/types/hdom>,ui,exn,net,console,ndet|e> vnode , ist: internalSt<_h>, state: s):  <st<sys/dom/types/hdom>,ui,exn,net,console,ndet|e> () {
  val prevNode = ist.prevNode
  val prevNodeVal = !prevNode
  prevNode := Just(patch(null(prevNodeVal), view(state, ist), ist.container))
}

// Run
public fun run<s,e>(initState: s, view: (s, internalSt<sys/dom/types/hdom>) -> <st<sys/dom/types/hdom>,ui,exn,net,console,ndet|e> vnode):  <st<sys/dom/types/hdom>,ui,exn,net,console,ndet|e> () {
  // Oh noes: mutation
  val prevNode = ref(Nothing)

  // Gain access to the global window object
  withWindow fun(window : window) {
    // Start
    render(view, InternalSt(prevNode, window.document.body), initState)
  }
}

