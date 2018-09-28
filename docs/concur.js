// Koka generated module: "concur", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['./std_core', './sys_dom', './std_data_dict', './sys_dom_types', './sys_dom_document', './sys_dom_html_window', './concur_dom', './concur_props'], function($std_core, $sys_dom, $std_data_dict, $sys_dom_types, $sys_dom_document, $sys_dom_html_window, $concur_dom, $concur_props) {
"use strict";
var $concur  = {};
 
// externals
 
// type declarations
// type st
function St(prevNode, container) /* forall<h> (prevNode : ref<h,maybe<concur/dom/vnode>>, container : sys/dom/types/htmlElement) -> st<h> */  {
  return { prevNode: prevNode, container: container };
}
 
// declarations
 
// Automatically generated. Retrieves the `prevNode` constructor field of the `:st` type.
function prevNode(st) /* forall<h> (st : st<h>) -> ref<h,maybe<concur/dom/vnode>> */  {
  return st.prevNode;
}
 
// Automatically generated. Retrieves the `container` constructor field of the `:st` type.
function container(st) /* forall<h> (st : st<h>) -> sys/dom/types/htmlElement */  {
  return st.container;
}
function _copy(_this, prevNode0, container0) /* forall<h> (st<h>, prevNode : ?ref<h,maybe<concur/dom/vnode>>, container : ?sys/dom/types/htmlElement) -> st<h> */  {
  var _prevNode_60 = (prevNode0 !== undefined) ? prevNode0 : prevNode(_this);
  var _container_67 = (container0 !== undefined) ? container0 : container(_this);
  return St(_prevNode_60, _container_67);
}
 
// Render function
function render(state, st) /* (state : int, st : st<sys/dom/types/hdom>) -> <st<sys/dom/types/hdom>,pure,ui,net,console,ndet> () */  {
  var prevNode0 = prevNode(st);
  var prevNodeVal = ((prevNode0).value);
  return ((prevNode0).value = ($std_core.Just($concur_dom.patch($std_core.$null(prevNodeVal), view(state, st), container(st)))));
}
 
// View function
function view(count, st0) /* (count : int, st : st<sys/dom/types/hdom>) -> <st<sys/dom/types/hdom>,pure,ui,net,console,ndet> concur/dom/vnode */  {
  return $concur_dom.h("div", $concur_props.props(), $std_core.vector_3($std_core.Cons($concur_dom.h("h1", $concur_props.props(), $std_core.vector_3($std_core.Cons($concur_dom.t($std_core.show_1(count)), $std_core.Nil))), $std_core.Cons($concur_dom.h("button", $concur_props.props_1($std_core.Cons($std_core._tuple2_("onclick", $concur_props.mkHandler0(function() {
                return render($std_core._int_sub(count,1), st0);
              })), $std_core.Nil)), $std_core.vector_3($std_core.Cons($concur_dom.t("-"), $std_core.Nil))), $std_core.Cons($concur_dom.h("button", $concur_props.props_1($std_core.Cons($std_core._tuple2_("onclick", $concur_props.mkHandler0(function() {
                  return render($std_core._int_add(count,1), st0);
                })), $std_core.Nil)), $std_core.vector_3($std_core.Cons($concur_dom.t("+"), $std_core.Nil))), $std_core.Nil)))));
}
 
// Main
function main() /* () -> <st<sys/dom/types/hdom>,pure,ui,net,console,ndet> () */  {
  var prevNode0 = { value: ($std_core.Nothing) };
  return $sys_dom.withWindow(function($window /* sys/dom/types/window */ ) {
    return render(0, St(prevNode0, (($window).document).body));
  });
}
 
// exports
$concur = $std_core._export($concur, {
  St          : St,
  prevNode    : prevNode,
  container   : container,
  _copy       : _copy,
  render      : render,
  view        : view,
  main        : main
});
return $concur;
});