// Koka generated module: "concur/props", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['./std_core'], function($std_core) {
"use strict";
var $concur_props  = {};
 
// externals
function _props_list(list) {
  var newProp = {};
  while(list && list.head) {
    var x = list.head
    newProp[x.fst] = x.snd
    list = list.tail
  }
  return newProp
}
 
// type declarations
// type prop
// type props
 
// declarations
 
// Index into props
function _index_(p, s) /* forall<a> (p : props<a>, s : string) -> maybe<a> */  {
  if (((p)[s]!==undefined)) {
    return $std_core.Just(((p)[s]));
  }
  else {
    return $std_core.Nothing;
  }
}
 
/* Handler with no args */
function mkHandler0(_arg1) /* forall<e> (() -> e ()) -> prop */  {
  return _arg1;
}
 
// Create a prop
function props() /* forall<a> () -> props<a> */  {
  return {};
}
 
// Create new props from a `:list` of key value pairs.
function props_1(elems) /* forall<a> (elems : list<(string, a)>) -> props<a> */  {
  return _props_list(elems);
}
function unsafe_props_add(d, k, v) /* forall<a> (d : props<a>, k : string, v : a) -> props<a> */  {
  return ((d)[k]=(v));
}
 
// exports
$concur_props = $std_core._export($concur_props, {
  _index_     : _index_,
  mkHandler0  : mkHandler0,
  props       : props,
  props_1     : props_1,
  unsafe_props_add: unsafe_props_add
});
return $concur_props;
});