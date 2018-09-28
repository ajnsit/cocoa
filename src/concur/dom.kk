public module concur/dom

import sys/dom/types
import std/data/dict
import sys/dom/html/htmlElement
// Why doesn't this work?
// import sys/dom/html/htmlElement

import concur/props

external include {
  js file "superfine.js"
}

type vnode

/* superfine.h */
external h : (name: string, props: props<prop>, children: vector<vnode>) -> vnode
{ inline "superfine.h(#1, #2, #3)" }

/* Strings can be passed as is to `h` */
external t : (str: string) -> vnode
{ inline "#1" }

/* superfine.patch */
external patch : (lastNode: null<vnode>, nextNode: vnode, container: htmlElement) -> dom vnode
{ inline "superfine.patch(#1, #2, #3)" }
