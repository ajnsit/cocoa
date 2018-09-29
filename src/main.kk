public module main

import sys/dom // withWindow
import std/data/dict // dict
import sys/dom/types // htmlElement
import sys/dom/document // body
import sys/dom/html/window // document

import concur/dom
import concur/props

import concur

// My View function
public fun myview (count: int, ist: internalSt<_h>): _ vnode {
  h("div", props(), vector([
    h("h1", props(), vector([t(count.show)])),
    h("button", props([("onclick", mkHandler0 { render(myview, ist, count - 1) })]), vector([t("-")])),
    h("button", props([("onclick", mkHandler0 { render(myview, ist, count + 1) })]), vector([t("+")]))
  ]))
}

// Main
public fun main() : _ () {
  run(0, myview)
}
