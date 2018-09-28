public module concur

import sys/dom // withWindow
import std/data/dict // dict
import sys/dom/types // htmlElement
import sys/dom/document // body
import sys/dom/html/window // document

import concur/dom
import concur/props

struct st<h>(prevNode: ref<h, maybe<vnode>>, container: htmlElement)

// View function
public fun view (count: int, st: st<_h>): _ vnode {
  h("div", props(), vector([
    h("h1", props(), vector([t(count.show)])),
    h("button", props([("onclick", mkHandler0 { render(count - 1, st) })]), vector([t("-")])),
    h("button", props([("onclick", mkHandler0 { render(count + 1, st) })]), vector([t("+")]))
  ]))
}

// Render function
public fun render(state: int, st: st<_h>): _ () {
  val prevNode = st.prevNode
  val prevNodeVal = !prevNode
  prevNode := Just(patch(null(prevNodeVal), view(state, st), st.container))
}

// Main
public fun main() : _ () {
  // Oh noes: mutation
  // val prevNode: ref<h, maybe<vnode>> = ref(Nothing)
  val prevNode = ref(Nothing)

  // Gain access to the global window object
  withWindow fun(window : window) {
    // Start
    render(0, St(prevNode, window.document.body))
  }
}
