// Koka generated module: "interactive", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['./std_core', './concur'], function($std_core, $concur) {
"use strict";
var $interactive  = {};
 
// externals
 
// type declarations
 
// declarations
function _expr() /* () -> <st<sys/dom/types/hdom>,pure,ui,net,console,ndet> () */  {
  return $concur.main();
}
 
// main entry:
_expr($std_core.id);
 
// exports
$interactive = $std_core._export($interactive, {
  _expr       : _expr
});
return $interactive;
});