// Koka generated module: "std/data/dict", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['./std_core'], function($std_core) {
"use strict";
var $std_data_dict  = {};
 
// externals
/*---------------------------------------------------------------------------
  Copyright 2012 Microsoft Corporation.
 
  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/
// make a shallow copy
function _dict_copy(obj) {
  var newobj = {};
  for( var prop in obj) {
    if (obj.hasOwnProperty(prop)) newobj[prop] = obj[prop];
  }
  return newobj;
}
// get the fields of an object
function _dict_keys(obj) {
  var props = [];
  for (var prop in obj) {
    if (prop[0]==="/") props.push(prop.substr(1));
  } 
  return props;
}
// clear 
function _dict_clear(obj) {
  for (var prop in obj) {
    if (prop[0]==="/") delete obj[prop];
  }
}
function _dict_assign(obj,key,val) {
  if (obj['/'+key] === undefined) obj._count++;
  obj['/'+key] = val;
}
 
// type declarations
// type dict
// type mdict
 
// declarations
function dict_copy(d) /* forall<a> (d : dict<a>) -> dict<a> */  {
  return _dict_copy(d);
}
 
// Return the keys in a dictionary
function keys(d) /* forall<a,h> (d : mdict<h,a>) -> (read<h>) vector<string> */  {
  return _dict_keys(d);
}
 
// Return the keys in a
function keys_1(d) /* forall<a> (d : dict<a>) -> vector<string> */  {
  return _dict_keys(d);
}
 
// Index into a string dictionary
function _index_(md, s) /* forall<a,h> (md : mdict<h,a>, s : string) -> (read<h>) maybe<a> */  {
  if (((md)['/' + s]!==undefined)) {
    return $std_core.Just(((md)['/' + s]));
  }
  else {
    return $std_core.Nothing;
  }
}
 
// Assign to a string dictionary
function _lb__rb__1(md, s, assigned) /* forall<a,h> (md : mdict<h,a>, s : string, assigned : a) -> (write<h>) () */  {
  return _dict_assign(md,s,assigned);
}
 
// Index into a string dictionary
function _lb__rb__2(d, key) /* forall<a> (d : dict<a>, key : string) -> maybe<a> */  {
  if (((d)['/' + key]!==undefined)) {
    return $std_core.Just(((d)['/' + key]));
  }
  else {
    return $std_core.Nothing;
  }
}
function clear(md) /* forall<a,h> (md : mdict<h,a>) -> (write<h>) () */  {
  return _dict_clear(md);
}
function copy(md) /* forall<h,a> (md : mdict<h,a>) -> <alloc<h>,read<h>> mdict<h,a> */  {
  return _dict_copy(md);
}
function count(md) /* forall<a,h> (md : mdict<h,a>) -> int */  {
  return md._count;
}
 
// Freeze a mutable dictionary into a `:dict`
function freeze(md) /* forall<h,a> (md : mdict<h,a>) -> <alloc<h>,read<h>> dict<a> */  {
  return _dict_copy(md);
}
 
// Create a mutable string dictionary
function mdict() /* forall<h,a> () -> (alloc<h>) mdict<h,a> */  {
  return { _count: 0 };
}
function remove(md, s) /* forall<a,h> (md : mdict<h,a>, s : string) -> <read<h>,write<h>> () */  {
  return delete md['/'+s];
}
 
// Execute action for each key/value pair in a dictionary until
// the action returns `Just`.
function _bind_foreach_while(d, action) /* forall<a,b,e> (d : dict<a>, action : (string, a) -> e maybe<b>) -> e maybe<b> */  {
  return $std_core._bind_foreach_while_3(keys_1(d), function(k /* string */ ) {
      return action(k, ((d)['/' + k]));
    });
}
 
// Execute action for each key/value pair in a dictionary until
// the action returns `Just`.
function _fast_foreach_while(d, action) /* forall<a,b,e> (d : dict<a>, action : (string, a) -> e maybe<b>) -> e maybe<b> */  {
  return $std_core._fast_foreach_while_3(keys_1(d), function(k /* string */ ) {
      return action(k, ((d)['/' + k]));
    });
}
 
// Execute action for each key/value pair in a dictionary until
// the action returns `Just`.
function foreach_while(d, action) /* forall<a,b,e> (d : dict<a>, action : (string, a) -> e maybe<b>) -> e maybe<b> */  {
  return _bind_foreach_while(d, action);
}
 
// Execute action for each key/value pair in a dictionary.
function _bind_foreach(d, action) /* forall<a,e> (d : dict<a>, action : (string, a) -> e ()) -> e () */  {
  return $std_core._bind((_bind_foreach_while(d, function(k /* string */ , x /* 924 */ ) {
      return $std_core._bind((action(k, x)),(function(__ /* () */ ) {
        return $std_core.Nothing;
      }));
    })),(function(__0 /* maybe<void> */ ) {
    return $std_core._unit_;
  }));
}
 
