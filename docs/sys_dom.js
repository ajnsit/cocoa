// Koka generated module: "sys/dom", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['./std_core', './sys_dom_types'], function($std_core, $sys_dom_types) {
"use strict";
var $sys_dom  = {};
 
// externals
 
// type declarations
 
// declarations
function _bind_applyWindow(action) /* forall<e> (action : (sys/dom/types/window) -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> bool */  {
  return (typeof window !== 'undefined' ? (function(){ (action)(window); return true; })() : false);
}
function _fast_applyWindow(action) /* forall<e> (action : (sys/dom/types/window) -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> bool */  {
  return (typeof window !== 'undefined' ? (function(){ (action)(window); return true; })() : false);
}
function applyWindow(action) /* forall<e> (action : (sys/dom/types/window) -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> bool */  {
  return _bind_applyWindow(action);
}
 
// Execute an action on a specified interval.
function _bind_interval(msecs, action) /* forall<e> (msecs : int, action : () -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return window.setInterval(action,msecs);
}
 
// Execute an action on a specified interval.
function _fast_interval(msecs, action) /* forall<e> (msecs : int, action : () -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return window.setInterval(action,msecs);
}
 
// Execute an action on a specified interval.
function interval(msecs, action) /* forall<e> (msecs : int, action : () -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return _bind_interval(msecs, action);
}
 
// Execute an action after a specified time out.
function _bind_timeout(msecs, action) /* forall<e> (msecs : int, action : () -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return window.setTimeout(action,msecs);
}
 
// Execute an action after a specified time out.
function _fast_timeout(msecs, action) /* forall<e> (msecs : int, action : () -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return window.setTimeout(action,msecs);
}
 
// Execute an action after a specified time out.
function timeout(msecs, action) /* forall<e> (msecs : int, action : () -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return _bind_timeout(msecs, action);
}
 
// Execute an action that gains access to the global ":window" object.
function _bind_withWindow(action) /* forall<e> (action : (sys/dom/types/window) -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return $std_core._bind((_bind_applyWindow(action)),(function(success /* bool */ ) {
    return (!(success)) ? $std_core.error("this application can only run inside a browser") : $std_core._unit_;
  }));
}
 
// Execute an action that gains access to the global ":window" object.
function _fast_withWindow(action) /* forall<e> (action : (sys/dom/types/window) -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  var success = _fast_applyWindow(action);
  return (!(success)) ? $std_core.error("this application can only run inside a browser") : $std_core._unit_;
}
 
// Execute an action that gains access to the global ":window" object.
function withWindow(action) /* forall<e> (action : (sys/dom/types/window) -> <sys/dom/types/dom|e> ()) -> <sys/dom/types/dom|e> () */  {
  return _bind_withWindow(action);
}
 
// exports
$sys_dom = $std_core._export($sys_dom, {
  _bind_applyWindow: _bind_applyWindow,
  _fast_applyWindow: _fast_applyWindow,
  applyWindow : applyWindow,
  _bind_interval: _bind_interval,
  _fast_interval: _fast_interval,
  interval    : interval,
  _bind_timeout: _bind_timeout,
  _fast_timeout: _fast_timeout,
  timeout     : timeout,
  _bind_withWindow: _bind_withWindow,
  _fast_withWindow: _fast_withWindow,
  withWindow  : withWindow
});
return $sys_dom;
});