// Execute action for each key/value pair in a dictionary.
function _fast_foreach(d, action) /* forall<a,e> (d : dict<a>, action : (string, a) -> e ()) -> e () */  {
  _fast_foreach_while(d, function(k /* string */ , x /* 924 */ ) {
      action(k, x);
      return $std_core.Nothing;
    });
  return $std_core._unit_;
}
 
// Execute action for each key/value pair in a dictionary.
function foreach(d, action) /* forall<a,e> (d : dict<a>, action : (string, a) -> e ()) -> e () */  {
  return _bind_foreach(d, action);
}
 
// Append two dictionaries.
function _plus_(d1, d2) /* forall<a> (d1 : dict<a>, d2 : dict<a>) -> dict<a> */  {
  var dnew = dict_copy(d1);
  foreach(d2, function(key /* string */ , value /* 988 */ ) {
      return _dict_assign(dnew,key,value);
    });
  return dnew;
}
 
// Create a new empty dictionary
function dict() /* forall<a> () -> dict<a> */  {
  return { _count: 0 };
}
 
// Create a new dictionary from a `:list` of key value pairs.
function dict_1(elems) /* forall<a> (elems : list<(string, a)>) -> dict<a> */  {
  var d = dict();
  $std_core.foreach(elems, function(elem /* (string, 1094) */ ) {
      return _dict_assign(d,(elem.fst),(elem.snd));
    });
  return d;
}
 
// Create a new dictionary from a `:vector` of key/value pairs.
function dict_2(elems) /* forall<a> (elems : vector<(string, a)>) -> dict<a> */  {
  var d = dict();
  $std_core.foreach_3(elems, function(elem /* (string, 1178) */ ) {
      return _dict_assign(d,(elem.fst),(elem.snd));
    });
  return d;
}
 
// Map a fun over the values in a dictionary.
function _bind_map(d, f) /* forall<a,b,e> (d : dict<a>, f : (string, a) -> e b) -> e dict<b> */  {
  return $std_core._bind(($std_core._bind_map_7(keys_1(d), function(k /* string */ ) {
      return $std_core._bind((f(k, ((d)['/' + k]))),(function(_y_8 /* 1608 */ ) {
        return $std_core._tuple2_(k, _y_8);
      }));
    })),(function(_y_10 /* vector<(string, 1608)> */ ) {
    return dict_2(_y_10);
  }));
}
 
// Map a fun over the values in a dictionary.
function _fast_map(d, f) /* forall<a,b,e> (d : dict<a>, f : (string, a) -> e b) -> e dict<b> */  {
  return dict_2($std_core._fast_map_7(keys_1(d), function(k /* string */ ) {
      return $std_core._tuple2_(k, f(k, ((d)['/' + k])));
    }));
}
 
// Map a fun over the values in a dictionary.
function map(d, f) /* forall<a,b,e> (d : dict<a>, f : (string, a) -> e b) -> e dict<b> */  {
  return _bind_map(d, f);
}
 
// Convert a dictionary to a vector of key/value pairs
function vector(d) /* forall<a,h> (d : mdict<h,a>) -> (read<h>) vector<(string, a)> */  {
  return $std_core.map_7(keys(d), function(key /* string */ ) {
      return $std_core._tuple2_(key, ((d)['/' + key]));
    });
}
 
// Convert a dictionary to a vector of key/value pairs
function vector_1(d) /* forall<a> (d : dict<a>) -> vector<(string, a)> */  {
  return $std_core.map_7(keys_1(d), function(key /* string */ ) {
      return $std_core._tuple2_(key, ((d)['/' + key]));
    });
}
 
// Convert a dictionary to a list of key/value pairs
function list(d) /* forall<a,h> (d : mdict<h,a>) -> (read<h>) list<(string, a)> */  {
  return $std_core.list_5(vector(d));
}
 
// Convert a dictionary to a list of key/value pairs
function list_1(d) /* forall<a> (d : dict<a>) -> list<(string, a)> */  {
  return $std_core.list_5(vector_1(d));
}
 
// exports
$std_data_dict = $std_core._export($std_data_dict, {
  dict_copy   : dict_copy,
  keys        : keys,
  keys_1      : keys_1,
  _index_     : _index_,
  _lb__rb__1  : _lb__rb__1,
  _lb__rb__2  : _lb__rb__2,
  clear       : clear,
  copy        : copy,
  count       : count,
  freeze      : freeze,
  mdict       : mdict,
  remove      : remove,
  _bind_foreach_while: _bind_foreach_while,
  _fast_foreach_while: _fast_foreach_while,
  foreach_while: foreach_while,
  _bind_foreach: _bind_foreach,
  _fast_foreach: _fast_foreach,
  foreach     : foreach,
  _plus_      : _plus_,
  dict        : dict,
  dict_1      : dict_1,
  dict_2      : dict_2,
  _bind_map   : _bind_map,
  _fast_map   : _fast_map,
  map         : map,
  vector      : vector,
  vector_1    : vector_1,
  list        : list,
  list_1      : list_1
});
return $std_data_dict;
});