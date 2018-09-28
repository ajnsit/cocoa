// Koka generated module: "std/core", koka version: 0.9.0-dev
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define([], function() {
"use strict";
var $std_core  = {};
 
// externals
/*---------------------------------------------------------------------------
  Copyright 2017 Daan Leijen, Microsoft Corporation.
  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------
  Copyright 2017 Daan Leijen & Manuel Serrano
  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/
function __extends(d, b) {
  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  function __() { this.constructor = d; }
  __.prototype = b.prototype;
  d.prototype = new __();
};
var Eff = (function() {
/*---------------------------------------------------------------------------
  Copyright 2017 Daan Leijen & Manuel Serrano
  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/
"use strict";
/*---------------------------------------------------------------------------
General notes:
- _functions starting with an underscore are meant to be private
General design:
* Bind and Yield:
  - To get results from effectful functions use `bind`. For example, `return bind( get(), function(i) {... })`
  - Effectful functions either return with their result, or they return a _yield_ object.
  - Yielding consists of returning an object of the form:
    ```
    { cont      : a -> b  // the continuation to resume with a result for the yielded operation (like `moveNext`)
      op_arg    : c       // the operation argument (like an integer for a `set` operation)
      handler   : handler // the handler that handles the effect
      branch    : branch  // the branch in the handler that handles this operation
    }
    ```
    where the operation has type, `c -> a`, and the action argument to the handler has a
    result type `b`.
  - A `bind` operation extends the continuation field `cont` to be able to resume correctly
* Handlers and the handler stack:
  - A handler is described as:
    ```
    { effect_name: string    // the effect being handled, like `amb`
      return_fun: function  // a function applied to the result of the action passed to the handler
      branches  : [branch]  // a vector of branches, one for each operation in the effect
    }
    ```
  - Handlers are pushed on the global handler stack when enabled
  - When an operation yields, it first finds the innermost handler on this handler stack
    and also the branch that handles the particular operation.
* Branches
  - A branch handles a particular operation:
    ```
    { op_tag     : string,   // the operation tag being handled, like `get` or `set`
      resume_kind: int,      // the kind of resume: a tail-resumptive branch or a regular one?
      branch_fun : (resume,op_arg,local) -> a   // the actual handling function for `op_tag`
    }
    ```
* Tail resumptive branches:
  - For branches that are _tail resumptive_, we ensure that we yield them to the
    handlers one up to enable running in constant stack space (even through binds).
* Exceptions
  - todo
---------------------------------------------------------------------------*/
function _assert(b,msg) {
  //msg = msg || "no message";
  //throw new Error("Assertion failed: " + msg );
}
function id(x) {
  return x;
}
// Different resume kinds for branches: used for potential optimizations (`Normal` is always correct to use).
// Especially branches that `Tail` resume are very common and should be optimized well: in this library
// these are resolved to direct method calls without needing to unwind/rewind the stack.
// Branches that are
const _resume_kind = {
  Never      : 0,    // never calls `resume`.
  Tail       : 1,    // calls `resume` at most once as the last thing to do (or does not resume at all). (and the handler is not `Shallow`)
  ScopedOnce : 2,    // at most once, and in the scope of the branch
  Scoped     : 3,    // calls `resume` in the scope of the branch
  Once       : 4,    // calls `resume` at most once, perhaps outside the scope of the branch.
  Normal     : 5,    // first-class resumption: calls `resume` once or many times
  OnceRaw    : 6,    // variants of Once and Normal that do not implicitly finalize()
  NormalRaw  : 7,
};
const _handler_kind = {
  Deep   : 0,
  Linear : 1,
  Shallow: 2,
  _Skip  : -1,
  _Inject: -2,
};
function Yield( handler, branch, op_arg ) {
  this.cont    = _cont_id;
  this.op_arg  = op_arg;
  this.handler = handler;
  this.branch  = branch;
  // these fields are used to efficiently communicate values in `_handle_result`
  this.local   = undefined;
  this.match   = false;
}
function ExceptionValue(exn) {
  this.exn = exn;
}
function _cont_id( arg ) {
  if (arg instanceof ExceptionValue) throw arg.exn;
  return arg;
}
/*----------------------------------------------------------------
  Operation branches
----------------------------------------------------------------*/
// Create an handler branch, i.e. the function that is called for a particular operation
// The `branch_fun` takes 3 arguments:
//   (resume,op_arg,local)
// where `op_arg` the operation and `local` the current local state of a parameterized handler.
// The `resume` function takes 2 arguments:
//   (result,new_local)
// where `result` is the resume result, and `new_local` the new local state of the parameterized handler.
function Branch( resume_kind, op_tag, branch_fun ) {
  this.resume_kind = resume_kind;
  this.op_tag      = op_tag;
  this.branch_fun  = branch_fun;
}
function new_branch( resume_kind, op_tag, branch_fun ) {
  return new Branch(resume_kind, op_tag, branch_fun );
}
function new_branch_never( op_tag, branch_fun ) {
  return new_branch(_resume_kind.Never,op_tag,branch_fun);
}
function new_branch_once( op_tag, branch_fun ) {
  return new_branch(_resume_kind.Once,op_tag,branch_fun);
}
function new_branch_tail( op_tag, branch_fun ) {
  return new_branch(_resume_kind.Tail,op_tag,branch_fun);
}
function new_branch_normal( op_tag, branch_fun ) {
  return new_branch(_resume_kind.Normal,op_tag,branch_fun);
}
function new_branch_scoped_once( op_tag, branch_fun ) {
  return new_branch(_resume_kind.ScopedOnce,op_tag,branch_fun);
}
function new_branch_scoped( op_tag, branch_fun ) {
  return new_branch(_resume_kind.Scoped,op_tag,branch_fun);
}
/*----------------------------------------------------------------
  Handlers
----------------------------------------------------------------*/
var _handler_tags = 1;
function HandlerInfo(effect_name, reinit_fun, return_fun, finally_fun,
                     branches, skip, handler_kind, handler_tag)
{
  this.effect_name = effect_name;
  this.handler_tag = (handler_tag ? handler_tag : _handler_tags++);
  this.handler_kind= (handler_kind ? handler_kind : _handler_kind.Deep);
  this.skip        = (skip ? skip : 0);
  this.branches    = branches;
  this.reinit_fun  = reinit_fun;
	this.return_fun  = return_fun;
  this.finally_fun = finally_fun;
}
// Note: even for handlers without local state we need to allocate
// a `Handler` as these are also used to identify a handler on the stack
// uniquely.
function Handler( hinfo, local ) {
  this.info = hinfo;
  this.local = local;
}
/*----------------------------------------------------------------
  Bind, yield
----------------------------------------------------------------*/
// Bind a result of an effectful computation to the `next` function.
// When the effectful computation yielded on operation, we can remember where to continue (namely the `next` function)
function bind( x, next ) {
  if (x instanceof Yield) {
    const cont = x.cont; // capture locally
    x.cont = function(arg) { return bind(cont(arg),next); };
    return x;
  }
  else {
    return next(x);
  }
}
function bind_const( x, y ) {
	if (x instanceof Yield) {
    const cont = x.cont; // capture locally
    x.cont = function(arg) { return bind_const(cont(arg),y); };
    return x;
  }
  else return y;
}
/*----------------------------------------------------------------
  The handler stack
----------------------------------------------------------------*/
// The global handler stack
const _handlers = [];
function _handlers_push_hinfo( hinfo, local ) {
  return _handlers_push( new Handler(hinfo,local) );
}
// Note: use carefully as regular handlers are assumed to be unique on the stack
// This is only used to by skip- and inject frames.
function _handlers_push(h) {
  _handlers.push(h);
  return h;
}
function _handlers_pop(expected) {
  const h = _handlers.pop();
  _assert(h === expected, "Handler stack is out of sync!");
  return h.local;
}
function _handlers_top(idx_from_top) {
  return _handlers[_handlers.length - 1 - idx_from_top];
}
/*----------------------------------------------------------------
  Cancel Exceptions
----------------------------------------------------------------*/
// System exceptions are not handled by `catch` but do run finalizers.
const SystemException = (function() {
  __extends(SystemException,Error);
  function SystemException( message ) {
    this.message = message || "Internal system exception";
    if ("captureStackTrace" in Error) {
      Error.captureStackTrace(this,SystemException);  // best on Node.js
    }
    else {
      this.stack = (new Error()).stack; // in browsers
    }
  }
  return SystemException;
})();
const FinalizeException = (function() {
  __extends(FinalizeException,SystemException);
  function FinalizeException( handler, value ) {
    SystemException.call(this,"Internal finalize exception");
    this.handler = handler;
    this._value  = value;
  }
  FinalizeException.prototype.get_value = function() {
    if (this._value instanceof ExceptionValue) throw this._value.exn;
    return this._value;
  }
  FinalizeException.prototype.get_message = function() {
    const hinfo = this.handler.info;
    return this.message + " (to " + _show_effect(hinfo.effect_name,hinfo.handler_tag) + ")";
  }
  return FinalizeException;
})();
/*----------------------------------------------------------------
  Yield
----------------------------------------------------------------*/
// Yielding an operation consists finding the handler and returning a yield object.
// The `_resume_tail_count` counter ensures that every once in a while
// we fully yield a tail-resumptive operation instead of optimizing so we unwind the stack
// of `bind`'s and ensure tail-recursive functions with `bind`s do not run out of stack space.
let _resume_tail_count = 0;
let _max_resume_tails  = 100;
function _handlers_find( effect_name, handler_tag, op_name ) {
  // find our handler in the global handler stack
  if (handler_tag===undefined) handler_tag = 0;
  const n = _handlers.length;
  let inject = 0;
  let i;
  // for all handlers..
  for(i = n - 1; i >= 0; i--) {
    const handler = _handlers[i];
    const hinfo = handler.info;
    if (hinfo.effect_name === effect_name &&
        (handler_tag === 0 || hinfo.handler_tag === handler_tag))
    {
      // we match on the handler effect + handler_tag
      if (hinfo.handler_kind===_handler_kind._Inject) inject++;   // inject effect
      else if (inject > 0) inject--;     // skip over this handler due to previous injection
      else return i;
    }
    i -= hinfo.skip; // skip over skip frames
  }
  const msg = "use of " + (handler_tag ? "a resource" : "an operation") +
               " outside of its handler scope: " + _show_effect(effect_name,handler_tag) + "/" + op_name;
  throw new Error(msg);
}
function yield_op( effect_name, op_name, op_arg, op_tag, handler_tag ) {
  if (op_tag==null) op_tag = op_name;
  // find our handler in the global handler stack
  const i      = _handlers_find(effect_name, handler_tag, op_name);
  const handler= _handlers[i];
  const hinfo  = handler.info;
  const skip   = _handlers.length - i;
  const branch = hinfo.branches[op_tag];
  if (branch==null) throw new Error("bad handler: operation " + op_name + " is not found in the handler for " + _show_effect(effect_name,handler_tag));
  const is_linear = (hinfo.handler_kind === _handler_kind.Linear);
  if (is_linear || (branch.resume_kind <= _resume_kind.Tail && _resume_tail_count < _max_resume_tails)) {
    if (!is_linear) _resume_tail_count++;
    // The handler uses a tail resumption: optimize it by directly
    // calling the branch function without any unwinding.
    // This is important in practice as 95% of all operation handlers are tail-resumptions.
    //return _call_tail_branch(handler,branch,skip,op_arg);  // Inline for performance
    const skipframe = _cached_skip_frame(skip);
    _handlers_push(skipframe);
    let res;
    try {
      res = branch.branch_fun( _context_skip_tail, op_arg, handler.local );
    }
    catch(exn) {
      // an exception was raised; this causes the implicit finalize to be
      // executed (section 8.5) and thus we continue here with finalization
      if (exn instanceof FinalizeException) {
        throw exn;
      }
      else {
        throw new FinalizeException( handler, new ExceptionValue(exn) );
      }
    }
    finally {
      _handlers_pop(skipframe);
    }
    if (res instanceof _TailResume) {
      if (res.local !== undefined) handler.local = res.local;
      return res.result;
    }
    else {
      return _skip_handle_yield( handler, res, skipframe );
    }
  }
  else {
    // Regular yield up to the handler we found
    _resume_tail_count = 0;
    return new Yield(handler,branch,op_arg);
  }
}
function _show_effect(effect_name, handler_tag) {
  return effect_name + (handler_tag ? "." + handler_tag.toString() : "");
}
function _show_handler(hinfo) {
  return _show_effect(hinfo.effect_name,hinfo.handler_tag);
}
function _show_operation(hinfo,branch) {
  return _show_handler(hinfo) + "." + branch.op_tag.toString();
}
/* ----------------------------------------------------------------
  Skip frames: skip on a first read :-)
  When doing direct calls to tail-resumptive branches, we push
  a skip frame to ensure that any operations in a handler are not handled
  by any operations under it in the handler stack.
  There are other approaches, like popping and restorign the handler stack,
  but this seems most efficient?
----------------------------------------------------------------*/
// Special effect tag of skip handlers
const _effect_skip = "<skip>";
// Cache allocation of common skip frames
function _new_skip_frame(skip) {
  return new Handler( new HandlerInfo( "<skip>",null,null,null,[],skip,_handler_kind._Skip,0) );
}
const _skip_frame1 = _new_skip_frame(1);
const _skip_frame2 = _new_skip_frame(2);
const _skip_frame3 = _new_skip_frame(3);
function _cached_skip_frame(skip) {
  if (skip===1)      return _skip_frame1;
  else if (skip===2) return _skip_frame2;
  else if (skip===3) return _skip_frame3;
  else return _new_skip_frame(skip);
}
// Resume in a tail-resumptive branch
function _skip_resume( handler, skipframe, cont, arg ) {
  _handlers_push(skipframe);
  var res;
  try {
    res = cont(arg);
  }
  catch(exn) {
    // an exception was raised; this causes the implicit finalize to be
    // executed (section 8.5) and thus we continue here with finalization
    if (exn instanceof FinalizeException) {
      throw exn;
    }
    else {
      throw new FinalizeException( handler, new ExceptionValue(exn) );
    }
  }
  finally {
    _handlers_pop(skipframe);
  }
  return _skip_handle_yield( handler, res, skipframe );
}
// Handle the result of a tail-resumptive branch
function _skip_handle_yield( handler, res, skipframe ) {
  _assert( _handlers_top(skipframe.skip - 1) === handler, "skipframe does not match handler");
  if (res instanceof _TailResume) {
    if (res.local !== undefined) handler.local = res.local;
    return res.result;
  }
  else if (res instanceof Yield) {
    // extend the continuation with the skip frame
    const cont = res.cont; // capture locally
    res.cont = function(arg) {
      return _skip_resume( handler, skipframe, cont, arg );
    }
    // and reyield
    return res;
  }
  else {
    // we returned normally without resuming, or yielding!
    // in this case we need auto finalize back to our handler
    // (because we assume an implicit finalize around every (tail resumptive) branch)
    throw new FinalizeException(handler, res);
  }
}
/*----------------------------------------------------------------
  Create a handler
----------------------------------------------------------------*/
// Create a handler for a given effect
function _new_handlerx( effect_name, reinit_fun, return_fun, finally_fun,
                        branches0, handler_kind, handler_tag, wrap_handler_tag)
{
  // initialize the branches such that we can index by `op_tag`
  // regardless if the `op_tag` is a number or string.
  const branches = new Array(branches0.length);
  for(let i = 0; i < branches0.length; i++) {
    const branch = branches0[i];
    branches[branch.op_tag] = branch;
    if (typeof op_tag !== "number") branches[i] = branch;
  }
  var shared_hinfo = null;
  // return a handler function: `action` is executed under the handler.
  return (function(action,local) {
    // only resources need to recreate the `hinfo` due to the handlertag
    // todo: also store the handler tag in the Handler instead of the Info
    var hinfo = shared_hinfo;
    if (hinfo==null) {
      hinfo = new HandlerInfo(effect_name, reinit_fun, return_fun, finally_fun,
                                     branches, 0, handler_kind, handler_tag);
    }
    if (wrap_handler_tag==null && shared_hinfo==null) {
      shared_hinfo = hinfo;
    }
	  // the handler action gets the resource argument (the identifier of the handler)
		const haction = function() {
                      const resource = (wrap_handler_tag==null ? hinfo.handler_tag :
                                                                 wrap_handler_tag(hinfo.handler_tag));
                      return yield_iter( action( resource ) ); // autoconvert from iterators
                    };
    return _handle_action(hinfo, local, haction );
  });
}
function new_empty_handler( reinit_fun, return_fun, finally_fun ) {
  return (function(action) {
    var haction = (return_fun == null ? action :
                   function() { return bind(action(), return_fun); });
    if (reinit_fun==null && finally_fun==null) {
      return haction();
    }
    else {
      return handle_finally( haction, finally_fun, reinit_fun );
    }
  });
}
function new_empty_handler1( reinit_fun, return_fun, finally_fun ) {
  return (function(local,action) {
    var haction = (return_fun == null ? action :
                   function() { return bind(action(), function(x) {
                                  return return_fun(x,local) }
                                );
                              });
    if (reinit_fun==null && finally_fun==null) {
      return haction();
    }
    else {
      return handle_finally( haction,
        function(){ return finally_fun(local) },
        function(){ local = reinit_fun(local); }
      );
    }
  });
}
function new_handler( effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind ) {
  return _new_handlerx( effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind, 0, null );
}
function new_handler_linear( effect_name, reinit_fun, return_fun, finally_fun, branches ) {
  return new_handler(effect_name,reinit_fun,return_fun,finally_fun,branches,_handler_kind.Linear);
}
function new_handler_shallow( effect_name, reinit_fun, return_fun, finally_fun,   branches ) {
  return new_handler(effect_name,reinit_fun,return_fun,finally_fun,branches,_handler_kind.Shallow);
}
function new_handler1( effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind ) {
  const h = new_handler(effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind);
  return (function(local,action) { return h(action,local); });
}
function new_handler1_linear( effect_name, reinit_fun, return_fun, finally_fun, branches ) {
  return new_handler1(effect_name, reinit_fun, return_fun, finally_fun, branches, _handler_kind.Linear);
}
function new_handler1_shallow( effect_name, reinit_fun, return_fun, finally_fun, branches ) {
  return new_handler1(effect_name, reinit_fun, return_fun, finally_fun, branches, _handler_kind.Shallow);
}
function new_resource_handler( effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind, handler_tag, wrap_handler_tag ) {
  return _new_handlerx( effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind, handler_tag, wrap_handler_tag );
}
function new_resource_handler1( effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind, handler_tag, wrap_handler_tag ) {
  const h = new_resource_handler(effect_name, reinit_fun, return_fun, finally_fun, branches, handler_kind, handler_tag, wrap_handler_tag );
  return (function(local,action) { return h(action,local); });
}
/*----------------------------------------------------------------
  Handler invokation
----------------------------------------------------------------*/
// Run action under a handler
function _handle_action( hinfo, local, action ) {
  return _handle_resume( hinfo, local, action, undefined );
}
function _handle_resume( hinfo, local, cont, arg ) {
  const handler = _handlers_push_hinfo(hinfo,local);
  return _handle_result( hinfo, _handle_cont_pushed(handler, cont, arg) );
}
function _handle_resume_pushed( handler, cont, arg ) {
  return _handle_result( handler.info, _handle_cont_pushed(handler, cont, arg) );
}
function _handle_cont( hinfo, local, cont, arg ) {
  const handler = _handlers_push_hinfo(hinfo,local);
  return _handle_cont_pushed( handler, cont, arg);
}
// Execute under a handler
function _handle_cont_pushed(handler,cont,arg) {
  const hinfo = handler.info;
  var result;
  var local;
  try {
    result = cont(arg);
    local = _handlers_pop(handler);
  }
  catch(exn) {
    // rule (unwind), fig 9.
		local = _handlers_pop(handler);  // pop handler before calling finally
    const finally_fun = (hinfo.finally_fun || _cont_id);
		return bind( finally_fun(local), function(_res) {
      if (exn instanceof FinalizeException && exn.handler === handler) {
        return exn.get_value();  // might throw
      }
      else {
        throw exn;
      }
  	});
  }
  if (result instanceof Yield) {
    if (result.handler===handler) {
      // optimize: communicate local and handler match through the yield result..
      result.local = local;
      result.match = true;
    }
    else {
      // not handled by us: extend the continuation to resume under our handler.
      const cont  = result.cont; // capture locally
      let resume_count = 0;
      result.cont = function(arg) {
        resume_count++;
        // if we resume more than once, reinit_fun clauses can reinitialize the local state
        if (resume_count > 1 && hinfo.reinit_fun != null) {
          return bind( hinfo.reinit_fun(local), function(newlocal) {
            return _handle_resume( hinfo, newlocal, cont, arg );
          });
        }
        else {
          return _handle_resume( hinfo, local, cont, arg  );
        }
      }
    }
    return result;
  }
  // final result, execute return and finally clause
  // rule (return), fig 5.
  else if (hinfo.finally_fun != null) {
    return _bind_finally( hinfo, local,
                          function(_res){
                            return (hinfo.return_fun==null ? result : hinfo.return_fun(result,local));
                          }, result );
  }
  else if (hinfo.return_fun != null) {
    return hinfo.return_fun(result,local);
  }
  else return result;
}
/*----------------------------------------------------------------
  The core handling function of operations
----------------------------------------------------------------*/
// Process the result of handling an actions
function _handle_result(hinfo,result) {
  // the "trampoline" ensures that `resume` calls don't use extra stack space.
  while(result instanceof Yield && result.match) {
     // handle the operation
    const branch = result.branch;
    let context;
    if (branch.resume_kind===_resume_kind.Never) {
      context = _context_never;
    }
    else if (branch.resume_kind <= _resume_kind.Scoped && hinfo.handler_kind !== _handler_kind.Shallow) {
      // `resume` is yielded as a special operation; todo: allow this for shallow resumptions too?
      context = new ContextTail(hinfo,branch,result.cont);
    }
    else {
      // `resume` directly, will use more stack space since it calls `_handle_op` again
      context = new ContextNormal(hinfo,branch,result.cont);
    }
    result = _branch_invoke( branch, context, result.op_arg, result.local);
  }
  return result;
}
function _bind_finally( hinfo, local, f, x ) {
  // section 8.4: return as an operation
	var result;
	try {
		result = f(x);
		if (result instanceof Yield) {
			const cont = result.cont;
			result.cont = function(arg) {
				return _bind_finally( hinfo, local, cont, arg );
			}
			return result;
		}
	}
	catch(exn) {
		return bind( hinfo.finally_fun(local), function(_res) {
			throw exn;
		});
	}
	return bind_const(hinfo.finally_fun(local), result );
}
function _branch_invoke( branch, context, arg, local ) {
  // rule (handle_d), fig 10.
	return _protect( context, function(_arg) {
    if (branch.resume_kind >= _resume_kind.OnceRaw) {
      context.suppress_auto_finalize();
    }
    return branch.branch_fun( context, arg, local );
	}, null);
}
// This implements a `protect` frame around a branch,
// ensuring that the finalizer is always called implicitly even in
// the case of exceptions. Due to deep handlers, this will also
// invoke the finally clause of the handler of the branch itself.
// rule (protect) and (unprotect), fig 10.
// note: in contract to the rules, we also use implicit finalize around
// every branch unless auto finalization is suppressed.
function _protect( context, cont, arg ) {
	try {
		var result = cont(arg);
		if (result instanceof Yield) {
			if (!context.invoked) {
				// only extend the continuation the context is not already invoked
        // (through resume or finalize).
				const cont = result.cont;
				result.cont = function(arg) {
					return _protect( context, cont, arg );
				}
			}
			return result;
		}
  }
	catch(exn) {
		if (context.invoked) throw exn; // optimize to maintain a better exception stack
    return context.finalize( new ExceptionValue(exn) );  // rule (protect)
  }
	return context.auto_finalize(result);  // rule (unprotect) + implicit finalize
}
/*----------------------------------------------------------------
  Resumption Contexts
----------------------------------------------------------------*/
const Context = (function() {
  function Context() {
    this.invoked = false;
    this._suppress = false;
    this.auto_finalized = false;
  }
  Context.prototype.suppress_auto_finalize = function() {
    this._suppress = true;
  }
  Context.prototype.auto_finalize = function(arg) {
    if (this._suppress || this.invoked) return arg;
    this.auto_finalized = true;
    return this.finalize(arg);
  }
  Context.prototype.finalize = function(arg) {
    if (this.invoked) return arg;
    this.invoked = true;
    return this._resume_cancel( arg );
  }
  return Context;
})();
const ContextNever = (function() {
  __extends(ContextNever,Context);
  function ContextNever() {
    Context.call(this);
  }
  ContextNever.prototype.resume = function(arg,local) {
    throw new Error("A handler branch marked as never-resuming tried to resume.");
  }
  ContextNever.prototype._resume_cancel = function(arg) {
    throw new Error("A handler branch marked as never-resuming tried to finalize.");
  }
  return ContextNever;
})();
const _context_never = new ContextNever();
const ContextTail = (function() {
  __extends(ContextTail,Context);
  function ContextTail(hinfo,_branch,cont) {
    Context.call(this);
    this.hinfo = hinfo;
    this.cont = cont;
  }
  // A tail-resume uses a bare _handle_cont call since we expect
  // to return in the trampoline of _handle_result and continue
  // in that while loop
  ContextTail.prototype.resume = function(arg,local) {
    this.invoked = true;
    return _handle_cont(this.hinfo,local,this.cont,arg);
  }
  ContextTail.prototype._resume_cancel = function(arg) {
    this.invoked = true;
    const handler = _handlers_push_hinfo(this.hinfo,undefined);
    return _handle_cont_pushed(handler, this.cont, new ExceptionValue( new FinalizeException(handler,arg) ));
  }
  return ContextTail;
})();
const ContextNormal = (function() {
  __extends(ContextNormal,Context);
  function ContextNormal(hinfo,branch,cont) {
    Context.call(this);
    this.hinfo = hinfo;
    this.branch = branch;
    this.cont = cont;
  }
  ContextNormal.prototype.resume = function(arg,local) {
    // perhaps enable this as a warning in debug mode?
    /*
    if (this.auto_finalized) {
      throw new Error("Trying to resume an already auto-finalized resumption: " +
                       _show_operation(this.hinfo,this.branch) +
                       "\n  (hint: use a 'fun raw' operation clause instead)");
    }
    */
    this.invoked = true;
    return _handle_resume( this.hinfo, local, this.cont, arg);
  }
  ContextNormal.prototype._resume_cancel = function(arg) {
    this.invoked = true;
    const handler = _handlers_push_hinfo(this.hinfo, undefined /* local */);
    return _handle_resume_pushed( handler, this.cont,
                                  new ExceptionValue( new FinalizeException(handler,arg) ));
  }
  return ContextNormal;
})();
function _TailResume(result,local) {
  this.result = result;
  this.local = local;
}
const ContextSkipTail = (function(){
  __extends(ContextSkipTail,Context);
  function ContextSkipTail() {
    Context.call(this);
  }
  ContextSkipTail.prototype.resume = function(arg,local) {
    return new _TailResume(arg,local);
  }
  ContextSkipTail.prototype._resume_cancel = function(arg) {
    throw new Error("Branch marked as tail-resumptive tried to call finalize");
  }
  return ContextSkipTail;
})();
const _context_skip_tail = new ContextSkipTail();
/*----------------------------------------------------------------
  Injection frames
----------------------------------------------------------------*/
function handle_inject( effect_name, handler_tag, action ) {
  const inject = new Handler( new HandlerInfo(effect_name,null,null,null,[],0,_handler_kind._Inject,handler_tag) );
  return _resume_inject( inject, action, undefined );
}
function _resume_inject( inject, cont, arg ) {
  _handlers_push(inject);
  try {
    const res = cont(arg);
    if (res instanceof Yield) {
      const cont = res.cont;
      res.cont = function(arg) {
        return _resume_inject(inject, cont, arg);
      }
    }
    return res;
  }
  catch(exn) {
    // rule (cancel_i), fig 9.
    if (exn instanceof FinalizeException && exn.handler===inject) {
      // wrap the exn inside another FinalizeException to keep propagating beyond the inject
      throw new FinalizeException(inject, new ExceptionValue(exn));
    }
    else {
      throw exn; // pass-through
    }
  }
  finally {
    _handlers_pop(inject);
  }
}
/*----------------------------------------------------------------
  Extension: make it possible to catch exceptions over effectful
  computations; in particular, this scopes over the `next` continuations
  of the `bind`s.
----------------------------------------------------------------*/
function handle_catch( action, on_exn, catchall) {
  return _handle_catch_resume( action, undefined, on_exn, (catchall ? true : false));
}
function handle_finally( action, on_final, reinit_fun) {
  return _handle_finally_resume( action, undefined, on_final, reinit_fun);
}
function _handle_catch_resume( cont, arg, on_exn, catchall) {
  try {
    const result = cont(arg);
    if (result instanceof Yield) {
      const cont = result.cont; // capture locally
      result.cont = function(arg) {
        return _handle_catch_resume(cont, arg, on_exn, catchall);  // resume within the try block
      };
    }
    return result;
  }
  catch(exn) {
    if (!catchall && exn instanceof SystemException) {
      throw exn; // rethrow finalize exceptions
    }
    else if (exn._inject != null && exn._inject > 0) {
      // pass injected exception through
      exn._inject--;
      throw exn;
    }
    else {
      return on_exn(exn);
    }
  }
}
function _handle_finally_resume( cont, arg, on_final, reinit_fun) {
  let result;
  try {
    result = cont(arg);
  }
  catch(exn) {
    return bind(on_final(), function(_x) { throw exn; });
  }
  if (result instanceof Yield) {
    const cont = result.cont; // capture locally
    let resumes = 0;
    result.cont = function(arg) {
      resumes++;
      var c = cont;
      if (reinit_fun != null && resumes > 1) {
        c = function(arg) {
              return bind(reinit_fun(), function(_x) { return cont(arg); });
            };
      }
      return _handle_finally_resume(c, arg, on_final, reinit_fun);  // resume within the try block
    };
    return result;
  }
  else {
    return bind_const(on_final(), result);
  }
}
function handle_inject_exn( action ) {
  return _resume_inject_exn(action,undefined);
}
function _resume_inject_exn( cont, arg ) {
  try {
    const result = cont(arg);
    if (result instanceof Yield) {
      const cont = result.cont; // capture locally
      result.cont = function(arg) {
        return _resume_inject_exn(cont, arg);  // resume within the try block
      };
    }
    return result;
  }
  catch(exn) {
    if (exn instanceof SystemException) {
      throw exn; // rethrow finalize exceptions
    }
    else {
      // increase injection level
      if (exn._inject == null) exn._inject = 1
      else exn._inject++;
      throw exn;  // rethrow
    }
  }
}
/*----------------------------------------------------------------
  Extension: functions to work with generator style yielding of operations.
----------------------------------------------------------------*/
// Transform the result of an effectful iterator (i.e. where each operation is `yield`ed) to regular operation yields.
function yield_iter( x ) {
  return (_is_iterator(x) ? _yield_iter_resume(x) : x);
}
// Is this an iterator?
function _is_iterator(x) {
  return (x != null && typeof x.next === "function");
}
// Handle operation yields that are yielded through an iterator.
function _yield_iter_resume( iter, arg ) {
  let res = (arg instanceof ExceptionValue ? iter.throw(arg.exn) : iter.next(arg));
  if (!res.done) {
    const yld = res.value;
    _assert(yld instanceof Yield, "regular operations should be wrapped in `to_iter` to lift them to an iterator (function*)");
    if (yld.branch.resume_kind > _resume_kind.Once || yld.branch.resume_kind === _resume_kind.Scoped) return _yield_iter_not_once(yld);
    const cont = yld.cont;  // capture locally
    yld.cont = function(argval) {
      if (cont === _cont_id) {
        return _yield_iter_resume(iter,argval);
      }
      else {
        return bind(cont(argval), function(bindarg) {
          return _yield_iter_resume(iter,bindarg);
        });
      }
    };
  }
  return res.value;
}
function _yield_iter_not_once(yld) {
  throw new Error("Effects yielded in iterators should resume at most once! (" + yld.handler.effect_name + ")");
}
// Use this instead of a `yield` keyword to optimize for tail-resumptive operations that might
// return a value right away.
/*
function* to_iter( x ) {
  if (x instanceof Yield) {
    return yield x;
  }
  else {
    return x;
  }
}
*/
function _enable_tail_resume_optimization(enable) {
  _max_resume_tails = (enable ? 100 : 0);
}
/*----------------------------------------------------------------
  Exports
----------------------------------------------------------------*/
return {
  // core functions
  yield_op      : yield_op,
  bind          : bind,
  new_branch    : new_branch,
  new_empty_handler : new_empty_handler,
  new_empty_handler1 : new_empty_handler1,
  new_handler   : new_handler,
  new_handler1  : new_handler1,
  handle_catch  : handle_catch,
  handle_finally: handle_finally,
  new_resource_handler   : new_resource_handler,
  new_resource_handler1  : new_resource_handler1,
  handle_inject     : handle_inject,
  handle_inject_exn : handle_inject_exn,
  SystemException: SystemException,
  FinalizeException: FinalizeException,
  // support iterators
  // to_iter     : to_iter,
  yield_iter  : yield_iter,
  // convenience
  new_handler_linear    : new_handler_linear,
  new_handler_shallow   : new_handler_shallow,
  new_handler1_linear   : new_handler1_linear,
  new_handler1_shallow  : new_handler1_shallow,
  new_branch_never      : new_branch_never,
  new_branch_tail       : new_branch_tail,
  new_branch_scoped_once: new_branch_scoped_once,
  new_branch_scoped     : new_branch_scoped,
  new_branch_once       : new_branch_once,
  new_branch_normal     : new_branch_normal,
  // unsafe debug/extension exports
  Yield      : Yield,
  _handlers  : _handlers,
  _enable_tail_resume_optimization: _enable_tail_resume_optimization,
};
})(); // Eff
// extend std_core with these primitives
$std_core = _export($std_core, {
  __extends     : __extends,
  _yield_op     : Eff.yield_op,
  _bind         : Eff.bind,
  _new_branch   : Eff.new_branch,
  _new_branch1  : Eff.new_branch,
  _new_empty_handler: Eff.new_empty_handler,
  _new_empty_handler1: Eff.new_empty_handler1,
  _new_handler  : Eff.new_handler,
  _new_handler1 : Eff.new_handler1,
  _new_resource_handler: Eff.new_resource_handler,
  _new_resource_handler1: Eff.new_resource_handler1,
  _handle_catch   : Eff.handle_catch,
  _handle_finally : Eff.handle_finally,
  _SystemException: Eff.SystemException,
  _FinalizeException: Eff.FinalizeException,
  _handle_inject  : Eff.handle_inject,
  _handle_inject_exn: Eff.handle_inject_exn,
});
/*---------------------------------------------------------------------------
  Copyright 2012-2016 Microsoft Corporation.
  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/
var _host = "unknown"
if (typeof window !== 'undefined' && window.document) {
  _host = "browser";
}
else if (typeof importScripts !== 'undefined') {
  _host = "webworker"
}
else if (typeof process !== undefined) {
  _host = "node"
}
/*------------------------------------------------
  Number formatting
------------------------------------------------*/
function _string_repeat(s,n) {
  if (n<=0)  return "";
  if (n===1) return s;
  if (n===2) return s+s;
  var res = "";
  while(n > 0) {
    if (n & 1) res += s;
    n >>>= 1;
    s += s;
  }
  return res;
}
function _trimzeros(s) {
  return s.replace(/\.?0+$/,"");
}
function _gformat(x,format) {
  var hex = /^[xX]([0-9]*)/.exec(format)
  if (hex) {
    var w = parseInt(hex[1]);
    var s = x.toString(16)
    if (format[0] == 'X') s = s.toUpperCase();
    return (s.length<w ? _string_repeat("0",w - s.length) + s : s );
  }
  var exp = /^[eE]([0-9]*)/.exec(format)
  if (exp) {
    var w = parseInt(exp[1]);
    return (w>0 && w<=20 ? x.toExponential(w) : x.toExponential());
  }
  var fix = /^[fF]([0-9]*)/.exec(format)
  if (fix) {
    var w = parseInt(fix[1]);
    return _trimzeros((w > 0 && w <= 20) ? x.toFixed(w) : x.toFixed(20));
  }
  var expfix = /^[gG]([0-9]*)/.exec(format)
  if (expfix) {
    var w = parseInt(expfix[1]);
    return (w>0&&w<=20 ? x.toPrecision(w) : x.toPrecision());
  }
  /* default */
  return x.toString();
}
function _double_show_exp(d,fractionDigits) {
  var s;
  if (fractionDigits < 0) {
    // use at most |fractionDigits|
    s = d.toExponential();
  }
  else {
    // use exactly |fractionDigits|.
    if (fractionDigits > 20) fractionDigits = 20;
    s = d.toExponential(fractionDigits);
  }
  return s.replace(/[eE][\+\-]?0+$/,"");
}
function _double_show_fixed(d, fractionDigits) {
  var dabs = (d < 0.0 ? -d : d);
  if (dabs < 1.0e-15 || dabs > 1.0e+21) {
    return _double_show_exp(d,fractionDigits);
  }
  if (fractionDigits < 0) {
    // use at most |fractionDigits|
    var s = d.toFixed(-fractionDigits);              // show at full precision
    var cap = /^([\-\+]?\d+)(\.\d+)$/.exec(s);
    if (!cap) return s;
    var frac = cap[2].substr(0,1 - fractionDigits);  // then cut off
    return cap[1] + frac.replace(/(?:\.|([1-9]))0+$/,"$1"); // remove trailing zeros
  }
  else {
    // use exactly fractionDigits
    if (fractionDigits > 20) fractionDigits = 20;
    return d.toFixed(fractionDigits);
  }
}
/*------------------------------------------------
  Exceptions
------------------------------------------------*/
function _exn_capture_stack(exn) {
  if ("captureStackTrace" in Error) {
    Error.captureStackTrace(exn,_InfoException);  // best on Node.js
  }
  else {
    exn.stack = (new Error()).stack; // in browsers
  }
  if (exn.stack==null) exn.stack = "";
  // strip off leaf functions from the stack trace
  exn.stack = exn.stack.replace(/\n\s*at (exn_exception|exception|(Object\.)?throw_1|Object\.error|exn_error_pattern|Object\.error_pattern|exn_error_range|Object\._vector_at)\b.*/g,"");
}
var _InfoException = (function() {
  __extends(_InfoException,Error);
  function _InfoException(message,info) {
    this.name    = (info && info._tag ? info._tag : 'std/core/exception');
    this.message = message || "unknown error";
    this.info    = info || $Error;
    _exn_capture_stack(this);
  }
  return _InfoException;
})();
// System exceptions cannot be caught but do respect finalizers
var _InfoSystemException = (function() {
  __extends(_InfoSystemException,$std_core._SystemException);
  function _InfoSystemException(message,info) {
    $std_core._SystemException.call(this,message);
    this.name    = (info && info._tag ? info._tag : 'std/core/exception');
    this.info    = info || $Error;
    _exn_capture_stack(this);
  }
  return _InfoSystemException;
})();
function exn_exception(msg,info) {
  if (info===Cancel) return new _InfoSystemException(msg,info)
                else return new _InfoException(msg,info);
}
function exn_stacktrace( exn ) {
  if (exn instanceof Error && typeof exn.stack === "string") {
    return exn.stack;
  }
  else {
    return "";
  }
}
function exn_error_pattern(loc,def) {
  throw new _InfoException( loc + (def ? ": " + def : "") + ": pattern match failure", Pattern(loc,def));
}
function _unsupported_external(msg) {
  throw new _InfoException(msg, $Error);
}
function exn_error_range() {
  throw new _InfoException( "index out of bounds", Range );
}
function exn_throw( exn ) {
  throw exn;
}
function exn_info( exn ) {
  //console.log("exn_info: " + exn.stack);
  if (exn instanceof _InfoException && exn.info != null) {
    return exn.info;
  }
  else if (exn instanceof _InfoSystemException && exn.info != null) {
    return exn.info;
  }
  else if (exn instanceof $std_core._FinalizeException) {
    return Finalize;
  }
  else if (exn instanceof RangeError) {
    return Range;
  }
  else if (exn instanceof AssertionError) {
    return Assert;
  }
  else if (exn instanceof Error && typeof exn.code === "string" ) {
    return System(exn.code);
  }
  else {
    return $Error;
  }
}
function exn_message( exn ) {
  if (exn==null) {
    return "invalid error";
  }
  if (typeof exn.get_message === "function") { // for FinalizeException
    var msg = exn.get_message();
    if (typeof msg === "string") return msg;
  }
  if (typeof exn.message === "string") {
    return exn.message;
  }
  else if (typeof exn === "string") {
    return exn;
  }
  else if (typeof exn.toString === "function") {
    return exn.toString();
  }
  else {
    return "Unknown error";
  };
}
/*------------------------------------------------
  32-bit integer operations
--------------------------------------------------*/
function _int32_multiply(x,y) {
  var xhi = (x >> 16) & 0xFFFF;
  var xlo = x & 0xFFFF;
  var yhi = (y >> 16) & 0xFFFF;
  var ylo = y & 0xFFFF;
  var hi  = ((xhi * ylo) + (xlo * yhi));
  return (((hi << 16) + (xlo * ylo))|0)
}
function _int32_cmod(x,y) {
  if (y === 0) throw "modulus of zero";
  return ((x%y)|0);
}
function _int32_cdiv(x,y) {
  if (y === 0) throw "division by zero";
  return ((x/y)|0);
}
/*------------------------------------------------
  list helpers
------------------------------------------------*/
// Create a list with from a vector in constant stack space
function _vlist(elems,tail) {
  var xs = tail || Nil;
  if (elems!=null && elems.length>0) {
    for(var i = elems.length - 1; i >= 0; i--) {
      var elem = elems[i];
      if (elem !== undefined) xs = Cons(elem,xs);
    }
  }
  return xs;
}
// Create an array from a list with constant stack space
function _unvlist(list) {
  var elems = [];
  while(list) {
    elems.push(list.head);
    list = list.tail;
  }
  return elems;
}
// Create a vector with a function initializer
function _vector(n, f) {
  if (n<=0) return [];
  var a = new Array(n);
  for(var i = 0; i < n; i++) {
    a[i] = f(i);
  }
  return a;
}
// Index a vector
function _vector_at( v, i ) {
  var j = _int_to_int32(i);
  var x = v[j];
  if (x === undefined) { exn_error_range(); }
  return x;
}
/*------------------------------------------------
  General javascript helpers
------------------------------------------------*/
// make a shallow copy
function _copy(obj) {
  if (typeof obj !== 'object') return obj;
  var value = obj.valueOf();
  if (obj != value) return new obj.constructor(value);
  var newobj = {};
  for( var prop in obj) newobj[prop] = obj[prop];
  return newobj;
}
// get the fields of an object
function _fields(obj) {
  var props = [];
  for (var prop in obj) props.push(prop);
  return props;
}
// Export module `mod` extended with `exp`. Modifies `exp` in place and assigns to mod
function _export(mod,exp) {
  for(var prop in mod) {
    if (exp[prop] === undefined) {
      exp[prop] = mod[prop];
    }
  }
  return exp;
}
/* assign here so inlined primitives are available in system.core itself */
$std_core = _export($std_core, {
            "_export": _export
            // primitive operations emitted by the compiler
            , "_int32_multiply": _int32_multiply
            , "_int32_cmod": _int32_cmod
            , "_int32_cdiv": _int32_cdiv
            , "vlist": _vlist
            , "_vector_at": _vector_at
            , "_unsupported_external": _unsupported_external
            // integer operations that will be inlined
            , "_int_string": _int_string
            , "_int_double": _int_double
            , "_int_to_int32": _int_to_int32
            , "_double_to_int32": _double_to_int32
            ,"_double_round": _double_round
            , "_int_to_double": _int_to_double
            , "_int_iszero": _int_iszero
            , "_int_isodd": _int_isodd
            , "_int_negate": _int_negate
            , "_int_abs": _int_abs
            , "_int_sign": _int_sign
            , "_int_add": _int_add
            , "_int_sub": _int_sub
            , "_int_mul": _int_mul
            , "_int_div": _int_div
            , "_int_mod": _int_mod
            , "_int_divmod": _int_divmod
            , "_int_compare": _int_compare
            , "_int_eq": _int_eq
            , "_int_ne": _int_ne
            , "_int_gt": _int_gt
            , "_int_ge": _int_ge
            , "_int_lt": _int_lt
            , "_int_le": _int_le
            });
/*------------------------------------------------
  double arithmetic
------------------------------------------------*/
var _double_trunc = Math.trunc || function(x){ return x - x%1; };
/*------------------------------------------------
  integer arithmetic
------------------------------------------------*/
// We represent integers as a regular number as long as it is within _min_precise and _max_precise.
// Outside that we use bigInt objects.
const _max_precise = 9007199254740991; // 2^53 -1
const _min_precise = -_max_precise;
const _max_int32 =  0x7FFFFFFF;
const _min_int32 = -0x80000000;
// is a number small?
function _is_small(x) {
  return (x >= _min_precise && x <= _max_precise);
}
// If a big integer becomes small again, convert to a number
function _unbig(x) {
  if (x.isSmall) {
    if (_is_small(x.value)) return x.value;
  }
  else if (x.value.length===1) {
    var v = x.value[0];
    if (x.sign) v = -v;
    if (_is_small(v)) return v;
  }
  return x;
}
// Round a double with rounding to even on a tie.
function _double_round(d) {
    var n = Math.round(d); // rounds to +Infinity on a tie
    return (n - d == 0.5 && n % 2 != 0 ? n - 1 : n);  // if it was a tie, and n is odd, decrement by 1
}
// create an int from a double.
function _int_double(x) {
  if (_is_small(x)) return _double_round(x);
  if (isFinite(x)) return bigInt(x);
  if (x===Infinity) return _max_int32;
  if (x===-Infinity) return _min_int32;
  return 0;
}
// create an int from a string.
function _int_string(s) {
  return _unbig(bigInt(s));
}
// Clamp a big integer into a 32 bit integer range.
function _int_to_int32(x) {
  const v = (_is_small(x) ? x : x.toJSNumber());
  if (v > _max_int32) return _max_int32;
  if (v < _min_int32) return _min_int32;
  return (v|0);
}
// Clamp a double into a 32 bit integer range.
function _double_to_int32(x) {
  if (x > _max_int32) return _max_int32;
  if (x < _min_int32) return _min_int32;
  if (isNaN(x)) return 0;
  return (x|0);
}
function _int_to_double(x) {
  return (_is_small(x) ? x : x.toJSNumber());
}
// Wrappers for basic integer operations.
// Generally we first perform the operation and check afterwards for "overflow",
// and back down to bigInt operations only when needed.
function _big_add(x,y)    { return _unbig(bigInt(x).add(bigInt(y))); }
function _big_sub(x,y)    { return _unbig(bigInt(x).subtract(bigInt(y))); }
function _big_mul(x,y)    { return _unbig(bigInt(x).multiply(bigInt(y))); }
function _big_cdivmod(x,y){ return bigInt(x).divmod(bigInt(y)); }
function _big_cdiv(x,y)   { return _unbig(bigInt(x).divide(bigInt(y))); }
function _big_cmod(x,y)   { return _unbig(bigInt(x).mod(bigInt(y))); }
function _big_compare(x,y){ return bigInt(x).compare(bigInt(y)); }
function _big_negate(x)   { return bigInt(x).negate(); }
function _big_inc(x)      { return _unbig(bigInt(x).next()); }
function _big_dec(x)      { return _unbig(bigInt(x).prev()); }
function _big_count_pow10(x)  { return bigInt(x).count_pow10(); }
function _big_count_digits(x) { return bigInt(x).count_digits(); }
function _big_div_pow10(x,n)  { return _unbig(bigInt(x).div_pow10(n)); }
function _big_mul_pow10(x,n)  { return _unbig(bigInt(x).mul_pow10(n)); }
function _big_pow(x,n) { return _unbig(bigInt(x).pow(n)); }
function _big_divmod(x,y) {
  const d  = bigInt(y);
  const qr = _big_cdivmod(x,d);
  var q = qr.quotient;
  var r = qr.remainder;
  if (r.isNegative()) {
    if (d.isPositive()) { q = q.prev(); r = r.add(d) }
                   else { q = q.next(); r = r.subtract(d) }
  }
  return _tuple2_(_unbig(q),_unbig(r));
}
function _int_negate(x) {
  const z = -x;
  return (_is_small(z) ? z : _big_negate(x));
}
function _int_iszero(x) {
  return (!isNaN(x) ? x===0 : x.isZero());
}
function _int_isodd(x) {
  return (!isNaN(x) ? (x&1)===1 : x.isOdd());
}
function _int_abs(x) {
  return (!isNaN(x) ? Math.abs(x) : x.abs());
}
function _int_add(x,y) {
  const z = x + y;
  return (_is_small(z) ? z : _big_add(x,y));
}
function _int_sub(x,y) {
  const z = x - y;
  return (_is_small(z) ? z : _big_sub(x,y));
}
function _int_mul(x,y) {
  const z = x * y;
  return (_is_small(z) ? z : _big_mul(x,y));
}
function _int_cdivmod(x,y) {
  const q = _double_trunc(x / y);
  if (!isNaN(q)) {
    return _tuple2_(q,(x%y));
  }
  else {
    const qr = _big_cdivmod(x,y);
    return _tuple2_(_unbig(qr.quotient),_unbig(qr.remainder));
  }
}
function _int_cdiv(x,y) {
  const q = _double_trunc(x / y);
  return (!isNaN(q) ? q : _big_cdiv(x,y));
}
function _int_cmod(x,y) {
  const r = (x % y);
  return (!isNaN(r) ? (r) : _big_cmod(x,y));
}
function _int_divmod(x,y) {
  if (_int_iszero(y)) return 0;
  var q = _double_trunc(x / y);
  if (!isNaN(q)) {
    var r = x%y;
    if (r<0) {
      if (y>0) { q = q - 1; r = r + y; }
          else { q = q + 1; r = r - y; }
    }
    return _tuple2_(q,r);
  }
  else return _big_divmod(x,y)
}
function _int_div(x,y) {
  if (_int_iszero(y)) return 0;
  const q = _double_trunc(x/y);
  if (!isNaN(q)) {
    const r = (x%y);
    return (r<0 ? (y>0 ? q-1 : q+1) : q);
  }
  else return _big_divmod(x,y).fst;
}
function _int_mod(x,y) {
  if (_int_iszero(y)) return 0;
  const r = (x%y);
  if (!isNaN(r)) {
    return (r<0 ? (y>0 ? r+y : r-y) : r);
  }
  else return _big_divmod(x,y).snd;
}
function _int_compare(x,y) {
  const d = x - y;
  if (!isNaN(d)) {
    return (d>0 ? Gt : (d<0 ? Lt : Eq));
  }
  else {
    const c = _big_compare(x,y);
    return (c>0 ? Gt : (c<0 ? Lt : Eq));
  }
}
function _int_sign(x) {
  if (!isNaN(x)) {
    return (x>0 ? Gt : (x<0 ? Lt : Eq));
  }
  else {
    return (x.isZero() ? Eq : (x.isPositive() ? Gt : Lt));
  }
}
function _int_eq(x,y)   { return _int_compare(x,y)===Eq; }
function _int_ne(x,y)   { return _int_compare(x,y)!==Eq; }
function _int_lt(x,y)   { return _int_compare(x,y)===Lt; }
function _int_le(x,y)   { return _int_compare(x,y)!==Gt; }
function _int_gt(x,y)   { return _int_compare(x,y)===Gt; }
function _int_ge(x,y)   { return _int_compare(x,y)!==Lt; }
function _int_pow(i,exp) {
	if (_is_small(i)) {
		var j = Math.pow(i);
		if (_is_small(j)) return j;
	}
	return _big_pow(i,exp);
}
function _int_count_pow10(i) {
  return (_is_small(i) ? bigInt._count_pow10(i) : _big_count_pow10(i) );
}
function _int_count_digits(i) {
  return (_is_small(i) ? bigInt._count_digits(i) : _big_count_digits(i) );
}
function _int_mul_pow10(i,n) {
  return (_is_small(i) && n <= 14 ? _int_mul(i,Math.pow(10,n)) : _big_mul_pow10(i,n) );
}
function _int_cdiv_pow10(i,n) {
  return (_is_small(i) && n <= 14 ? _int_cdiv(i,Math.pow(10,n)) : _big_div_pow10(i,n) );
}
function _int_showhex(x,upper) {
  const s = x.toString(16);
  return (upper ? s.toUpperCase() : s);
}
function _int_parse(s,hex) {
  if (s==="") return Nothing;
  const cappre  = /^([\-\+])?(0[xX])?(.*)$/.exec(s);
  const sdigits = cappre[3].toLowerCase();
  const sign    = cappre[1] || "";
  if (cappre[2]) hex = true;
  const rx = (hex ? /^[0-9a-f]+$/ :
                     /^[0-9]+(?:e\+?[0-9]+)?$/);
  const cap = rx.exec(sdigits);
  if (!cap) return Nothing;
  else if (hex) return Just(_unbig(bigInt(sign + sdigits,16)));
  else return Just(bigInt(sign + sdigits));
}

/*---------------------------------------------------------------------------
  Copyright 2012-2016 Microsoft Corporation.
 
  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/

/*-----------------------------------------------------------
  String codepoints

  Ugh, Javascript treats strings as UCS2/UTF-16 vectors.
  We need to explicitly decode/encode to see strings
  as unicode codepoints.
-------------------------------------------------------------*/

function _is_high_surrogate(c) {
  return (c >= 0xD800 && c <= 0xDBFF);
}

function _is_low_surrogate(c) {
  return (c >= 0xDC00 && c <= 0xDFFF);
}

function _from_surrogate(hi,lo) {
  return ((hi - 0xD800) * 0x0400) + (lo - 0xDC00) + 0x10000;
}

function _char_to_string( code ) {
  if (code < 0) {
    return "";
  }
  else if (code <= 0xFFFF) {
    return String.fromCharCode(code);
  }
  else if (code > 0x10FFFF) {
    return String.fromCharCode(0xFFFD);
  }
  else {
    code = code - 0x10000;
    return String.fromCharCode( (code / 0x0400) + 0xD800, (code % 0x0400) + 0xDC00 );
  }
}

function _char_iter( s, from, f ) {
  if (from < 0) from = 0;
  for(var i = from; i < s.length; i++) {
    var i0 = i;
    var c = s.charCodeAt(i);
    if (_is_high_surrogate(c) && i < s.length-1) {
      var lo = s.charCodeAt(i+1);
      if (_is_low_surrogate(lo)) {
        i++;
        c = _from_surrogate(c,lo);
      }
    }
    if (f(c,i0,i+1)) break;
  };
}

function _char_reviter( s, from, f ) {
  for(var i = (from!=null ? from : s.length-1); i >= 0; i--) {
    var i0 = i;
    var c = s.charCodeAt(i);
    if (_is_low_surrogate(c) && i > 0) {
      var hi = s.charCodeAt(i-1);
      if (_is_high_surrogate(hi)) {
        i--;
        c = _from_surrogate(hi,c); 
      }
    }
    if (f(c,i,i0+1)) break;
  }
}

// Convert a string to a list of characters
function _string_to_list( s ) {
  var xs = Nil;
  _char_reviter(s, undefined, function(c,i,next) {
    xs = Cons(c,xs);
  });
  return xs;
}

// Convert a string to a vector of codepoints
function _string_to_chars(s) {
  var xs = [];
  _char_iter(s, 0, function(c,i,inext) { xs.push(c); });
  return xs;
}

function _string_count(s) {
  var count = 0;
  _char_iter(s, 0, function(c,i,inext) { count++; } );
  return count;
}

// Convert a vector of code points back to a string
function _chars_to_string( v ) {
  var s = "";
  for(var i = 0; i < v.length; i++) {
    s += _char_to_string(v[i]);
  };
  return s;
}

// convert list to string
function _list_to_string(list) {
  var s = "";
  while(list) {
    s += _char_to_string(list.head);
    list = list.tail;
  }
  return s;
}

function _slice_to_string(sl) {
  if (sl.start===0 && sl.len===sl.str.length) return sl.str;
  return sl.str.substr(sl.start,sl.len);
}

function _sslice_first( s ) {
  var len;
  if (s.length===0) len = 0;
  else if (_is_high_surrogate(s.charCodeAt(0))) len = 2
  else len = 1;
  return { str: s, start: 0, len: len };
}

function _sslice_last( s ) {
  var len;
  if (s.length===0) len = 0;
  else if (_is_low_surrogate(s.charCodeAt(s.length-1))) len = 2
  else len = 1;
  return { str: s, start: s.length-len, len: len };
}

function _sslice_count(slice) {
  if (slice.len<=0) return 0;
  var count = 0;
  var end = slice.start + slice.len;
  _char_iter(slice.str, slice.start, function(c,i,nexti) { 
    count++; 
    return (nexti >= end);
  });
  return count;
}

// Extend the length of slice
function _sslice_extend( slice, count ) {
  if (count===0) return slice;
  var idx = slice.start + slice.len;
  if (count > 0) {
    _char_iter(slice.str, idx, function(c,i,nexti) {
      count--;
      idx = nexti;
      return (count <= 0);
    });
  }
  else {
    _char_reviter(slice.str, idx-1, function(c,i,nexti) {
      count++;
      idx = i;
      return (count >= 0 || idx <= slice.start);
    });
  }
  return { str: slice.str, start: slice.start, len: (idx > slice.start ? idx - slice.start : 0) };
}

// advance the start position of a slice
function _sslice_advance( slice, count ) {
  if (count===0) return slice;
  var idx = slice.start;
  var end = slice.start + slice.len;  
  var slicecount = _sslice_count(slice); // todo: optimize by caching the character count?
  if (count > 0) {
    var extra = 0;
    _char_iter(slice.str, idx, function(c,i,nexti) {
      extra++;
      idx = nexti;
      return (extra >= count);
    });    
    if (extra < slicecount && idx < end) { // optimize
      return _sslice_extend({ str: slice.str, start: idx, len: end-idx }, extra);
    }
  }
  else {
    var extra = 0;
    _char_reviter(slice.str, idx-1, function(c,i,nexti) {
      extra++;
      idx = i;
      return (extra >= -count);
    });
    if (extra < slicecount && idx < slice.start) {  // optimize
      return _sslice_extend({ str: slice.str, start: idx, len: slice.start-idx }, slicecount - extra);
    }
  }
  return _sslice_extend( { str: slice.str, start: idx, len: 0 }, slicecount );
}

// iterate through a slice
function _sslice_next( slice ) {
  if (slice.len <= 0) return null;
  var c = slice.str.charCodeAt(slice.start);
  var n = 1;
  if (_is_high_surrogate(c) && slice.len > 1) {
    var lo = slice.str.charCodeAt(slice.start+1);
    if (_is_low_surrogate(lo)) {
      c = _from_surrogate(c,lo);
      n = 2;
    }
  }
  return Just( {fst: c, snd: { str: slice.str, start: slice.start+n, len: slice.len-n }} );
}

// return the common prefix of two strings
function _sslice_common_prefix( s, t, upto ) {
  var i;
  var max = Math.min(s.length,t.length);
  for(i = 0; i < max && upto > 0; i++) {
    var c = s.charCodeAt(i);
    if (c !== t.charCodeAt(i)) break;
    if (!_is_low_surrogate(c)) upto--; // count characters
  }
  return { str: s, start: 0, len: i };
}
/*---------------------------------------------------------------------------
  Copyright 2012 Microsoft Corporation.

  This is free software; you can redistribute it and/or modify it under the
  terms of the Apache License, Version 2.0. A copy of the License can be
  found in the file "license.txt" at the root of this distribution.
---------------------------------------------------------------------------*/
var _trace = function(s) { };
var _trace_any = function(s,x) { _trace("" + s + x); };
var _print = function(s) { _trace(s); };

if (typeof console !== undefined && typeof console.log === "function") {
  _trace = function(s) {
    console.log(s);
  };
}

if (typeof console !== undefined && typeof console.info === "function") {
  _trace_any = function(s,x) {
    console.info(s,x);
  };
}

function _println(msg) {
  _print(msg + "\n");
}


/*------------------------------------------------
  Console for Node
------------------------------------------------*/
if (_host === "node") {
  _print = function(s) {
    process.stdout.write(s);
  };
}

/*------------------------------------------------
  Console for Browser
------------------------------------------------*/
if (_host === "browser") {
  (function(){
    var escapes = {
        '&': '&amp;', // & first!
        '<': '&lt;',
        '>': '&gt;',
        '\'': '&apos;',
        '"': '&quot;',
        '\n': '<br>',
        '\r': '',
    };
    var escapes_regex = new RegExp("[" + Object.keys(escapes).join("") + "]", "g");

    function html_escape(txt) {
      return txt.replace(escapes_regex, function (s) {
        var r = escapes[s];
        return (r ? r : "");
      });
    }

    function get_console() {
      var cons = document.getElementById("koka-console");
      if (cons==null) {
        cons = document.createElement("div");
        cons.id = "koka-console";
        cons.style.fontFamily = "Consolas,Monaco,'Ubuntu Mono','Droid Sans Mono','Source Code Pro',monospace"
        cons.style.fontSize = "12pt";
        cons.style.width = "99%";
        document.body.appendChild(cons);
      }
      if (cons.display == "none") return null;
      return cons;
    }

    var output = null;
    function get_console_out()
    {
      if (output) return output;

      output = document.getElementById("koka-console-out");
      if (!output) {
        var cons = get_console();
        if (!cons) return null;

        output = document.createElement("div");
        output.id = "koka-console-out";
        output.style.fontFamily = "Consolas,Monaco,'Ubuntu Mono','Droid Sans Mono','Source Code Pro',monospace"
        output.style.fontSize = "12pt";
        output.style.width = "99%";
        output.style.height = "30ex";
        output.style.border = "gray solid 1px";
        output.wrap="off";
        output.style.overflow = "auto";
        output.style.whiteSpace = "pre";
        output.style.padding = "2px";
        output.style.margin = "2px";
        output.style.paddingBottom = "4px";
        output.readOnly = true;
        cons.appendChild(output);
      }

      if (!output.print) {
        output.print_html = function(s) {
          output.innerHTML = output.innerHTML + s;
          // try to scroll to the end
          if (output.createTextRange) {
            output.createTextRange().scrollIntoView(false);
          }
          else if (output.scrollTop !== undefined) {
            output.scrollTop = output.scrollHeight;
          }
        };
        output.print = function(s) {
          output.print_html(html_escape(s));
        };
      }

      return output;
    }

    _print = function(s) {
      var out = get_console_out();
      if (out && out.print) {
        out.print(s);
      }
    };

    _print.print_html = function(s) {
      var out = get_console_out();
      if (out && out.print_html) {
        out.print_html(s);
      }
    };
  })();
}
// 2016, Daan Leijen.
//
// This module is Peter Olson's big-integer library.
// https://github.com/peterolson/BigInteger.js
//
// It is modified:
// 1. to always return NaN for the `valueOf` member.
// 2. had additions for decimal arithmetic, mul_pow10, div_pow10, count_pow10 etc.
//
// Original license is the 'un-licence'
/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
*/
const bigInt = (function (undefined) {
    "use strict";

    const BASE = 1e7,
          LOG_BASE = 7,
          MAX_INT = 9007199254740992,
          MAX_INT_ARR = smallToArray(MAX_INT),
          LOG_MAX_INT = Math.log(MAX_INT);

    function Integer(v, radix) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 ? parseValue(v) : parseBase(v, radix);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var value, n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value, isSmall;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a,b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };

    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var value, n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
            if (isPrecise(a.value * this.value)) {
                return new SmallInteger(a.value * this.value);
            }
            return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
            if (a.value === 0) return Integer[0];
            if (a.value === 1) return this;
            if (a.value === -1) return this.negate();
            return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    function square(a) {
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            for (var j = 0; j < l; j++) {
                a_j = a[j];
                product = a_i * a_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
              quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    SmallInteger.prototype.divmod = BigInteger.prototype.divmod;

    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        var value = n.value;
        if (value === 0) return false;
        if (value === 1) return true;
        if (value === 2) return this.isEven();
        return this.mod(n).equals(Integer[0]);
    };
    SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(25)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    BigInteger.prototype.isPrime = function () {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs(),
            nPrev = n.prev();
        var a = [2, 3, 5, 7, 11, 13, 17, 19],
            b = nPrev,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2);
        for (i = 0; i < a.length; i++) {
            x = bigInt(a[i]).modPow(b, n);
            if (x.equals(Integer[1]) || x.equals(nPrev)) continue;
            for (t = true, d = b; t && d.lesser(nPrev) ; d = d.multiply(2)) {
                x = x.square().mod(n);
                if (x.equals(nPrev)) t = false;
            }
            if (t) return false;
        }
        return true;
    };
    SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        // use the Fermat primality test
        for (var i = 0; i < t; i++) {
            var a = bigInt.randBetween(2, n.minus(2));
            if (!a.modPow(n.prev(), n).isUnit()) return false; // definitely composite
        }
        return true; // large chance of being prime
    };
    SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.equals(bigInt.zero)) {
        	q = r.divide(newR);
          lastT = t;
          lastR = r;
          t = newT;
          r = newR;
          newT = lastT.subtract(q.multiply(newT));
          newR = lastR.subtract(q.multiply(newR));
        }
        if (t.compare(0) === -1) {
        	t = t.add(n);
        }
        return t;
    }
    SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };

    var powersOfTwo = [1];
    while (powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return ((typeof n === "number" || typeof n === "string") && +Math.abs(n) <= BASE) ||
            (n instanceof BigInteger && n.value.length <= 1);
    }

    BigInteger.prototype.shiftLeft = function (n) {
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (n) {
        var remQuo;
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        n = +n;
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero()) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xBits = [], yBits = [];
        var xStop = false, yStop = false;
        while (!xStop || !yStop) {
            if (xRem.isZero()) { // virtual sign extension for simulating two's complement
                xStop = true;
                xBits.push(xSign ? 1 : 0);
            }
            else if (xSign) xBits.push(xRem.isEven() ? 1 : 0); // two's complement for negative numbers
            else xBits.push(xRem.isEven() ? 0 : 1);

            if (yRem.isZero()) {
                yStop = true;
                yBits.push(ySign ? 1 : 0);
            }
            else if (ySign) yBits.push(yRem.isEven() ? 1 : 0);
            else yBits.push(yRem.isEven() ? 0 : 1);

            xRem = xRem.over(2);
            yRem = yRem.over(2);
        }
        var result = [];
        for (var i = 0; i < xBits.length; i++) result.push(fn(xBits[i], yBits[i]));
        var sum = bigInt(result.pop()).negate().times(bigInt(2).pow(result.length));
        while (result.length) {
            sum = sum.add(bigInt(result.pop()).times(bigInt(2).pow(result.length)));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a,b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = Math.min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low);
        if (range.isSmall) return low.add(Math.round(Math.random() * range));
        var length = range.value.length - 1;
        var result = [], restricted = true;
        for (var i = length; i >= 0; i--) {
            var top = restricted ? range.value[i] : BASE;
            var digit = truncate(Math.random() * top);
            result.unshift(digit);
            if (digit < top) restricted = false;
        }
        result = arrayToSmall(result);
        return low.add(typeof result === "number" ? new SmallInteger(result) : new BigInteger(result, false));
    }
    var parseBase = function (text, base) {
        var val = Integer[0], pow = Integer[1],
            length = text.length;
        if (2 <= base && base <= 36) {
            if (length <= LOG_MAX_INT / Math.log(base)) {
                return new SmallInteger(parseInt(text, base));
            }
        }
        base = parseValue(base);
        var digits = [];
        var i;
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i].toLowerCase(),
                charCode = c.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) digits.push(parseValue(c));
            else if (97 <= charCode && charCode <= 122) digits.push(parseValue(c.charCodeAt(0) - 87));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">");
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        digits.reverse();
        for (i = 0; i < digits.length; i++) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    };

    function stringify(digit) {
        var v = digit.value;
        if (typeof v === "number") v = [v];
        if (v.length === 1 && v[0] <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(v[0]);
        }
        return "<" + v + ">";
    }
    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return "0";
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return "0";
            if (n.isNegative()) return new Array(1 - n).join("10");
            return "1" + new Array(+n).join("01");
        }
        var minusSign = "";
        if (n.isNegative() && base.isPositive()) {
            minusSign = "-";
            n = n.abs();
        }
        if (base.equals(1)) {
            if (n.isZero()) return "0";
            return minusSign + new Array(+n + 1).join(1);
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(stringify(digit));
        }
        out.push(stringify(left));
        return minusSign + out.reverse().join("");
    }

    BigInteger.prototype.toString = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBase(this, radix);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };
    SmallInteger.prototype.toString = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBase(this, radix);
        return String(this.value);
    };

    // DAAN: additions for fast fixed-point arithmetic
    function _count_pow10( x ) {
        var j = 0;
        while(x!==0) {
          var m = x%10;
          if (m===0) { j++; }
                else break;
          x = x/10;
        }
        return j;
    }
    BigInteger.prototype.count_pow10 = function() {
        var v = this.value;
        var l = v.length;
        var i;
        for(i = 0; i < l-1; i++) {
            if (v[i]!==0) break;
        }
        return (_count_pow10(v[i]) + LOG_BASE*i);
    }
    SmallInteger.prototype.count_pow10 = function() {
        return _count_pow10(this.value);
    }

    var log10 = Math.log(10);
    function _count_digits8( x ) {  // only for 0 <= x < 1e8
        if (x < 1e4) { // 1 - 4
            if (x < 1e2) return (x < 10 ? 1 : 2);
                    else return (x < 1000 ? 3 : 4);
        }
        else { // 5 - 8
            if (x < 1e6) return (x < 1e5 ? 5 : 6);
                    else return (x < 1e7 ? 7 : 8);
        }
    }
    function _count_digits( x ) {
        if (x===0) return 0;
        x = Math.abs(x);
        if (x < 1e8) return _count_digits8(x);
        return (1 + Math.floor(Math.log(Math.abs(x)) / log10));
    }
    BigInteger.prototype.count_digits = function() {
        var v = this.value;
        var l = v.length;
        return (_count_digits(v[l-1]) + LOG_BASE*(l-1));
    }
    SmallInteger.prototype.count_digits = function() {
        return _count_digits(this.value);
    }

    BigInteger.prototype.mul_pow10 = function(n) {
        var i = parseValue(n);
        //console.log(" mul_pow10, big: " + this.toString() + ", i: " + i.toString() + ", n: " + n.toString());
        if (this.isZero() || i.isZero())     return this;
        if (i.isNegative()) return this.div_pow10(i.negate())
        if (!i.isSmall)     return this.multiply( Integer[10].pow(i) );
        var large = Math.floor(i.value / LOG_BASE);
        var small = i.value - LOG_BASE*large;
        var a = (small===0 ? this.value.slice(0) : multiplySmall(this.value,Math.pow(10,small)) );
        if (large > 10) {
            var b = new Array(large);
            for(var j = 0; j < large; j++) { b[j] = 0; }
            a = b.concat(a);
        }
        else {
            while(--large >= 0) { a.unshift(0); }
        }
        var res = new BigInteger( a, this.sign );
        //console.log("  result: " + res.toString());
        return res;
    }

    SmallInteger.prototype.toBig = function() {
        return new BigInteger( smallToArray(Math.abs(this.value)), this.sign );
    }

    SmallInteger.prototype.mul_pow10 = function(n) {
        var i = parseValue(n);
        //console.log("mul_pow10, small: " + this.toString() + ", i: " + i.toString() + ", n: " + n.toString() + ", ");
        if (this.isZero() || i.isZero())     return this;
        if (i.isNegative()) return this.div_pow10(i.negate())
        if (i.isSmall && i.value <= 2*LOG_BASE) return this.multiply(Math.pow(10,i.value));
        return this.toBig().mul_pow10(i);
    }

    BigInteger.prototype.div_pow10 = function(n) {
        var i = parseValue(n);
        if (this.isZero() || i.isZero())     return this;
        if (i.isNegative()) return this.mul_pow10(i.negate())
        if (!i.isSmall)     return this.divide( Integer[10].pow(i) );
        var large = Math.floor(i.value / LOG_BASE);
        var small = i.value - LOG_BASE*large;
        if (large >= this.value.length) return Integer[0];
        //console.log("div-pow10: " + n.toString() + ", " + this.toString() + ", " + large.toString() + ", " + small.toString());
        var x  = (large===0 ? this : new BigInteger(this.value.slice(large),this.sign)); // copy & shift out the lower digits
        var res= (small===0 ? x : x.divide(Math.pow(10,small)));
        //console.log(" result: " + res.toString());
        return res;
    }
    SmallInteger.prototype.div_pow10 = function(n) {
        var i = parseValue(n);
        if (this.isZero() || i.isZero())     return this;
        if (i.isNegative()) return this.mul_pow10(i.negate())
        if (i.isSmall && i.value <= 2*LOG_BASE) return this.divide( Math.pow(10,i.value) );
        //console.log("small div pow10: " + this.value.toString() + ", " + n.toString());
        return this.toBig().div_pow10(i);
    }

    function parseStringValue(v) {
            if (isPrecise(+v)) {
                var x = +v;
                if (x === truncate(x))
                    return new SmallInteger(x);
                throw "Invalid integer: " + v;
            }
            var sign = v[0] === "-";
            if (sign) v = v.slice(1);
            var split = v.split(/e/i);
            if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
            if (split.length === 2) {
                var exp = split[1];
                if (exp[0] === "+") exp = exp.slice(1);
                exp = +exp;
                if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
                var text = split[0];
                var decimalPlace = text.indexOf(".");
                if (decimalPlace >= 0) {
                    exp -= text.length - decimalPlace - 1;
                    text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
                }
                if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
                text += (new Array(exp + 1)).join("0");
                v = text;
            }
            var isValid = /^([0-9][0-9]*)$/.test(v);
            if (!isValid) throw new Error("Invalid integer: " + v);
            var r = [], max = v.length, l = LOG_BASE, min = max - l;
            while (max > 0) {
                r.push(+v.slice(min, max));
                min -= l;
                if (min < 0) min = 0;
                max -= l;
            }
            trim(r);
            return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        return v;
    }

    // DAAN: Very important that `valueOf` returns NaN
    BigInteger.prototype.valueOf = function () {
        return NaN; // +this.toString();
    };
	// DAAN: optimized conversion to double to not go through a full text representation
    BigInteger.prototype.toJSNumber = function() {
      // return +this.toString();
      var v  = this.value;
      var hi = v.length - 1;
      var lo = hi - 3; if (lo < 0) lo = 0; // process at most 4 entries (= at least 21+1 digits)
      var d  = 0;
      var i;
      for(i = hi; i >= lo; i--) {
        d = d*BASE  + v[i];
      }
      if (lo > 0) d = d*Math.pow(10,lo*LOG_BASE);
      return d;
    }

    SmallInteger.prototype.valueOf = function () {
        return NaN; // this.value;
    };
    SmallInteger.prototype.toJSNumber = function() {
      return this.value;
    }

    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = new SmallInteger(i);
        if (i > 0) Integer[-i] = new SmallInteger(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger; };
    Integer.randBetween = randBetween;
    // Daan
    Integer._count_pow10 = _count_pow10;
    Integer._count_digits = _count_digits;
    return Integer;
})();
 
// type declarations
var _tag_Error = "std/core/Error";
var _tag_Assert = "std/core/Assert";
var _tag_Todo = "std/core/Todo";
var _tag_Range = "std/core/Range";
var _tag_Finalize = "std/core/Finalize";
var _tag_Pattern = "std/core/Pattern";
var _tag_System = "std/core/System";
var _tag_Internal = "std/core/Internal";
var _tag_Cancel = "std/core/Cancel";
// type ()
const _unit_ = 1; // ()
// type exn
// type div
// type alloc
// type read
// type write
// type <>
// type <|>
// type ui
// type net
// type console
// type file
// type global
// type ndet
// type (,)
function _tuple2_(fst, snd) /* forall<a,b> (fst : a, snd : b) -> (a, b) */  {
  return { fst: fst, snd: snd };
}
// type any
// type int
// type ref
// type exception
// type try
function Exn(exception) /* forall<a> (exception : exception) -> try<a> */  {
  return { _tag: 1, exception: exception };
}
function Ok(result) /* forall<a> (result : a) -> try<a> */  {
  return { _tag: 2, result: result };
}
// type (,,)
function _tuple3_(fst, snd, thd) /* forall<a,b,c> (fst : a, snd : b, thd : c) -> (a, b, c) */  {
  return { fst: fst, snd: snd, thd: thd };
}
// type (,,,)
function _tuple4_(fst, snd, thd, field4) /* forall<a,b,c,d> (fst : a, snd : b, thd : c, field4 : d) -> (a, b, c, d) */  {
  return { fst: fst, snd: snd, thd: thd, field4: field4 };
}
// type (,,,,)
function _lp__comma__comma__comma__comma__rp_(fst, snd, thd, field4, field5) /* forall<a,b,c,d,a1> (fst : a, snd : b, thd : c, field4 : d, field5 : a1) -> (a, b, c, d, a1) */  {
  return { fst: fst, snd: snd, thd: thd, field4: field4, field5: field5 };
}
// type blocking
// type bool
const False = false;
const True = true;
// type char
// type either
function Left(left) /* forall<a,b> (left : a) -> either<a,b> */  {
  return { _tag: 1, left: left };
}
function Right(right) /* forall<a,b> (right : b) -> either<a,b> */  {
  return { _tag: 2, right: right };
}
// type delayed
function Delay(dref) /* forall<e,a> (dref : ref<global,either<() -> e a,a>>) -> delayed<e,a> */  {
  return dref;
}
// type double
// type ediv
// type string
// type exception-info
const $Error = { _tag: _tag_Error }; // exception-info
const Assert = { _tag: _tag_Assert }; // exception-info
const Todo = { _tag: _tag_Todo }; // exception-info
const Range = { _tag: _tag_Range }; // exception-info
const Finalize = { _tag: _tag_Finalize }; // exception-info
function Pattern(location, definition) /* (location : string, definition : string) -> exception-info */  {
  return { _tag: _tag_Pattern, location: location, definition: definition };
}
function System(errno) /* (errno : string) -> exception-info */  {
  return { _tag: _tag_System, errno: errno };
}
function Internal(name) /* (name : string) -> exception-info */  {
  return { _tag: _tag_Internal, name: name };
}
// type global-scope
// type handled
// type handled1
// type handler-branch0
// type handler-branch1
// type hdiv
// type int32
// type list
const Nil = null; // forall<a> list<a>
function Cons(head, tail) /* forall<a> (head : a, tail : list<a>) -> list<a> */  {
  return { head: head, tail: tail };
}
// type maybe
const Nothing = null; // forall<a> maybe<a>
function Just(value) /* forall<a> (value : a) -> maybe<a> */  {
  return { value: value };
}
// type null
// type optional
function Optional(value) /* forall<a> (value : a) -> ?a */  {
  return value;
}
const None = undefined; // forall<a> ?a
// type order
const Lt = 1; // order
const Eq = 2; // order
const Gt = 3; // order
// type resource
function _Resource(_field1) /* forall<a> (int) -> resource<a> */  {
  return _field1;
}
// type resume-context
// type resume-context1
// type sslice
function Sslice(str, start, len) /* (str : string, start : int32, len : int32) -> sslice */  {
  return { str: str, start: start, len: len };
}
// type stream
function Next(head, tail) /* forall<a> (head : a, tail : stream<a>) -> stream<a> */  {
  return { head: head, tail: tail };
}
// type vector
// type void
// type exception-info
const Cancel = { _tag: _tag_Cancel }; // exception-info
 
// declarations
 
// Raise a pattern match exception. This is function is used internally by the
// compiler to generate error messages on pattern match failures.
function error_pattern(location, definition) /* forall<a> (location : string, definition : string) -> exn a */  {
  return exn_error_pattern(location,definition);
}
function _copy(_this) /* (()) -> () */  {
  return _unit_;
}
 
// Automatically generated. Retrieves the `fst` constructor field of the `:(,)` type.
function fst(_this) /* forall<a,b> ((a, b)) -> a */  {
  return _this.fst;
}
 
// Automatically generated. Retrieves the `snd` constructor field of the `:(,)` type.
function snd(_this) /* forall<a,b> ((a, b)) -> b */  {
  return _this.snd;
}
function _copy_1(_this, fst0, snd0) /* forall<a,b> ((a, b), fst : ?a, snd : ?b) -> (a, b) */  {
  var _fst_2484 = (fst0 !== undefined) ? fst0 : fst(_this);
  var _snd_2492 = (snd0 !== undefined) ? snd0 : snd(_this);
  return _tuple2_(_fst_2484, _snd_2492);
}
 
// Automatically generated. Tests for the `Exn` constructor of the `:try` type.
function exn_ques_(try0) /* forall<a> (try : try<a>) -> bool */  {
  return (try0._tag === 1);
}
 
// Automatically generated. Tests for the `Ok` constructor of the `:try` type.
function ok_ques_(try0) /* forall<a> (try : try<a>) -> bool */  {
  return (try0._tag === 2);
}
 
// Automatically generated. Retrieves the `fst` constructor field of the `:(,,)` type.
function fst_1(_this) /* forall<a,b,c> ((a, b, c)) -> a */  {
  return _this.fst;
}
 
// Automatically generated. Retrieves the `snd` constructor field of the `:(,,)` type.
function snd_1(_this) /* forall<a,b,c> ((a, b, c)) -> b */  {
  return _this.snd;
}
 
// Automatically generated. Retrieves the `thd` constructor field of the `:(,,)` type.
function thd(_this) /* forall<a,b,c> ((a, b, c)) -> c */  {
  return _this.thd;
}
function _copy_2(_this, fst0, snd0, thd0) /* forall<a,b,c> ((a, b, c), fst : ?a, snd : ?b, thd : ?c) -> (a, b, c) */  {
  var _fst_2702 = (fst0 !== undefined) ? fst0 : fst_1(_this);
  var _snd_2743 = (snd0 !== undefined) ? snd0 : snd_1(_this);
  var _thd_2752 = (thd0 !== undefined) ? thd0 : thd(_this);
  return _tuple3_(_fst_2702, _snd_2743, _thd_2752);
}
 
// Automatically generated. Retrieves the `fst` constructor field of the `:(,,,)` type.
function fst_2(_this) /* forall<a,b,c,d> ((a, b, c, d)) -> a */  {
  return _this.fst;
}
 
// Automatically generated. Retrieves the `snd` constructor field of the `:(,,,)` type.
function snd_2(_this) /* forall<a,b,c,d> ((a, b, c, d)) -> b */  {
  return _this.snd;
}
 
// Automatically generated. Retrieves the `thd` constructor field of the `:(,,,)` type.
function thd_1(_this) /* forall<a,b,c,d> ((a, b, c, d)) -> c */  {
  return _this.thd;
}
 
// Automatically generated. Retrieves the `field4` constructor field of the `:(,,,)` type.
function field4(_this) /* forall<a,b,c,d> ((a, b, c, d)) -> d */  {
  return _this.field4;
}
function _copy_3(_this, fst0, snd0, thd0, field40) /* forall<a,b,c,d> ((a, b, c, d), fst : ?a, snd : ?b, thd : ?c, field4 : ?d) -> (a, b, c, d) */  {
  var _fst_3104 = (fst0 !== undefined) ? fst0 : fst_2(_this);
  var _snd_3168 = (snd0 !== undefined) ? snd0 : snd_2(_this);
  var _thd_3219 = (thd0 !== undefined) ? thd0 : thd_1(_this);
  var _field4_3229 = (field40 !== undefined) ? field40 : field4(_this);
  return _tuple4_(_fst_3104, _snd_3168, _thd_3219, _field4_3229);
}
 
// Automatically generated. Retrieves the `fst` constructor field of the `:(,,,,)` type.
function fst_3(_this) /* forall<a,b,c,d,a1> ((a, b, c, d, a1)) -> a */  {
  return _this.fst;
}
 
// Automatically generated. Retrieves the `snd` constructor field of the `:(,,,,)` type.
function snd_3(_this) /* forall<a,b,c,d,a1> ((a, b, c, d, a1)) -> b */  {
  return _this.snd;
}
 
// Automatically generated. Retrieves the `thd` constructor field of the `:(,,,,)` type.
function thd_2(_this) /* forall<a,b,c,d,a1> ((a, b, c, d, a1)) -> c */  {
  return _this.thd;
}
 
// Automatically generated. Retrieves the `field4` constructor field of the `:(,,,,)` type.
function field4_1(_this) /* forall<a,b,c,d,a1> ((a, b, c, d, a1)) -> d */  {
  return _this.field4;
}
 
// Automatically generated. Retrieves the `field5` constructor field of the `:(,,,,)` type.
function field5(_this) /* forall<a,b,c,d,a1> ((a, b, c, d, a1)) -> a1 */  {
  return _this.field5;
}
function _copy_4(_this, fst0, snd0, thd0, field40, field50) /* forall<a,b,c,d,a1> ((a, b, c, d, a1), fst : ?a, snd : ?b, thd : ?c, field4 : ?d, field5 : ?a1) -> (a, b, c, d, a1) */  {
  var _fst_3811 = (fst0 !== undefined) ? fst0 : fst_3(_this);
  var _snd_3903 = (snd0 !== undefined) ? snd0 : snd_3(_this);
  var _thd_3981 = (thd0 !== undefined) ? thd0 : thd_2(_this);
  var _field4_4042 = (field40 !== undefined) ? field40 : field4_1(_this);
  var _field5_4053 = (field50 !== undefined) ? field50 : field5(_this);
  return _lp__comma__comma__comma__comma__rp_(_fst_3811, _snd_3903, _thd_3981, _field4_4042, _field5_4053);
}
 
// Automatically generated. Tests for the `False` constructor of the `:bool` type.
function false_ques_(bool0) /* (bool : bool) -> bool */  {
  return (!bool0);
}
 
// Automatically generated. Tests for the `True` constructor of the `:bool` type.
function true_ques_(bool0) /* (bool : bool) -> bool */  {
  return (bool0);
}
 
// Automatically generated. Tests for the `Left` constructor of the `:either` type.
function left_ques_(either) /* forall<a,b> (either : either<a,b>) -> bool */  {
  return (either._tag === 1);
}
 
// Automatically generated. Tests for the `Right` constructor of the `:either` type.
function right_ques_(either) /* forall<a,b> (either : either<a,b>) -> bool */  {
  return (either._tag === 2);
}
 
// Automatically generated. Retrieves the `dref` constructor field of the `:delayed` type.
function dref(delayed) /* forall<e,a> (delayed : delayed<e,a>) -> ref<global,either<() -> e a,a>> */  {
  return delayed;
}
function _copy_5(_this, dref0) /* forall<e,a> (delayed<e,a>, dref : ?ref<global,either<() -> e a,a>>) -> delayed<e,a> */  {
  var _x0 = (dref0 !== undefined) ? dref0 : dref(_this);
  return $std_core._bind(_x0,(function(_c_0 /* ref<global,either<() -> 4252 4253,4253>> */ ) {
    return _c_0;
  }));
}
 
// Automatically generated. Tests for the `Error` constructor of the `:exception-info` type.
function error_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Error);
}
 
// Automatically generated. Tests for the `Assert` constructor of the `:exception-info` type.
function assert_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Assert);
}
 
// Automatically generated. Tests for the `Todo` constructor of the `:exception-info` type.
function todo_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Todo);
}
 
// Automatically generated. Tests for the `Range` constructor of the `:exception-info` type.
function range_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Range);
}
 
// Automatically generated. Tests for the `Finalize` constructor of the `:exception-info` type.
function finalize_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Finalize);
}
 
// Automatically generated. Tests for the `Pattern` constructor of the `:exception-info` type.
function pattern_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Pattern);
}
 
// Automatically generated. Tests for the `System` constructor of the `:exception-info` type.
function system_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_System);
}
 
// Automatically generated. Tests for the `Internal` constructor of the `:exception-info` type.
function internal_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Internal);
}
 
// Automatically generated. Tests for the `Nil` constructor of the `:list` type.
function nil_ques_(list0) /* forall<a> (list : list<a>) -> bool */  {
  return (list0 == null);
}
 
// Automatically generated. Tests for the `Cons` constructor of the `:list` type.
function cons_ques_(list0) /* forall<a> (list : list<a>) -> bool */  {
  return (list0 != null);
}
 
// Automatically generated. Tests for the `Nothing` constructor of the `:maybe` type.
function nothing_ques_(maybe0) /* forall<a> (maybe : maybe<a>) -> bool */  {
  return (maybe0 == null);
}
 
// Automatically generated. Tests for the `Just` constructor of the `:maybe` type.
function just_ques_(maybe0) /* forall<a> (maybe : maybe<a>) -> bool */  {
  return (maybe0 != null);
}
 
// Automatically generated. Tests for the `Optional` constructor of the `:optional` type.
function optional_ques_(optional) /* forall<a> (optional : ?a) -> bool */  {
  return (optional !== undefined);
}
 
// Automatically generated. Tests for the `None` constructor of the `:optional` type.
function none_ques_(optional) /* forall<a> (optional : ?a) -> bool */  {
  return (optional == null);
}
 
// Automatically generated. Tests for the `Lt` constructor of the `:order` type.
function lt_ques_(order0) /* (order : order) -> bool */  {
  return (order0 === 1);
}
 
// Automatically generated. Tests for the `Eq` constructor of the `:order` type.
function eq_ques_(order0) /* (order : order) -> bool */  {
  return (order0 === 2);
}
 
// Automatically generated. Tests for the `Gt` constructor of the `:order` type.
function gt_ques_(order0) /* (order : order) -> bool */  {
  return (order0 === 3);
}
 
// Automatically generated. Retrieves the `str` constructor field of the `:sslice` type.
function str(sslice) /* (sslice : sslice) -> string */  {
  return sslice.str;
}
 
// Automatically generated. Retrieves the `start` constructor field of the `:sslice` type.
function start(sslice) /* (sslice : sslice) -> int32 */  {
  return sslice.start;
}
 
// Automatically generated. Retrieves the `len` constructor field of the `:sslice` type.
function len(sslice) /* (sslice : sslice) -> int32 */  {
  return sslice.len;
}
function _copy_6(_this, str0, start0, len0) /* (sslice, str : ?string, start : ?int32, len : ?int32) -> sslice */  {
  var _str_4523 = (str0 !== undefined) ? str0 : str(_this);
  var _start_4529 = (start0 !== undefined) ? start0 : start(_this);
  var _len_4535 = (len0 !== undefined) ? len0 : len(_this);
  return Sslice(_str_4523, _start_4529, _len_4535);
}
 
// Automatically generated. Retrieves the `head` constructor field of the `:stream` type.
function head(stream) /* forall<a> (stream : stream<a>) -> a */  {
  return stream.head;
}
 
// Automatically generated. Retrieves the `tail` constructor field of the `:stream` type.
function tail(stream) /* forall<a> (stream : stream<a>) -> stream<a> */  {
  return stream.tail;
}
function _copy_7(_this, head0, tail0) /* forall<a> (stream<a>, head : ?a, tail : ?stream<a>) -> stream<a> */  {
  var _head_4628 = (head0 !== undefined) ? head0 : head(_this);
  var _tail_4635 = (tail0 !== undefined) ? tail0 : tail(_this);
  return Next(_head_4628, _tail_4635);
}
 
// Automatically generated. Tests for the `Cancel` constructor of the `:exception-info` type.
function cancel_ques_(exception_info) /* (exception-info : exception-info) -> bool */  {
  return (exception_info._tag === _tag_Cancel);
}
function _makeFreshResourceHandler0(effect_name, reinit, ret, final, branches, handler_kind, resource_tag, resource_wrap) /* forall<a,b,c,e,e1> (effect-name : string, reinit : null<() -> e ()>, ret : null<(a) -> e b>, final : null<() -> e ()>, branches : vector<handler-branch0<e,b>>, handler-kind : int, resource-tag : int, resource-wrap : (int) -> c) -> total ((action : (c) -> e1 a) -> e b) */  {
  return $std_core._new_resource_handler(effect_name,reinit,ret,final,branches,handler_kind,resource_tag,resource_wrap);
}
function _makeFreshResourceHandler1(effect_name, reinit, ret, final, branches, handler_kind, resource_tag, resource_wrap) /* forall<a,b,c,e,d,e1> (effect-name : string, reinit : null<(local : d) -> e d>, ret : null<(result : a, local : d) -> e b>, final : null<(local : d) -> e ()>, branches : vector<handler-branch1<e,d,b>>, handler-kind : int, resource-tag : int, resource-wrap : (int) -> c) -> total ((initial-local : d, action : (c) -> e1 a) -> e b) */  {
  return $std_core._new_resource_handler1(effect_name,reinit,ret,final,branches,handler_kind,resource_tag,resource_wrap);
}
function _makeHandler0(effect_name, reinit, ret, final, branches, handler_kind) /* forall<a,b,e,e1> (effect-name : string, reinit : null<() -> e ()>, ret : null<(a) -> e b>, final : null<() -> e ()>, branches : vector<handler-branch0<e,b>>, handler-kind : int) -> total ((action : () -> e1 a) -> e b) */  {
  return $std_core._new_handler(effect_name,reinit,ret,final,branches,handler_kind);
}
function _makeHandler1(effect_name, reinit, ret, final, branches, handler_kind) /* forall<a,b,e,c,e1> (effect-name : string, reinit : null<(local : c) -> e c>, ret : null<(result : a, local : c) -> e b>, final : null<(local : c) -> e ()>, branches : vector<handler-branch1<e,c,b>>, handler-kind : int) -> total ((initial-local : c, action : () -> e1 a) -> e b) */  {
  return $std_core._new_handler1(effect_name,reinit,ret,final,branches,handler_kind);
}
function _makeHandlerBranch0(resume_kind, op_name, branch) /* forall<a,b,c,e> (resume-kind : int, op-name : string, branch : (resume-context<a,e,b>, op : c) -> e b) -> total handler-branch0<e,b> */  {
  return $std_core._new_branch(resume_kind,op_name,branch);
}
function _makeHandlerBranch0_x1(resume_kind, op_name, branch) /* forall<a,e> (resume-kind : int, op-name : string, branch : any) -> total handler-branch0<e,a> */  {
  return $std_core._new_branch(resume_kind,op_name,branch);
}
function _makeHandlerBranch1(resume_kind, op_name, branch) /* forall<a,b,c,e,d> (resume-kind : int, op-name : string, branch : (resume-context1<a,e,b,d>, op : c, local : d) -> e b) -> total handler-branch1<e,d,b> */  {
  return $std_core._new_branch1(resume_kind,op_name,branch);
}
function _makeHandlerBranch1_x1(resume_kind, op_name, branch) /* forall<a,e,b> (resume-kind : int, op-name : string, branch : any) -> total handler-branch1<e,b,a> */  {
  return $std_core._new_branch1(resume_kind,op_name,branch);
}
 
// Used for handlers with just a `return` branch
function _makeHandlerRet0(ignored_effect_name, reinit, ret, final, ignored_branches, ignored_kind) /* forall<a,b,e> (ignored-effect-name : string, reinit : null<() -> e ()>, ret : null<(result : a) -> e b>, final : null<() -> e ()>, ignored-branches : int, ignored-kind : int) -> total ((action : () -> e a) -> e b) */  {
  return $std_core._new_empty_handler(reinit,ret,final);
}
 
// Used for handlers with just a `return` branch
function _makeHandlerRet1(ignored_effect_name, reinit, ret, final, ignored_branches, ignored_kind) /* forall<a,b,e,c> (ignored-effect-name : string, reinit : null<(local : c) -> e c>, ret : null<(result : a, local : c) -> e b>, final : null<(local : c) -> e ()>, ignored-branches : int, ignored-kind : int) -> total ((local : c, action : () -> e a) -> e b) */  {
  return $std_core._new_empty_handler1(reinit,ret,final);
}
function _makeResourceHandler0(effect_name, reinit, ret, final, branches, handler_kind, resource_tag) /* forall<a,b,e,e1> (effect-name : string, reinit : null<() -> e ()>, ret : null<(a) -> e b>, final : null<() -> e ()>, branches : vector<handler-branch0<e,b>>, handler-kind : int, resource-tag : int) -> total ((action : () -> e1 a) -> e b) */  {
  return $std_core._new_resource_handler(effect_name,reinit,ret,final,branches,handler_kind,resource_tag);
}
function _makeResourceHandler1(effect_name, reinit, ret, final, branches, handler_kind, resource_tag) /* forall<a,b,e,c,e1> (effect-name : string, reinit : null<(local : c) -> e c>, ret : null<(result : a, local : c) -> e b>, final : null<(local : c) -> e ()>, branches : vector<handler-branch1<e,c,b>>, handler-kind : int, resource-tag : int) -> total ((initial-local : c, action : () -> e1 a) -> e b) */  {
  return $std_core._new_resource_handler1(effect_name,reinit,ret,final,branches,handler_kind,resource_tag);
}
 
// Internal export for the regex module
function _new_sslice(str0, start0, len0) /* (str : string, start : int32, len : int32) -> sslice */  {
  return Sslice(str0, start0, len0);
}
 
// Unsafe: transform any type to a `null` type; used internally by the compiler.
function _null_any(x) /* forall<a> (x : a) -> null<a> */  {
  return (x==null ? null : x);
}
function _yieldop(effect_name, op_name, op_resource, op_idx, op) /* forall<a,b> (effect-name : string, op-name : string, op-resource : int, op-idx : int, op : a) -> yld<b> */  {
  return $std_core._yield_op(effect_name,op_name,op,op_idx,op_resource);
}
function _yieldop_x1(effect_name, op_name, op_resource, op_idx, op, def) /* forall<a,b,c> (effect-name : string, op-name : string, op-resource : int, op-idx : int, op : a, def : maybe<c>) -> yld<b> */  {
  return $std_core._yield_op(effect_name,op_name,op,op_idx,op_resource);
}
function string_compare(x, y) /* (x : string, y : string) -> int */  {
  return (x===y ? 0 : (x > y ? 1 : -1));
}
var maxListStack = 100;
 
// Efficiently reverse a list `xs` and append it to `tl`:\
// `reverse-append(xs,tl) == reserve(xs) + tl
function reverse_append(xs, tl) /* forall<a> (xs : list<a>, tl : list<a>) -> list<a> */  {
  function reverse_acc(acc, ys) /* forall<a> (acc : list<a>, ys : list<a>) -> list<a> */  { tailcall: while(1)
  {
    if (ys != null) {
      {
        // tail call
        var _x1 = Cons(ys.head, acc);
        acc = _x1;
        ys = ys.tail;
        continue tailcall;
      }
    }
    else {
      return acc;
    }
  }}
  return reverse_acc(tl, xs);
}
 
// Raise an integer `i` to the power of `exp`.
function pow(i, exp) /* (i : int, exp : int) -> int */  {
  return _int_pow(i,exp);
}
 
// Compose two funs `f` and `g`.
function o(f, g) /* forall<a,b,c,e> (f : (a) -> e b, g : (c) -> e a) -> ((x : c) -> e b) */  {
  return function(x /* 5224 */ ) {
    return $std_core._bind((g(x)),f);
  };
}
 
// The identity function returns its argument unchanged.
function id(x) /* forall<a> (x : a) -> a */  {
  return x;
}
 
// Convert a vector to a list with an optional tail.
function vlist(v, tail0) /* forall<a> (v : vector<a>, tail : ?list<a>) -> list<a> */  {
  var _tail_5246 = (tail0 !== undefined) ? tail0 : Nil;
  return _vlist(v,_tail_5246);
}
 
// Convert a character to a string
function string(c) /* (c : char) -> string */  {
  return _char_to_string(c);
}
 
// Convert a vector of characters to a string.
function string_1(_arg1) /* (vector<char>) -> string */  {
  return _chars_to_string(_arg1);
}
 
// Convert a list of characters to a string
function string_2(cs) /* (cs : list<char>) -> total string */  {
  return _list_to_string(cs);
}
 
// O(n). Copy the `slice` argument into a fresh string.
// Takes O(1) time if the slice covers the entire string.
function string_3(slice0) /* (slice : sslice) -> string */  {
  return _slice_to_string(slice0);
}
 
// Convert a `:maybe` string to a string using the empty sting for `Nothing`
function string_4(ms) /* (ms : maybe<string>) -> string */  {
  return (ms == null) ? "" : ms.value;
}
 
// O(`count`). Advance the start position of a string slice by `count` characters
// up to the end of the string.
// A negative `count` advances the start position backwards upto the first position
// in a string.
// Maintains the character count of the original slice upto the end of the string.
// For example:
//
// * `"abc".first.advance(1).string == "b"`,
// * `"abc".first.advance(3).string == ""`,
// * `"abc".last.advance(-1).string == "b"`.
//
function advance(slice0, count) /* (slice : sslice, count : int) -> sslice */  {
  return _sslice_advance(slice0,count);
}
 
// Apply a function `f` to a specified argument `x`.
function _bind_apply(f, x) /* forall<a,b,e> (f : (a) -> e b, x : a) -> e b */  {
  return f(x);
}
 
// Apply a function `f` to a specified argument `x`.
function _fast_apply(f, x) /* forall<a,b,e> (f : (a) -> e b, x : a) -> e b */  {
  return f(x);
}
 
// Apply a function `f` to a specified argument `x`.
function apply(f, x) /* forall<a,b,e> (f : (a) -> e b, x : a) -> e b */  {
  return _bind_apply(f, x);
}
function exception(message0, info0) /* (message : string, info : exception-info) -> exception */  {
  return exn_exception(message0,info0);
}
 
// _Unsafe_. This function calls a function and pretends it did not have any effect at all.
function unsafe_total(action) /* forall<a,e> (action : () -> e a) -> total a */  {
  return action();
}
 
// O(1). Return the string slice from the start of a string up to the
// start of `slice` argument.
function before(slice0) /* (slice : sslice) -> sslice */  {
  return Sslice(slice0.str, 0, slice0.start);
}
function info(exn) /* (exn : exception) -> exception-info */  {
  return exn_info(exn);
}
 
// O(`count`). Extend a string slice by `count` characters up to the end of the string.
// A negative `count` shrinks the slice up to the empty slice.
// For example:
//
// * `"abc".first.extend(1).string == "ab"`
// * `"abc".last.extend(-1).string == ""`
//
function extend(slice0, count) /* (slice : sslice, count : int) -> sslice */  {
  return _sslice_extend(slice0,count);
}
 
// Convert a string to upper-case
function to_upper(s) /* (s : string) -> string */  {
  return (s).toUpperCase();
}
function cdiv_exp10(i, n) /* (i : int, n : int) -> int */  {
  return _int_cdiv_pow10(i,n);
}
function mul_exp10(i, n) /* (i : int, n : int) -> int */  {
  return _int_mul_pow10(i,n);
}
 
// Return a random number equal or larger than 0.0 and smaller than 1.0
function random() /* () -> ndet double */  {
  return Math.random();
}
 
// Return the common prefix of two strings (upto `upto` characters (default is minimum length of the two strings))
function common_prefix(s, t, upto) /* (s : string, t : string, upto : ?int) -> sslice */  {
  var _upto_5466 = (upto !== undefined) ? upto : -1;
  return _sslice_common_prefix(s,t,_upto_5466);
}
 
// The `const` funs returns its first argument and ignores the second.
function $const(x, y) /* forall<a,b> (x : a, y : b) -> a */  {
  return x;
}
 
// Return a 'constant' function that ignores its argument and always returns the same result
function const_1(default0) /* forall<a,b> (default : a) -> total ((x : b) -> a) */  {
  return function(___lp_439_comma__space_8_rp_ /* 5492 */ ) {
    return default0;
  };
}
 
// If the slice is not empty,
// return the first character, and a new slice that is advanced by 1.
function next(slice0) /* (slice : sslice) -> maybe<(char, sslice)> */  {
  return _sslice_next(slice0);
}
 
// Return the number of decimal digits of `i`. Return `0` when `i==0`.
function count_digits(i) /* (i : int) -> int */  {
  return _int_count_digits(i);
}
 
// Convert a `:maybe<a>` value to `:a`, using the `nothing` parameter for `Nothing`.
function $default(m, nothing) /* forall<a> (m : maybe<a>, nothing : a) -> a */  {
  return (m == null) ? nothing : m.value;
}
 
// An empty slice
var empty = Sslice("", 0, 0);
function xends_with(s, post) /* (s : string, post : string) -> bool */  {
  return ((s).indexOf(post, (s).length - (post).length) !== -1);
}
 
// Is this an even integer?
function even_ques_(i) /* (i : int) -> bool */  {
  return !(($std_core._int_isodd(i)));
}
 
// Return the number of ending `0` digits of `i`. Return `0` when `i==0`.
function exp10_ques_(i) /* (i : int) -> int */  {
  return _int_count_pow10(i);
}
function _bind_finalize(context, result) /* forall<a,b,c,e> (context : resume-context<a,e,b>, result : c) -> e c */  {
  return context.finalize(result);
}
function _fast_finalize(context, result) /* forall<a,b,c,e> (context : resume-context<a,e,b>, result : c) -> e c */  {
  return context.finalize(result);
}
function finalize(context, result) /* forall<a,b,c,e> (context : resume-context<a,e,b>, result : c) -> e c */  {
  return _bind_finalize(context, result);
}
function _bind_finalize_1(context, result) /* forall<a,b,c,e,d> (context : resume-context1<a,e,b,d>, result : c) -> e c */  {
  return context.finalize(result);
}
function _fast_finalize_1(context, result) /* forall<a,b,c,e,d> (context : resume-context1<a,e,b,d>, result : c) -> e c */  {
  return context.finalize(result);
}
function finalize_1(context, result) /* forall<a,b,c,e,d> (context : resume-context1<a,e,b,d>, result : c) -> e c */  {
  return _bind_finalize_1(context, result);
}
 
// Execute a `hndler` no matter what exception was raised in `action`.
function _bind_finally(action, hndl) /* forall<e,a> (action : () -> e a, hndl : () -> e ()) -> e a */  {
  return $std_core._handle_finally(action,hndl);
}
 
// Execute a `hndler` no matter what exception was raised in `action`.
function _fast_finally(action, hndl) /* forall<e,a> (action : () -> e a, hndl : () -> e ()) -> e a */  {
  return $std_core._handle_finally(action,hndl);
}
 
// Execute a `hndler` no matter what exception was raised in `action`.
function $finally(action, hndl) /* forall<e,a> (action : () -> e a, hndl : () -> e ()) -> e a */  {
  return _bind_finally(action, hndl);
}
 
// Generic show: shows the internal representation of an object as a string
// Note: this breaks parametricity so it should not be public
function gshow(_arg1) /* forall<a> (a) -> string */  {
  return _arg1.toString();
}
 
// Print a string to the console
function xprints(_arg1) /* (string) -> console () */  {
  return _print(_arg1);
}
function int_show_hex(i, use_capitals) /* (i : int, use-capitals : bool) -> string */  {
  return _int_showhex(i,use_capitals);
}
function repeat32(s, n) /* (s : string, n : int32) -> string */  {
  return _string_repeat(s,n);
}
function show_expx(d, prec) /* (d : double, prec : int32) -> string */  {
  return _double_show_exp(d,prec);
}
function show_fixedx(d, prec) /* (d : double, prec : int32) -> string */  {
  return _double_show_fixed(d,prec);
}
function stack_trace(exn) /* (exn : exception) -> string */  {
  return exn_stacktrace(exn);
}
 
// Print a string to the console, including a final newline character.
function xprintsln(_arg1) /* (string) -> console () */  {
  return _println(_arg1);
}
 
// Return the host environment: `dotnet`, `browser`, `webworker`, or `node`.
function host() /* () -> ndet string */  {
  return _host;
}
 
// The `ignore` function ignores its argument.
function ignore(x) /* forall<a> (x : a) -> () */  {
  return _unit_;
}
function _bind_inject_exn(action) /* forall<a,e> (action : () -> e a) -> <exn|e> a */  {
  return $std_core._handle_inject_exn(action);
}
function _fast_inject_exn(action) /* forall<a,e> (action : () -> e a) -> <exn|e> a */  {
  return $std_core._handle_inject_exn(action);
}
function inject_exn(action) /* forall<a,e> (action : () -> e a) -> <exn|e> a */  {
  return _bind_inject_exn(action);
}
 
// Insert a separator `sep`  between all elements of a list `xs` .
function intersperse(xs, sep) /* forall<a> (xs : list<a>, sep : a) -> list<a> */  {
   
  //TODO: make tail recursive
  function before0(ys, s) /* forall<a> (list<a>, a) -> list<a> */  {
    if (ys != null) {
      return Cons(s, Cons(ys.head, before0(ys.tail, s)));
    }
    else {
      return Nil;
    }
  }
  if (xs != null) {
    return Cons(xs.head, before0(xs.tail, sep));
  }
  else {
    return Nil;
  }
}
 
// Used by the compiler to wrap main console applications
function _bind_main_console(main) /* forall<a,e> (main : () -> e a) -> e a */  {
  return (main)();
}
 
// Used by the compiler to wrap main console applications
function _fast_main_console(main) /* forall<a,e> (main : () -> e a) -> e a */  {
  return (main)();
}
 
// Used by the compiler to wrap main console applications
function main_console(main) /* forall<a,e> (main : () -> e a) -> e a */  {
  return _bind_main_console(main);
}
function mbint(m) /* (m : maybe<int>) -> int */  {
  return (m == null) ? 0 : m.value;
}
 
// Return the message associated with an exception
function message(exn) /* (exn : exception) -> string */  {
  return exn_message(exn);
}
function negate(i) /* (i : int) -> int */  {
  return $std_core._int_negate(i);
}
function _bind_prim_try_some(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> <exn|e> a) -> <exn|e> a */  {
  return $std_core._handle_catch(action, hndl, false);
}
function _fast_prim_try_some(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> <exn|e> a) -> <exn|e> a */  {
  return $std_core._handle_catch(action, hndl, false);
}
function prim_try_some(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> <exn|e> a) -> <exn|e> a */  {
  return _bind_prim_try_some(action, hndl);
}
function xparse_int(s, hex) /* (s : string, hex : bool) -> maybe<int> */  {
  return _int_parse(s,hex);
}
function _bind_prim_try_all(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return $std_core._handle_catch(action,hndl,true);
}
function _fast_prim_try_all(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return $std_core._handle_catch(action,hndl,true);
}
function prim_try_all(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return _bind_prim_try_all(action, hndl);
}
 
// Return a positive random integer (including 0)
function random_int() /* () -> ndet int */  {
  return Math.floor(Math.random()*_max_precise);
}
function _bind_resume(context, result) /* forall<a,b,e> (context : resume-context<a,e,b>, result : a) -> e b */  {
  return context.resume(result,undefined);
}
function _fast_resume(context, result) /* forall<a,b,e> (context : resume-context<a,e,b>, result : a) -> e b */  {
  return context.resume(result,undefined);
}
function resume(context, result) /* forall<a,b,e> (context : resume-context<a,e,b>, result : a) -> e b */  {
  return _bind_resume(context, result);
}
function _bind_resume_1(context, result, local) /* forall<a,b,e,c> (context : resume-context1<a,e,b,c>, result : a, local : c) -> e b */  {
  return context.resume(result,local);
}
function _fast_resume_1(context, result, local) /* forall<a,b,e,c> (context : resume-context1<a,e,b,c>, result : a, local : c) -> e b */  {
  return context.resume(result,local);
}
function resume_1(context, result, local) /* forall<a,b,e,c> (context : resume-context1<a,e,b,c>, result : a, local : c) -> e b */  {
  return _bind_resume_1(context, result, local);
}
 
// Returns a singleton list.
function single(x) /* forall<a> (x : a) -> list<a> */  {
  return Cons(x, Nil);
}
 
// Convert a string to lower-case
function to_lower(s) /* (s : string) -> string */  {
  return (s).toLowerCase();
}
function xtrace(message0) /* (message : string) -> () */  {
  return _trace(message0);
}
function xtrace_any(message0, x) /* forall<a> (message : string, x : a) -> () */  {
  return _trace_any(message0,x);
}
 
// Get the value of the `Just` constructor or raise an exception
function unjust(m) /* forall<a> (m : maybe<a>) -> exn a */  {
  return (m != null) ? m.value : error_pattern("lib/std/core.kk(529, 3)", "unjust");
}
 
// Create a new vector of length `n`  with initial elements given by function `f` .
function vector_init32(n, f) /* forall<a> (n : int32, f : (int32) -> a) -> vector<a> */  {
  return _vector(n,f);
}
 
// Substract two character codePoints
function _dash__3(c, d) /* (c : char, d : char) -> total char */  {
  return (($std_core._int_sub(c,d)));
}
function int_3(b) /* (b : bool) -> int */  {
  return (b) ? 1 : 0;
}
function int_4(x) /* (x : order) -> int */  {
  if (x === 1) {
    return $std_core._int_sub(0,1);
  }
  else if (x === 2) {
    return 0;
  }
  else {
    return 1;
  }
}
function _eq__eq__4(x, y) /* (x : order, y : order) -> bool */  {
  return $std_core._int_eq((int_4(x)),(int_4(y)));
}
function _eq__eq__5(x, y) /* (x : bool, y : bool) -> bool */  {
  return (x) ? y : !(y);
}
function _lt__4(x, y) /* (x : order, y : order) -> bool */  {
  return $std_core._int_lt((int_4(x)),(int_4(y)));
}
function _lt__5(x, y) /* (x : bool, y : bool) -> bool */  {
  return ((!(x)) && y);
}
function order(i) /* (i : int) -> order */  {
  if ($std_core._int_lt(i,0)) {
    return Lt;
  }
  else {
    return ($std_core._int_gt(i,0)) ? Gt : Eq;
  }
}
 
// Compare two strings.
// Uses the character codes directly for comparison
function compare_4(x, y) /* (x : string, y : string) -> order */  {
  return order(string_compare(x, y));
}
function _lt__6(x, y) /* (x : string, y : string) -> bool */  {
  return _eq__eq__4(compare_4(x, y), Lt);
}
function _gt__3(x, y) /* (x : order, y : order) -> bool */  {
  return $std_core._int_gt((int_4(x)),(int_4(y)));
}
function _gt__4(x, y) /* (x : bool, y : bool) -> bool */  {
  return (x && (!(y)));
}
function _gt__5(x, y) /* (x : string, y : string) -> bool */  {
  return _eq__eq__4(compare_4(x, y), Gt);
}
function compare_1(x, y) /* (x : char, y : char) -> order */  {
  if ((x < y)) {
    return Lt;
  }
  else {
    return ((x > y)) ? Gt : Eq;
  }
}
function compare_2(x, y) /* (x : bool, y : bool) -> order */  {
  if (_lt__5(x, y)) {
    return Lt;
  }
  else {
    return (_gt__4(x, y)) ? Gt : Eq;
  }
}
function compare_3(x, y) /* (x : double, y : double) -> order */  {
  if ((x < y)) {
    return Lt;
  }
  else {
    return ((x > y)) ? Gt : Eq;
  }
}
 
// Reverse a list.
function reverse(xs) /* forall<a> (xs : list<a>) -> list<a> */  {
  return reverse_append(xs, Nil);
}
 
// Append two lists.
function _plus__4(xs, ys) /* forall<a> (xs : list<a>, ys : list<a>) -> list<a> */  {
   
  // append using _constant_ stack space (by reversing the argument list)
  function rev_append(xx, yy) /* forall<a> (list<a>, list<a>) -> list<a> */  { tailcall: while(1)
  {
    if (xx != null) {
      {
        // tail call
        var _x1 = Cons(xx.head, yy);
        xx = xx.tail;
        yy = _x1;
        continue tailcall;
      }
    }
    else {
      return yy;
    }
  }}
   
  // append for the first `maxListStack` elements over the stack
  function append(n, xx0, yy0) /* forall<a> (int, list<a>, list<a>) -> list<a> */  {
    if ($std_core._int_gt(n,maxListStack)) {
      return rev_append(reverse(xx0), yy0);
    }
    else {
      if (xx0 != null) {
        return Cons(xx0.head, append($std_core._int_add(n,1), xx0.tail, yy0));
      }
      else {
        return yy0;
      }
    }
  }
  if (ys == null) {
    return xs;
  }
  else {
    return (xs == null) ? ys : append(0, xs, ys);
  }
}
 
// Add two character code points
function _plus__5(c, d) /* (c : char, d : char) -> total char */  {
  return (($std_core._int_add(c,d)));
}
 
// Raise an integer `i` to the power of `exp`.
function _hat__1(i, exp) /* (i : int, exp : int) -> int */  {
  return pow(i, exp);
}
function _excl__eq__4(x, y) /* (x : order, y : order) -> bool */  {
  return $std_core._int_ne((int_4(x)),(int_4(y)));
}
function _excl__eq__5(x, y) /* (x : bool, y : bool) -> bool */  {
  return (x) ? !(y) : y;
}
function _lt__eq__4(x, y) /* (x : order, y : order) -> bool */  {
  return $std_core._int_le((int_4(x)),(int_4(y)));
}
function _lt__eq__5(x, y) /* (x : bool, y : bool) -> bool */  {
  return !((_gt__4(x, y)));
}
function _lt__eq__6(x, y) /* (x : string, y : string) -> bool */  {
  return _lt__4(compare_4(x, y), Gt);
}
function _gt__eq__3(x, y) /* (x : order, y : order) -> bool */  {
  return $std_core._int_ge((int_4(x)),(int_4(y)));
}
function _gt__eq__4(x, y) /* (x : bool, y : bool) -> bool */  {
  return !((_lt__5(x, y)));
}
function _gt__eq__5(x, y) /* (x : string, y : string) -> bool */  {
  return _gt__3(compare_4(x, y), Lt);
}
 
// Get (zero-based) element `n`  of a list. Return a `:maybe` type.
function _lb__rb__1(xs, n) /* forall<a> (xs : list<a>, n : int) -> maybe<a> */  { tailcall: while(1)
{
  if (xs != null) {
    if ($std_core._int_eq(n,0)) {
      return Just(xs.head);
    }
    else {
      {
        // tail call
        var _x1 = $std_core._int_sub(n,1);
        xs = xs.tail;
        n = _x1;
        continue tailcall;
      }
    }
  }
  else {
    return Nothing;
  }
}}
function sign_1(d) /* (d : double) -> order */  {
  if ((d < (0.0))) {
    return Lt;
  }
  else {
    return ((d > (0.0))) ? Gt : Eq;
  }
}
 
// Is the integer positive (stricly greater than zero)
function pos_ques__1(i) /* (i : int) -> bool */  {
  return _eq__eq__4($std_core._int_sign(i), Gt);
}
 
// Is the value positive?
function pos_ques__2(d) /* (d : double) -> bool */  {
  return (d > (0.0));
}
 
// Is a slice empty?
function empty_ques_(slice0) /* (slice : sslice) -> bool */  {
  return !((((len(slice0))>0)));
}
 
// Is a string empty?
function empty_ques__1(s) /* (s : string) -> bool */  {
  return (s === (""));
}
function _bar__bar__1(m1, m2) /* forall<a> (m1 : maybe<a>, m2 : maybe<a>) -> maybe<a> */  {
  return (m1 == null) ? m2 : m1;
}
 
// Choose a non-empty string
function _bar__bar__2(x, y) /* (x : string, y : string) -> string */  {
  return (empty_ques__1(x)) ? y : x;
}
 
// Return the element at position `index` in vector `v`, or `Nothing` if out of bounds
function at(v, index) /* forall<a> (v : vector<a>, index : int) -> maybe<a> */  {
  var idx = $std_core._int_to_int32(index);
  var _x2 = (((idx < 0)) || (((((v).length)) <= idx)));
  if (_x2) {
    return Nothing;
  }
  else {
    return Just((v)[idx]);
  }
}
 
// Do all elements satisfy a predicate ?
function _bind_all(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e bool */  {
  if (xs == null) {
    return true;
  }
  else {
    return $std_core._bind((predicate(xs.head)),(function(_y_13 /* bool */ ) {
      return (_y_13) ? _bind_all(xs.tail, predicate) : false;
    }));
  }
}
 
// Do all elements satisfy a predicate ?
function _fast_all(xs0, predicate0) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e bool */  { tailcall: while(1)
{
  if (xs0 == null) {
    return true;
  }
  else {
    return (predicate0(xs0.head)) ? _fast_all(xs0.tail, predicate0) : false;
  }
}}
 
// Do all elements satisfy a predicate ?
function all(xs1, predicate1) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e bool */  {
  return _bind_all(xs1, predicate1);
}
 
// Are there any elements in a list that satisfy a predicate ?
function _bind_any(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e bool */  {
  if (xs == null) {
    return false;
  }
  else {
    return $std_core._bind((predicate(xs.head)),(function(_y_17 /* bool */ ) {
      return (_y_17) ? true : _bind_any(xs.tail, predicate);
    }));
  }
}
 
// Are there any elements in a list that satisfy a predicate ?
function _fast_any(xs0, predicate0) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e bool */  { tailcall: while(1)
{
  if (xs0 == null) {
    return false;
  }
  else {
    return (predicate0(xs0.head)) ? true : _fast_any(xs0.tail, predicate0);
  }
}}
 
// Are there any elements in a list that satisfy a predicate ?
function any(xs1, predicate1) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e bool */  {
  return _bind_any(xs1, predicate1);
}
function dec(i) /* (i : int) -> int */  {
  return $std_core._int_sub(i,1);
}
function inc(i) /* (i : int) -> int */  {
  return $std_core._int_add(i,1);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
function _bind_for(start0, end, action) /* forall<e> (start : int, end : int, action : (int) -> e ()) -> e () */  {
  function rep(i) /* (i : int) -> 9091 () */  {
    if ($std_core._int_le(i,end)) {
      return $std_core._bind((action(i)),(function(__ /* () */ ) {
        return rep((inc(i)));
      }));
    }
    else {
      return _unit_;
    }
  }
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
function _fast_for(start0, end, action) /* forall<e> (start : int, end : int, action : (int) -> e ()) -> e () */  {
  function rep(i) /* (i : int) -> 9091 () */  { tailcall: while(1)
  {
    if ($std_core._int_le(i,end)) {
      action(i);
      {
        // tail call
        var _x3 = (inc(i));
        i = _x3;
        continue tailcall;
      }
    }
    else {
      return _unit_;
    }
  }}
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
function $for(start0, end, action) /* forall<e> (start : int, end : int, action : (int) -> e ()) -> e () */  {
  return _bind_for(start0, end, action);
}
function decr(i) /* (i : int32) -> int32 */  {
  return ((i - 1)|0);
}
function incr(i) /* (i : int32) -> int32 */  {
  return ((i + 1)|0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
function _bind_for32(start0, end, action) /* forall<e> (start : int32, end : int32, action : (int32) -> e ()) -> e () */  {
  function rep(i) /* (i : int32) -> 9195 () */  {
    if ((i <= end)) {
      return $std_core._bind((action(i)),(function(__ /* () */ ) {
        return rep((incr(i)));
      }));
    }
    else {
      return _unit_;
    }
  }
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
function _fast_for32(start0, end, action) /* forall<e> (start : int32, end : int32, action : (int32) -> e ()) -> e () */  {
  function rep(i) /* (i : int32) -> 9195 () */  { tailcall: while(1)
  {
    if ((i <= end)) {
      action(i);
      {
        // tail call
        var _x3 = (incr(i));
        i = _x3;
        continue tailcall;
      }
    }
    else {
      return _unit_;
    }
  }}
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
function for32(start0, end, action) /* forall<e> (start : int32, end : int32, action : (int32) -> e ()) -> e () */  {
  return _bind_for32(start0, end, action);
}
function _bind_foreach_indexed32(v, f) /* forall<a,e> (v : vector<a>, f : (a, int32) -> e ()) -> e () */  {
  return _bind_for32(0, decr(((v).length)), function(i /* int32 */ ) {
      return f((v)[i], i);
    });
}
function _fast_foreach_indexed32(v, f) /* forall<a,e> (v : vector<a>, f : (a, int32) -> e ()) -> e () */  {
  return _fast_for32(0, decr(((v).length)), function(i /* int32 */ ) {
      return f((v)[i], i);
    });
}
function foreach_indexed32(v, f) /* forall<a,e> (v : vector<a>, f : (a, int32) -> e ()) -> e () */  {
  return _bind_foreach_indexed32(v, f);
}
 
// Returns the length of a list.
function length_1(xs) /* forall<a> (xs : list<a>) -> int */  {
  function len0(acc, ys) /* forall<a> (int, list<a>) -> int */  { tailcall: while(1)
  {
    if (ys != null) {
      {
        // tail call
        var _x3 = $std_core._int_add(acc,1);
        acc = _x3;
        ys = ys.tail;
        continue tailcall;
      }
    }
    else {
      return acc;
    }
  }}
  return len0(0, xs);
}
 
// Return the length of a vector.
function length_2(v) /* forall<a> (v : vector<a>) -> int */  {
  return $std_core._int_double((((v).length)));
}
 
// recurse using an accumulator using constant heap space
function _bind_map_acc(g, n, acc, ys) /* forall<a,b,e> (g : (int, a, list<a>) -> e b, n : int, acc : list<b>, ys : list<a>) -> e list<b> */  {
  if (ys != null) {
    return $std_core._bind((g(n, ys.head, ys.tail)),(function(_y_49 /* 9410 */ ) {
      return _bind_map_acc(g, $std_core._int_add(n,1), Cons(_y_49, acc), ys.tail);
    }));
  }
  else {
    return reverse(acc);
  }
}
 
// recurse using an accumulator using constant heap space
function _fast_map_acc(g0, n0, acc0, ys0) /* forall<a,b,e> (g : (int, a, list<a>) -> e b, n : int, acc : list<b>, ys : list<a>) -> e list<b> */  { tailcall: while(1)
{
  if (ys0 != null) {
    {
      // tail call
      var _x3 = $std_core._int_add(n0,1);
      var _x4 = Cons(g0(n0, ys0.head, ys0.tail), acc0);
      n0 = _x3;
      acc0 = _x4;
      ys0 = ys0.tail;
      continue tailcall;
    }
  }
  else {
    return reverse(acc0);
  }
}}
 
// recurse using an accumulator using constant heap space
function map_acc(g1, n1, acc1, ys1) /* forall<a,b,e> (g : (int, a, list<a>) -> e b, n : int, acc : list<b>, ys : list<a>) -> e list<b> */  {
  return _bind_map_acc(g1, n1, acc1, ys1);
}
 
// Apply a function `f`  to each element of the input list in sequence where takes
// both the index of the current element, the element itself, and the tail list as arguments.
function _bind_map_indexed_peek(xs, f) /* forall<a,b,e> (xs : list<a>, f : (idx : int, value : a, rest : list<a>) -> e b) -> e list<b> */  {
   
  // recurse for the first `maxListStack` elements over the stack (to avoid extra heap allocation)
  function _bind_map_iter(g, n, ys) /* forall<a,b,e> (g : (int, a, list<a>) -> e b, n : int, ys : list<a>) -> e list<b> */  {
    if ($std_core._int_gt(n,maxListStack)) {
      return _bind_map_acc(g, n, Nil, ys);
    }
    else {
      if (ys != null) {
        return $std_core._bind((g(n, ys.head, ys.tail)),(function(_y_58 /* 9522 */ ) {
          return $std_core._bind((_bind_map_iter(g, $std_core._int_add(n,1), ys.tail)),(function(_y_62 /* list<9522> */ ) {
            return Cons(_y_58, _y_62);
          }));
        }));
      }
      else {
        return Nil;
      }
    }
  }
  return _bind_map_iter(f, 0, xs);
}
 
// Apply a function `f`  to each element of the input list in sequence where takes
// both the index of the current element, the element itself, and the tail list as arguments.
function _fast_map_indexed_peek(xs, f) /* forall<a,b,e> (xs : list<a>, f : (idx : int, value : a, rest : list<a>) -> e b) -> e list<b> */  {
   
  // recurse for the first `maxListStack` elements over the stack (to avoid extra heap allocation)
  function _fast_map_iter(g, n, ys) /* forall<a,b,e> (g : (int, a, list<a>) -> e b, n : int, ys : list<a>) -> e list<b> */  {
    if ($std_core._int_gt(n,maxListStack)) {
      return _fast_map_acc(g, n, Nil, ys);
    }
    else {
      if (ys != null) {
        return Cons(g(n, ys.head, ys.tail), _fast_map_iter(g, $std_core._int_add(n,1), ys.tail));
      }
      else {
        return Nil;
      }
    }
  }
  return _fast_map_iter(f, 0, xs);
}
 
// Apply a function `f`  to each element of the input list in sequence where takes
// both the index of the current element, the element itself, and the tail list as arguments.
function map_indexed_peek(xs, f) /* forall<a,b,e> (xs : list<a>, f : (idx : int, value : a, rest : list<a>) -> e b) -> e list<b> */  {
  return _bind_map_indexed_peek(xs, f);
}
function _bind_map(m, f) /* forall<a,b,e> (m : maybe<a>, f : (a) -> e b) -> e maybe<b> */  {
  if (m == null) {
    return Nothing;
  }
  else {
    return $std_core._bind((f(m.value)),(function(_y_79 /* 9773 */ ) {
      return Just(_y_79);
    }));
  }
}
function _fast_map(m, f) /* forall<a,b,e> (m : maybe<a>, f : (a) -> e b) -> e maybe<b> */  {
  if (m == null) {
    return Nothing;
  }
  else {
    return Just(f(m.value));
  }
}
function map(m, f) /* forall<a,b,e> (m : maybe<a>, f : (a) -> e b) -> e maybe<b> */  {
  return _bind_map(m, f);
}
 
// Returns an integer list of increasing elements from `lo`  to `hi`
// (including both `lo`  and `hi` ).
// If `lo > hi`  the function returns the empty list.
function list(lo, hi) /* (lo : int, hi : int) -> total list<int> */  {
  function enumerate(low, high, acc) /* (low : int, high : int, acc : list<int>) -> list<int> */  { tailcall: while(1)
  {
    if ($std_core._int_gt(low,high)) {
      return acc;
    }
    else {
      {
        // tail call
        var _x5 = ($std_core._int_sub(high,1));
        var _x6 = Cons(high, acc);
        high = _x5;
        acc = _x6;
        continue tailcall;
      }
    }
  }}
  return enumerate(lo, hi, Nil);
}
 
// Applies a function `f` to list of increasing elements from `lo`  to `hi`
// (including both `lo`  and `hi` ).
// If `lo > hi`  the function returns the empty list.
function _bind_list_1(lo, hi, f) /* forall<a,e> (lo : int, hi : int, f : (int) -> e a) -> e list<a> */  {
  function enumerate(low, high, acc) /* (low : int, high : int, acc : list<11103>) -> 11104 list<11103> */  {
    if ($std_core._int_gt(low,high)) {
      return acc;
    }
    else {
      return $std_core._bind((f(high)),(function(_y_89 /* 11103 */ ) {
        return enumerate(low, ($std_core._int_sub(high,1)), Cons(_y_89, acc));
      }));
    }
  }
  return enumerate(lo, hi, Nil);
}
 
// Applies a function `f` to list of increasing elements from `lo`  to `hi`
// (including both `lo`  and `hi` ).
// If `lo > hi`  the function returns the empty list.
function _fast_list_1(lo, hi, f) /* forall<a,e> (lo : int, hi : int, f : (int) -> e a) -> e list<a> */  {
  function enumerate(low, high, acc) /* (low : int, high : int, acc : list<11103>) -> 11104 list<11103> */  { tailcall: while(1)
  {
    if ($std_core._int_gt(low,high)) {
      return acc;
    }
    else {
      {
        // tail call
        var _x5 = ($std_core._int_sub(high,1));
        var _x6 = Cons(f(high), acc);
        high = _x5;
        acc = _x6;
        continue tailcall;
      }
    }
  }}
  return enumerate(lo, hi, Nil);
}
 
// Applies a function `f` to list of increasing elements from `lo`  to `hi`
// (including both `lo`  and `hi` ).
// If `lo > hi`  the function returns the empty list.
function list_1(lo, hi, f) /* forall<a,e> (lo : int, hi : int, f : (int) -> e a) -> e list<a> */  {
  return _bind_list_1(lo, hi, f);
}
 
// Apply a function `f`  to each element of the input list in sequence.
function _bind_map_5(xs, f) /* forall<a,b,e> (xs : list<a>, f : (a) -> e b) -> e list<b> */  {
  return _bind_map_indexed_peek(xs, function(i /* int */ , x /* 10545 */ , xx /* list<10545> */ ) {
      return f(x);
    });
}
 
// Apply a function `f`  to each element of the input list in sequence.
function _fast_map_5(xs, f) /* forall<a,b,e> (xs : list<a>, f : (a) -> e b) -> e list<b> */  {
  return _fast_map_indexed_peek(xs, function(i /* int */ , x /* 10545 */ , xx /* list<10545> */ ) {
      return f(x);
    });
}
 
// Apply a function `f`  to each element of the input list in sequence.
function map_5(xs, f) /* forall<a,b,e> (xs : list<a>, f : (a) -> e b) -> e list<b> */  {
  return _bind_map_5(xs, f);
}
 
// Create a list of characters from `lo`  to `hi`  (inclusive).
function list_2(lo, hi) /* (lo : char, hi : char) -> total list<char> */  {
  return map_5(list(lo, hi), (function(_x5) {
      return (_x5);
    }));
}
 
// Convert a `:maybe` type to a list type.
function list_3(m) /* forall<a> (m : maybe<a>) -> list<a> */  {
  return (m == null) ? Nil : Cons(m.value, Nil);
}
 
// Convert a string to a list of characters
function list_4(s) /* (s : string) -> total list<char> */  {
  return _string_to_list(s);
}
 
// Convert a vector to a list.
function list_5(v) /* forall<a> (v : vector<a>) -> list<a> */  {
  return vlist(v);
}
 
// Map over the `Right` component of an `:either` type.
function _bind_map_1(e, f) /* forall<a,b,c,e> (e : either<a,b>, f : (b) -> e c) -> e either<a,c> */  {
  if (e._tag === 2) {
    return $std_core._bind((f(e.right)),(function(_y_96 /* 9811 */ ) {
      return Right(_y_96);
    }));
  }
  else {
    return Left(e.left);
  }
}
 
// Map over the `Right` component of an `:either` type.
function _fast_map_1(e, f) /* forall<a,b,c,e> (e : either<a,b>, f : (b) -> e c) -> e either<a,c> */  {
  if (e._tag === 2) {
    return Right(f(e.right));
  }
  else {
    return Left(e.left);
  }
}
 
// Map over the `Right` component of an `:either` type.
function map_1(e, f) /* forall<a,b,c,e> (e : either<a,b>, f : (b) -> e c) -> e either<a,c> */  {
  return _bind_map_1(e, f);
}
function _bind_map_2(t, f) /* forall<a,b,e> (t : (a, a), f : (a) -> e b) -> e (b, b) */  {
  return $std_core._bind((f(fst(t))),(function(_y_101 /* 9972 */ ) {
    return $std_core._bind((f(snd(t))),(function(_y_103 /* 9972 */ ) {
      return _tuple2_(_y_101, _y_103);
    }));
  }));
}
function _fast_map_2(t, f) /* forall<a,b,e> (t : (a, a), f : (a) -> e b) -> e (b, b) */  {
  return _tuple2_(f(fst(t)), f(snd(t)));
}
function map_2(t, f) /* forall<a,b,e> (t : (a, a), f : (a) -> e b) -> e (b, b) */  {
  return _bind_map_2(t, f);
}
function _bind_map_3(t, f) /* forall<a,b,e> (t : (a, a, a), f : (a) -> e b) -> e (b, b, b) */  {
  return $std_core._bind((f(fst_1(t))),(function(_y_106 /* 10212 */ ) {
    return $std_core._bind((f(snd_1(t))),(function(_y_108 /* 10212 */ ) {
      return $std_core._bind((f(thd(t))),(function(_y_110 /* 10212 */ ) {
        return _tuple3_(_y_106, _y_108, _y_110);
      }));
    }));
  }));
}
function _fast_map_3(t, f) /* forall<a,b,e> (t : (a, a, a), f : (a) -> e b) -> e (b, b, b) */  {
  return _tuple3_(f(fst_1(t)), f(snd_1(t)), f(thd(t)));
}
function map_3(t, f) /* forall<a,b,e> (t : (a, a, a), f : (a) -> e b) -> e (b, b, b) */  {
  return _bind_map_3(t, f);
}
function _bind_map_4(t, f) /* forall<a,b,e> (t : (a, a, a, a), f : (a) -> e b) -> e (b, b, b, b) */  {
  return $std_core._bind((f(fst_2(t))),(function(_y_113 /* 10525 */ ) {
    return $std_core._bind((f(snd_2(t))),(function(_y_115 /* 10525 */ ) {
      return $std_core._bind((f(thd_1(t))),(function(_y_117 /* 10525 */ ) {
        return $std_core._bind((f(field4(t))),(function(_y_119 /* 10525 */ ) {
          return _tuple4_(_y_113, _y_115, _y_117, _y_119);
        }));
      }));
    }));
  }));
}
function _fast_map_4(t, f) /* forall<a,b,e> (t : (a, a, a, a), f : (a) -> e b) -> e (b, b, b, b) */  {
  return _tuple4_(f(fst_2(t)), f(snd_2(t)), f(thd_1(t)), f(field4(t)));
}
function map_4(t, f) /* forall<a,b,e> (t : (a, a, a, a), f : (a) -> e b) -> e (b, b, b, b) */  {
  return _bind_map_4(t, f);
}
 
// Apply a function `f` to each character in a string
function _bind_map_6(s, f) /* forall<e> (s : string, f : (char) -> e char) -> e string */  {
  return $std_core._bind((_bind_map_5(list_4(s), f)),string_2);
}
 
// Apply a function `f` to each character in a string
function _fast_map_6(s, f) /* forall<e> (s : string, f : (char) -> e char) -> e string */  {
  return string_2(_fast_map_5(list_4(s), f));
}
 
// Apply a function `f` to each character in a string
function map_6(s, f) /* forall<e> (s : string, f : (char) -> e char) -> e string */  {
  return _bind_map_6(s, f);
}
 
// Apply a total function `f` to each element in a vector `v`
function _bind_map_7(v, f) /* forall<a,b,e> (v : vector<a>, f : (a) -> e b) -> e vector<b> */  {
  var w_26018 = Array(($std_core._int_to_int32((length_2(v)))));
  return $std_core._bind((_bind_foreach_indexed32(v, function(x /* 10958 */ , i /* int32 */ ) {
      return $std_core._bind((f(x)),(function(_y_128 /* 10959 */ ) {
        return (w_26018)[i] = _y_128;
      }));
    })),(function(__ /* () */ ) {
    return w_26018;
  }));
}
 
// Apply a total function `f` to each element in a vector `v`
function _fast_map_7(v, f) /* forall<a,b,e> (v : vector<a>, f : (a) -> e b) -> e vector<b> */  {
  var w = Array(($std_core._int_to_int32((length_2(v)))));
  _fast_foreach_indexed32(v, function(x /* 10958 */ , i /* int32 */ ) {
      return (w)[i] = (f(x));
    });
  return w;
}
 
// Apply a total function `f` to each element in a vector `v`
function map_7(v, f) /* forall<a,b,e> (v : vector<a>, f : (a) -> e b) -> e vector<b> */  {
  return _bind_map_7(v, f);
}
 
// Return the maximum of two integers
function max(i, j) /* (i : int, j : int) -> int */  {
  return ($std_core._int_ge(i,j)) ? i : j;
}
 
// Returns the largest of two doubles
function max_1(x, y) /* (x : double, y : double) -> double */  {
  return ((x >= y)) ? x : y;
}
 
// Return the minimum of two integers
function min(i, j) /* (i : int, j : int) -> int */  {
  return ($std_core._int_le(i,j)) ? i : j;
}
 
// Returns the smallest of two doubles
function min_1(x, y) /* (x : double, y : double) -> double */  {
  return ((x <= y)) ? x : y;
}
 
// Fold a list from the left, i.e. `foldl([1,2],0,(+)) == (0+1)+2`
// Since `foldl` is tail recursive, it is preferred over `foldr` when using an associative function `f`
function _bind_foldl(xs, z, f) /* forall<a,b,e> (list<a>, b, (b, a) -> e b) -> e b */  {
  if (xs != null) {
    return $std_core._bind((f(z, xs.head)),(function(_y_131 /* 12237 */ ) {
      return _bind_foldl(xs.tail, _y_131, f);
    }));
  }
  else {
    return z;
  }
}
 
// Fold a list from the left, i.e. `foldl([1,2],0,(+)) == (0+1)+2`
// Since `foldl` is tail recursive, it is preferred over `foldr` when using an associative function `f`
function _fast_foldl(xs0, z0, f0) /* forall<a,b,e> (list<a>, b, (b, a) -> e b) -> e b */  { tailcall: while(1)
{
  if (xs0 != null) {
    {
      // tail call
      var _x6 = f0(z0, xs0.head);
      xs0 = xs0.tail;
      z0 = _x6;
      continue tailcall;
    }
  }
  else {
    return z0;
  }
}}
 
// Fold a list from the left, i.e. `foldl([1,2],0,(+)) == (0+1)+2`
// Since `foldl` is tail recursive, it is preferred over `foldr` when using an associative function `f`
function foldl(xs1, z1, f1) /* forall<a,b,e> (list<a>, b, (b, a) -> e b) -> e b */  {
  return _bind_foldl(xs1, z1, f1);
}
 
// Return the sum of a list of integers
function sum(xs) /* (xs : list<int>) -> int */  {
  return foldl(xs, 0, function(x /* int */ , y /* int */ ) {
      return $std_core._int_add(x,y);
    });
}
 
// Catch any exception raised in `action` and handle it.
// Use `on-exn` or `on-exit` when appropiate.
function _bind_try(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return $std_core._handle_catch(action, hndl, false);
}
 
// Catch any exception raised in `action` and handle it.
// Use `on-exn` or `on-exit` when appropiate.
function _fast_try(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return $std_core._handle_catch(action, hndl, false);
}
 
// Catch any exception raised in `action` and handle it.
// Use `on-exn` or `on-exit` when appropiate.
function $try(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return _bind_try(action, hndl);
}
 
// Transform an exception effect to a `:try` type.
function _bind_try_1(action) /* forall<a,e> (action : () -> <exn|e> a) -> e try<a> */  {
  return _bind_try(function() {
      return $std_core._bind((action()),(function(_y_135 /* 12362 */ ) {
        return Ok(_y_135);
      }));
    }, function(exception0 /* exception */ ) {
      return (Exn(exception0));
    });
}
 
// Transform an exception effect to a `:try` type.
function _fast_try_1(action) /* forall<a,e> (action : () -> <exn|e> a) -> e try<a> */  {
  return _fast_try(function() {
      return Ok(action());
    }, Exn);
}
 
// Transform an exception effect to a `:try` type.
function try_1(action) /* forall<a,e> (action : () -> <exn|e> a) -> e try<a> */  {
  return _bind_try_1(action);
}
function _bind_zipwith_acc(f, i, acc, xs, ys) /* forall<a,b,c,e> ((int, a, b) -> e c, int, list<c>, list<a>, list<b>) -> e list<c> */  {
  if (xs == null) {
    return reverse(acc);
  }
  else {
    if (ys == null) {
      return reverse(acc);
    }
    else {
      return $std_core._bind((f(i, xs.head, ys.head)),(function(_y_143 /* 12398 */ ) {
        return _bind_zipwith_acc(f, $std_core._int_add(i,1), Cons(_y_143, acc), xs.tail, ys.tail);
      }));
    }
  }
}
function _fast_zipwith_acc(f0, i0, acc0, xs0, ys0) /* forall<a,b,c,e> ((int, a, b) -> e c, int, list<c>, list<a>, list<b>) -> e list<c> */  { tailcall: while(1)
{
  if (xs0 == null) {
    return reverse(acc0);
  }
  else {
    if (ys0 == null) {
      return reverse(acc0);
    }
    else {
      {
        // tail call
        var _x7 = $std_core._int_add(i0,1);
        var _x8 = Cons(f0(i0, xs0.head, ys0.head), acc0);
        i0 = _x7;
        acc0 = _x8;
        xs0 = xs0.tail;
        ys0 = ys0.tail;
        continue tailcall;
      }
    }
  }
}}
function zipwith_acc(f1, i1, acc1, xs1, ys1) /* forall<a,b,c,e> ((int, a, b) -> e c, int, list<c>, list<a>, list<b>) -> e list<c> */  {
  return _bind_zipwith_acc(f1, i1, acc1, xs1, ys1);
}
function _bind_zipwith_iter(f, i, xs, ys) /* forall<a,b,c,e> ((int, a, b) -> e c, int, list<a>, list<b>) -> e list<c> */  {
  if ($std_core._int_gt(i,maxListStack)) {
    return _bind_zipwith_acc(f, i, Nil, xs, ys);
  }
  else {
    if (xs == null) {
      return Nil;
    }
    else {
      if (ys == null) {
        return Nil;
      }
      else {
        return $std_core._bind((f(i, xs.head, ys.head)),(function(_y_152 /* 12519 */ ) {
          return $std_core._bind((_bind_zipwith_iter(f, $std_core._int_add(i,1), xs.tail, ys.tail)),(function(_y_156 /* list<12519> */ ) {
            return Cons(_y_152, _y_156);
          }));
        }));
      }
    }
  }
}
function _fast_zipwith_iter(f0, i0, xs0, ys0) /* forall<a,b,c,e> ((int, a, b) -> e c, int, list<a>, list<b>) -> e list<c> */  {
  if ($std_core._int_gt(i0,maxListStack)) {
    return _fast_zipwith_acc(f0, i0, Nil, xs0, ys0);
  }
  else {
    if (xs0 == null) {
      return Nil;
    }
    else {
      if (ys0 == null) {
        return Nil;
      }
      else {
        return Cons(f0(i0, xs0.head, ys0.head), _fast_zipwith_iter(f0, $std_core._int_add(i0,1), xs0.tail, ys0.tail));
      }
    }
  }
}
function zipwith_iter(f1, i1, xs1, ys1) /* forall<a,b,c,e> ((int, a, b) -> e c, int, list<a>, list<b>) -> e list<c> */  {
  return _bind_zipwith_iter(f1, i1, xs1, ys1);
}
 
// Zip two lists together by apply a function `f` to all corresponding elements
// and their index in the list.
// The returned list is only as long as the smallest input list.
function _bind_zipwith_indexed(xs, ys, f) /* forall<a,b,c,e> (xs : list<a>, ys : list<b>, f : (int, a, b) -> e c) -> e list<c> */  {
  return _bind_zipwith_iter(f, 0, xs, ys);
}
 
// Zip two lists together by apply a function `f` to all corresponding elements
// and their index in the list.
// The returned list is only as long as the smallest input list.
function _fast_zipwith_indexed(xs, ys, f) /* forall<a,b,c,e> (xs : list<a>, ys : list<b>, f : (int, a, b) -> e c) -> e list<c> */  {
  return _fast_zipwith_iter(f, 0, xs, ys);
}
 
// Zip two lists together by apply a function `f` to all corresponding elements
// and their index in the list.
// The returned list is only as long as the smallest input list.
function zipwith_indexed(xs, ys, f) /* forall<a,b,c,e> (xs : list<a>, ys : list<b>, f : (int, a, b) -> e c) -> e list<c> */  {
  return _bind_zipwith_indexed(xs, ys, f);
}
 
// Zip two lists together by pairing the corresponding elements.
// The returned list is only as long as the smallest input list.
function zip(xs, ys) /* forall<a,b> (xs : list<a>, ys : list<b>) -> list<(a, b)> */  {
  return zipwith_indexed(xs, ys, function(i /* int */ , x /* 12643 */ , y /* 12644 */ ) {
      return _tuple2_(x, y);
    });
}
 
// O(1). Return the string slice from the end of `slice` argument
// to the end of the string.
function after(slice0) /* (slice : sslice) -> sslice */  {
  return Sslice(slice0.str, (((slice0.start) + (slice0.len))|0), ((((slice0.str).length) - ((((slice0.start) + (slice0.len))|0)))|0));
}
 
// Is the character a lower-case ASCII character ?
function lower_ques_(c) /* (c : char) -> bool */  {
  return (((c >= 0x0061)) && ((c <= 0x007A)));
}
 
// Is the character an upper-case ASCII character ?
function upper_ques_(c) /* (c : char) -> bool */  {
  return (((c >= 0x0041)) && ((c <= 0x005A)));
}
 
// Is the character an ASCII letter ?
function alpha_ques_(c) /* (c : char) -> bool */  {
  return ((lower_ques_(c)) || (upper_ques_(c)));
}
 
// Is the character an ASCII digit ?
function digit_ques_(c) /* (c : char) -> bool */  {
  return (((c >= 0x0030)) && ((c <= 0x0039)));
}
 
// Is the character ASCII letter or digit?
function alpha_num_ques_(c) /* (c : char) -> bool */  {
  return ((alpha_ques_(c)) || (digit_ques_(c)));
}
 
// Is the character an ASCII character, e.g. `c <= '\x7F'`  ?
function ascii_ques_(c) /* (c : char) -> bool */  {
  return (c <= 0x007F);
}
function $throw(exn) /* forall<a> (exn : exception) -> exn a */  {
  return exn_throw(exn);
}
 
// Throw an exception
function throw_1(message0, err) /* forall<a> (message : string, err : ?exception-info) -> exn a */  {
  var _err_13041 = (err !== undefined) ? err : $Error;
  return $throw(exception(message0, _err_13041));
}
 
// Raise an exception with a specified message.
function error(message0) /* forall<a> (message : string) -> exn a */  {
  return throw_1(message0, $Error);
}
 
// _Unsafe_. This function removes the exception effect (`:exn`) from the effect of an action
function _bind_unsafe_noexn(action) /* forall<a,e> (action : () -> <exn|e> a) -> e a */  {
  return unsafe_total(action);
}
 
// _Unsafe_. This function removes the exception effect (`:exn`) from the effect of an action
function _fast_unsafe_noexn(action) /* forall<a,e> (action : () -> <exn|e> a) -> e a */  {
  return unsafe_total(action);
}
 
// _Unsafe_. This function removes the exception effect (`:exn`) from the effect of an action
function unsafe_noexn(action) /* forall<a,e> (action : () -> <exn|e> a) -> e a */  {
  return _bind_unsafe_noexn(action);
}
function assert(message0, condition) /* (message : string, condition : bool) -> () */  {
  return (!(condition)) ? unsafe_noexn(function() {
    return throw_1(message0, Assert);
  }) : _unit_;
}
 
// Convert an int to a boolean, using `False` for 0 and `True` otherwise.
function bool(i) /* (i : int) -> bool */  {
  return $std_core._int_ne(i,0);
}
 
// Convert a `:maybe` type to a boolean using `False` for `Nothing` and `True` for `Just`.
function bool_1(m) /* forall<a> (m : maybe<a>) -> bool */  {
  return (m == null) ? false : true;
}
 
// Convert a string to a boolean, using `False` for the empty string and `True` otherwise.
function bool_2(s) /* (s : string) -> bool */  {
  return (s !== (""));
}
 
// Was this a cancelation exception?
function cancel_ques__1(exn) /* (exn : exception) -> bool */  {
  var _x9 = info(exn);
  return (_x9._tag === _tag_Cancel);
}
 
// O(`n`). The first `n` (default = `1`) characters in a string.
function first(s, n) /* (s : string, n : ?int) -> sslice */  {
  var _n_13291 = (n !== undefined) ? n : 1;
  var slice0 = _sslice_first(s);
  if ($std_core._int_eq(_n_13291,1)) {
    return slice0;
  }
  else {
    return extend(slice0, $std_core._int_sub(_n_13291,1));
  }
}
 
// Convert the first character of a string to uppercase.
function capitalize(s) /* (s : string) -> string */  {
  return ((to_upper(string_3(first(s)))) + (string_3(after(first(s)))));
}
 
// _Deprecated_; use `try` instead. Catch an exception raised by `throw` and handle it.
// Use `on-exn` or `on-exit` when appropiate.
function _bind_catch(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return _bind_try(action, hndl);
}
 
// _Deprecated_; use `try` instead. Catch an exception raised by `throw` and handle it.
// Use `on-exn` or `on-exit` when appropiate.
function _fast_catch(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return _fast_try(action, hndl);
}
 
// _Deprecated_; use `try` instead. Catch an exception raised by `throw` and handle it.
// Use `on-exn` or `on-exit` when appropiate.
function $catch(action, hndl) /* forall<a,e> (action : () -> <exn|e> a, hndl : (exception) -> e a) -> e a */  {
  return _bind_catch(action, hndl);
}
function cdivmod_exp10(i, n) /* (i : int, n : int) -> (int, int) */  {
  if ($std_core._int_le(n,0)) {
    return _tuple2_(i, 0);
  }
  else {
    var cq = cdiv_exp10(i, n);
    return _tuple2_(cq, $std_core._int_sub(i,(mul_exp10(cq, n))));
  }
}
 
// Return a random boolean
function random_bool() /* () -> ndet bool */  {
  return ((random()) >= (0.5));
}
 
// Returns one of its arguments `x`  or `y`  based on a non-deterministic choice.
function choose(x, y) /* forall<a> (x : a, y : a) -> ndet a */  {
  return (random_bool()) ? x : y;
}
 
// Concatenate all lists in a list (e.g. flatten the list). (tail-recursive)
function concat(xs) /* forall<a> (xs : list<list<a>>) -> list<a> */  {
  function concat_rev(xss, acc) /* forall<a> (xss : list<list<a>>, acc : list<a>) -> list<a> */  { tailcall: while(1)
  {
    if (xss != null) {
      {
        // tail call
        var _x10 = _plus__4(xss.head, acc);
        xss = xss.tail;
        acc = _x10;
        continue tailcall;
      }
    }
    else {
      return acc;
    }
  }}
  return concat_rev(reverse(xs), Nil);
}
 
// Concatenate a list of `:maybe` values
function concat_maybe(xs) /* forall<a> (xs : list<maybe<a>>) -> list<a> */  {
  return concat(map_5(xs, list_3));
}
 
// Is the character an ASCII control character, e.g. `c < ' '`  ?
function control_ques_(c) /* (c : char) -> bool */  {
  return (c < 0x0020);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
// If `action` returns `Just`, the iteration is stopped and the result returned
function _bind_for_while32(start0, end, action) /* forall<a,e> (start : int32, end : int32, action : (int32) -> e maybe<a>) -> e maybe<a> */  {
  function rep(i) /* (i : int32) -> 13932 maybe<13931> */  {
    if ((i <= end)) {
      return $std_core._bind((action(i)),(function(_y_167 /* maybe<13931> */ ) {
        if (_y_167 == null) {
          return rep((incr(i)));
        }
        else {
          return Just(_y_167.value);
        }
      }));
    }
    else {
      return Nothing;
    }
  }
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
// If `action` returns `Just`, the iteration is stopped and the result returned
function _fast_for_while32(start0, end, action) /* forall<a,e> (start : int32, end : int32, action : (int32) -> e maybe<a>) -> e maybe<a> */  {
  function rep(i) /* (i : int32) -> 13932 maybe<13931> */  { tailcall: while(1)
  {
    if ((i <= end)) {
      var _x10 = action(i);
      if (_x10 == null) {
        {
          // tail call
          var _x11 = (incr(i));
          i = _x11;
          continue tailcall;
        }
      }
      else {
        return Just(_x10.value);
      }
    }
    else {
      return Nothing;
    }
  }}
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
// If `action` returns `Just`, the iteration is stopped and the result returned
function for_while32(start0, end, action) /* forall<a,e> (start : int32, end : int32, action : (int32) -> e maybe<a>) -> e maybe<a> */  {
  return _bind_for_while32(start0, end, action);
}
 
// O(1). The entire string as a slice
function slice(s) /* (s : string) -> sslice */  {
  return Sslice(s, 0, s.length);
}
 
// Invoke `action` for each element of a list while `action` return `Nothing`
function _bind_foreach_while(xs, action) /* forall<a,b,e> (xs : list<a>, action : (a) -> e maybe<b>) -> e maybe<b> */  {
  if (xs == null) {
    return Nothing;
  }
  else {
    return $std_core._bind((action(xs.head)),(function(_y_175 /* maybe<14072> */ ) {
      return (_y_175 == null) ? _bind_foreach_while(xs.tail, action) : _y_175;
    }));
  }
}
 
// Invoke `action` for each element of a list while `action` return `Nothing`
function _fast_foreach_while(xs0, action0) /* forall<a,b,e> (xs : list<a>, action : (a) -> e maybe<b>) -> e maybe<b> */  { tailcall: while(1)
{
  if (xs0 == null) {
    return Nothing;
  }
  else {
    var _x10 = action0(xs0.head);
    return (_x10 == null) ? _fast_foreach_while(xs0.tail, action0) : _x10;
  }
}}
 
// Invoke `action` for each element of a list while `action` return `Nothing`
function foreach_while(xs1, action1) /* forall<a,b,e> (xs : list<a>, action : (a) -> e maybe<b>) -> e maybe<b> */  {
  return _bind_foreach_while(xs1, action1);
}
 
// Apply a function for each character in a string slice.
// If `action` returns `Just`, the function returns immediately with that result.
function _bind_foreach_while_1(slice0, action) /* forall<a,e> (slice : sslice, action : (c : char) -> e maybe<a>) -> e maybe<a> */  {
  var _x11 = next(slice0);
  if (_x11 == null) {
    return Nothing;
  }
  else {
    return $std_core._bind((action(_x11.value.fst)),(function(_y_180 /* maybe<14159> */ ) {
      if (_y_180 == null) {
        return _bind_foreach_while_1((_x11.value.snd), action);
      }
      else {
        return _y_180;
      }
    }));
  }
}
 
// Apply a function for each character in a string slice.
// If `action` returns `Just`, the function returns immediately with that result.
function _fast_foreach_while_1(slice1, action0) /* forall<a,e> (slice : sslice, action : (c : char) -> e maybe<a>) -> e maybe<a> */  { tailcall: while(1)
{
  var _x12 = next(slice1);
  if (_x12 == null) {
    return Nothing;
  }
  else {
    var _x13 = action0(_x12.value.fst);
    if (_x13 == null) {
      {
        // tail call
        var _x14 = (_x12.value.snd);
        slice1 = _x14;
        continue tailcall;
      }
    }
    else {
      return _x13;
    }
  }
}}
 
// Apply a function for each character in a string slice.
// If `action` returns `Just`, the function returns immediately with that result.
function foreach_while_1(slice2, action1) /* forall<a,e> (slice : sslice, action : (c : char) -> e maybe<a>) -> e maybe<a> */  {
  return _bind_foreach_while_1(slice2, action1);
}
 
// Invoke a function for each character in a string.
// If `action` returns `Just`, the function returns immediately with that result.
function _bind_foreach_while_2(s, action) /* forall<a,e> (s : string, action : (c : char) -> e maybe<a>) -> e maybe<a> */  {
  return _bind_foreach_while_1(slice(s), action);
}
 
// Invoke a function for each character in a string.
// If `action` returns `Just`, the function returns immediately with that result.
function _fast_foreach_while_2(s, action) /* forall<a,e> (s : string, action : (c : char) -> e maybe<a>) -> e maybe<a> */  {
  return _fast_foreach_while_1(slice(s), action);
}
 
// Invoke a function for each character in a string.
// If `action` returns `Just`, the function returns immediately with that result.
function foreach_while_2(s, action) /* forall<a,e> (s : string, action : (c : char) -> e maybe<a>) -> e maybe<a> */  {
  return _bind_foreach_while_2(s, action);
}
 
// Invoke a function `f` for each element in a vector `v`.
// If `f` returns `Just`, the iteration is stopped early and the result is returned.
function _bind_foreach_while_3(v, f) /* forall<a,b,e> (v : vector<a>, f : (a) -> e maybe<b>) -> e maybe<b> */  {
  return _bind_for_while32(0, decr(((v).length)), function(i /* int32 */ ) {
      return f((v)[i]);
    });
}
 
// Invoke a function `f` for each element in a vector `v`.
// If `f` returns `Just`, the iteration is stopped early and the result is returned.
function _fast_foreach_while_3(v, f) /* forall<a,b,e> (v : vector<a>, f : (a) -> e maybe<b>) -> e maybe<b> */  {
  return _fast_for_while32(0, decr(((v).length)), function(i /* int32 */ ) {
      return f((v)[i]);
    });
}
 
// Invoke a function `f` for each element in a vector `v`.
// If `f` returns `Just`, the iteration is stopped early and the result is returned.
function foreach_while_3(v, f) /* forall<a,b,e> (v : vector<a>, f : (a) -> e maybe<b>) -> e maybe<b> */  {
  return _bind_foreach_while_3(v, f);
}
 
// Invoke `action` for each element of a list
function _bind_foreach(xs, action) /* forall<a,e> (xs : list<a>, action : (a) -> e ()) -> e () */  {
  if (xs == null) {
    return _unit_;
  }
  else {
    return $std_core._bind((action(xs.head)),(function(__ /* () */ ) {
      return _bind_foreach(xs.tail, action);
    }));
  }
}
 
// Invoke `action` for each element of a list
function _fast_foreach(xs0, action0) /* forall<a,e> (xs : list<a>, action : (a) -> e ()) -> e () */  { tailcall: while(1)
{
  if (xs0 == null) {
    return _unit_;
  }
  else {
    action0(xs0.head);
    {
      // tail call
      xs0 = xs0.tail;
      continue tailcall;
    }
  }
}}
 
// Invoke `action` for each element of a list
function foreach(xs1, action1) /* forall<a,e> (xs : list<a>, action : (a) -> e ()) -> e () */  {
  return _bind_foreach(xs1, action1);
}
 
// Apply a function for each character in a string slice.
function _bind_foreach_1(slice0, action) /* forall<e> (slice : sslice, action : (c : char) -> e ()) -> e () */  {
  return $std_core._bind((_bind_foreach_while_1(slice0, function(c /* char */ ) {
      return $std_core._bind((action(c)),(function(__ /* () */ ) {
        return Nothing;
      }));
    })),(function(__0 /* maybe<void> */ ) {
    return _unit_;
  }));
}
 
// Apply a function for each character in a string slice.
function _fast_foreach_1(slice0, action) /* forall<e> (slice : sslice, action : (c : char) -> e ()) -> e () */  {
  _fast_foreach_while_1(slice0, function(c /* char */ ) {
      action(c);
      return Nothing;
    });
  return _unit_;
}
 
// Apply a function for each character in a string slice.
function foreach_1(slice0, action) /* forall<e> (slice : sslice, action : (c : char) -> e ()) -> e () */  {
  return _bind_foreach_1(slice0, action);
}
 
// Invoke a function for each character in a string
function _bind_foreach_2(s, action) /* forall<e> (s : string, action : (c : char) -> e ()) -> e () */  {
  return _bind_foreach_1(slice(s), action);
}
 
// Invoke a function for each character in a string
function _fast_foreach_2(s, action) /* forall<e> (s : string, action : (c : char) -> e ()) -> e () */  {
  return _fast_foreach_1(slice(s), action);
}
 
// Invoke a function for each character in a string
function foreach_2(s, action) /* forall<e> (s : string, action : (c : char) -> e ()) -> e () */  {
  return _bind_foreach_2(s, action);
}
 
// Invoke a function `f` for each element in a vector `v`
function _bind_foreach_3(v, f) /* forall<a,e> (v : vector<a>, f : (a) -> e ()) -> e () */  {
  return _bind_foreach_indexed32(v, function(x /* 14559 */ , ___lp_2339_comma_30_rp_ /* int32 */ ) {
      return f(x);
    });
}
 
// Invoke a function `f` for each element in a vector `v`
function _fast_foreach_3(v, f) /* forall<a,e> (v : vector<a>, f : (a) -> e ()) -> e () */  {
  return _fast_foreach_indexed32(v, function(x /* 14559 */ , ___lp_2339_comma_30_rp_ /* int32 */ ) {
      return f(x);
    });
}
 
// Invoke a function `f` for each element in a vector `v`
function foreach_3(v, f) /* forall<a,e> (v : vector<a>, f : (a) -> e ()) -> e () */  {
  return _bind_foreach_3(v, f);
}
 
// O(n). Return the number of characters in a string.
function count_1(s) /* (s : string) -> int */  {
  return _string_count(s);
}
 
// O(n). Return the number of characters in a string slice
function count_2(slice0) /* (slice : sslice) -> int */  {
  return _sslice_count(slice0);
}
 
// Count the number of times a predicate is true for each character in a string
function count_3(s, pred) /* (s : string, pred : (char) -> bool) -> int */  {
  var cnt = { value: 0 };
  foreach_2(s, function(c /* char */ ) {
      if (pred(c)) {
        return ((cnt).value = ($std_core._int_add((((cnt).value)),1)));
      }
      else {
        return _unit_;
      }
    });
  return ((cnt).value);
}
 
// Create a new `:delayed` value.
function delay(action) /* forall<a,e> (action : () -> e a) -> delayed<e,a> */  {
  return unsafe_total(function() {
    return { value: (Left(action)) };
  });
}
 
// Calculate `10^exp`
function exp10(exp) /* (exp : int) -> int */  {
  return mul_exp10(1, exp);
}
 
// Is the integer negative (stricly smaller than zero)
function neg_ques__1(i) /* (i : int) -> bool */  {
  return _eq__eq__4($std_core._int_sign(i), Lt);
}
 
// Is the value negative?
function neg_ques__2(d) /* (d : double) -> bool */  {
  return (d < (0.0));
}
function divmod_exp10(i, n) /* (i : int, n : int) -> (int, int) */  {
  var _x15 = cdivmod_exp10(i, n);
  var _x16 = !((neg_ques__1(_x15.snd)));
  if (_x16) {
    return _tuple2_(_x15.fst, _x15.snd);
  }
  else {
    return _tuple2_(dec(_x15.fst), $std_core._int_add((_x15.snd),(exp10(n))));
  }
}
 
// Drop the first `n` elements of a list (or fewer if the list is shorter than `n`)
function drop(xs, n) /* forall<a> (xs : list<a>, n : int) -> list<a> */  { tailcall: while(1)
{
  if ($std_core._int_le(n,0)) {
    return xs;
  }
  else {
    if (xs == null) {
      return Nil;
    }
    else {
      {
        // tail call
        var _x17 = $std_core._int_sub(n,1);
        xs = xs.tail;
        n = _x17;
        continue tailcall;
      }
    }
  }
}}
function _bind_span(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e (list<a>, list<a>) */  {
  function span_acc(ys, acc) /* (list<15256>, list<15256>) -> 15257 (list<15256>, list<15256>) */  {
    if (ys != null) {
      return $std_core._bind((predicate(ys.head)),(function(_y_203 /* bool */ ) {
        if (_y_203) {
          return span_acc(ys.tail, Cons(ys.head, acc));
        }
        else {
          return _tuple2_(reverse(acc), ys);
        }
      }));
    }
    else {
      return _tuple2_(reverse(acc), ys);
    }
  }
  return span_acc(xs, Nil);
}
function _fast_span(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e (list<a>, list<a>) */  {
  function span_acc(ys, acc) /* (list<15256>, list<15256>) -> 15257 (list<15256>, list<15256>) */  { tailcall: while(1)
  {
    if (ys != null) {
      if (predicate(ys.head)) {
        {
          // tail call
          var _x18 = Cons(ys.head, acc);
          ys = ys.tail;
          acc = _x18;
          continue tailcall;
        }
      }
      else {
        return _tuple2_(reverse(acc), ys);
      }
    }
    else {
      return _tuple2_(reverse(acc), ys);
    }
  }}
  return span_acc(xs, Nil);
}
function span(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e (list<a>, list<a>) */  {
  return _bind_span(xs, predicate);
}
 
// Drop all initial elements that satisfy `predicate`
function _bind_drop_while(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e list<a> */  {
  return $std_core._bind((_bind_span(xs, predicate)),(function(_y_213 /* (list<15344>, list<15344>) */ ) {
    return snd(_y_213);
  }));
}
 
// Drop all initial elements that satisfy `predicate`
function _fast_drop_while(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e list<a> */  {
  return snd(_fast_span(xs, predicate));
}
 
// Drop all initial elements that satisfy `predicate`
function drop_while(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e list<a> */  {
  return _bind_drop_while(xs, predicate);
}
 
// Does string `s`  end with `post`?
// If so, returns a slice of `s` from the start up to the `post` string at the end.
function ends_with(s, post) /* (s : string, post : string) -> maybe<sslice> */  {
  if (xends_with(s, post)) {
    return Just(Sslice(s, 0, (((s.length) - (post.length))|0)));
  }
  else {
    return Nothing;
  }
}
 
// Calculate `2^exp`.
function exp2(exp) /* (exp : int) -> int */  {
  return pow(2, exp);
}
 
// Retain only those elements of a list that satisfy the given predicate `pred`.
// For example: `filter([1,2,3],odd?) == [1,3]`
function _bind_filter(xs, pred) /* forall<a,e> (xs : list<a>, pred : (a) -> e bool) -> e list<a> */  {
  if (xs == null) {
    return Nil;
  }
  else {
    return $std_core._bind((pred(xs.head)),(function(_y_215 /* bool */ ) {
      if (_y_215) {
        return $std_core._bind((_bind_filter(xs.tail, pred)),(function(_y_216 /* list<15483> */ ) {
          return Cons(xs.head, _y_216);
        }));
      }
      else {
        return _bind_filter(xs.tail, pred);
      }
    }));
  }
}
 
// Retain only those elements of a list that satisfy the given predicate `pred`.
// For example: `filter([1,2,3],odd?) == [1,3]`
function _fast_filter(xs0, pred0) /* forall<a,e> (xs : list<a>, pred : (a) -> e bool) -> e list<a> */  { tailcall: while(1)
{
  if (xs0 == null) {
    return Nil;
  }
  else {
    if (pred0(xs0.head)) {
      return Cons(xs0.head, _fast_filter(xs0.tail, pred0));
    }
    else {
      {
        // tail call
        xs0 = xs0.tail;
        continue tailcall;
      }
    }
  }
}}
 
// Retain only those elements of a list that satisfy the given predicate `pred`.
// For example: `filter([1,2,3],odd?) == [1,3]`
function filter(xs1, pred1) /* forall<a,e> (xs : list<a>, pred : (a) -> e bool) -> e list<a> */  {
  return _bind_filter(xs1, pred1);
}
 
// Retain only those elements of a list that satisfy the given predicate `pred`.
// For example: `filterMap([1,2,3],fun(i) { if (i.odd?) then Nothing else Just(i*i) }) == [4]`
function _bind_filter_map(xs, pred) /* forall<a,b,e> (xs : list<a>, pred : (a) -> e maybe<b>) -> e list<b> */  {
  if (xs == null) {
    return Nil;
  }
  else {
    return $std_core._bind((pred(xs.head)),(function(_y_221 /* maybe<15529> */ ) {
      if (_y_221 == null) {
        return _bind_filter_map(xs.tail, pred);
      }
      else {
        return $std_core._bind((_bind_filter_map(xs.tail, pred)),(function(_y_223 /* list<15529> */ ) {
          return Cons(_y_221.value, _y_223);
        }));
      }
    }));
  }
}
 
// Retain only those elements of a list that satisfy the given predicate `pred`.
// For example: `filterMap([1,2,3],fun(i) { if (i.odd?) then Nothing else Just(i*i) }) == [4]`
function _fast_filter_map(xs0, pred0) /* forall<a,b,e> (xs : list<a>, pred : (a) -> e maybe<b>) -> e list<b> */  { tailcall: while(1)
{
  if (xs0 == null) {
    return Nil;
  }
  else {
    var _x18 = pred0(xs0.head);
    if (_x18 == null) {
      {
        // tail call
        xs0 = xs0.tail;
        continue tailcall;
      }
    }
    else {
      return Cons(_x18.value, _fast_filter_map(xs0.tail, pred0));
    }
  }
}}
 
// Retain only those elements of a list that satisfy the given predicate `pred`.
// For example: `filterMap([1,2,3],fun(i) { if (i.odd?) then Nothing else Just(i*i) }) == [4]`
function filter_map(xs1, pred1) /* forall<a,b,e> (xs : list<a>, pred : (a) -> e maybe<b>) -> e list<b> */  {
  return _bind_filter_map(xs1, pred1);
}
 
// Was this a finalization exception?
function finalize_ques__1(exn) /* (exn : exception) -> bool */  {
  var _x19 = info(exn);
  return (_x19._tag === _tag_Finalize);
}
 
// Find the first element satisfying some predicate
function find(xs, pred) /* forall<a> (xs : list<a>, pred : (a) -> bool) -> maybe<a> */  {
  return foreach_while(xs, function(x /* 15616 */ ) {
      return (pred(x)) ? Just(x) : Nothing;
    });
}
 
// O(n). If it occurs, return the position of substring `sub` in `s`, tupled with
// the position just following the substring `sub`.
function find_1(s, sub) /* (s : string, sub : string) -> maybe<sslice> */  {
  var i = ((s).indexOf(sub));
  if ((i<0)) {
    return Nothing;
  }
  else {
    return Just(Sslice(s, i, sub.length));
  }
}
 
// Return the last index of substring `sub` in `s` if it occurs.
function find_last(s, sub) /* (s : string, sub : string) -> maybe<sslice> */  {
  var i = ((s).lastIndexOf(sub));
  if ((i<0)) {
    return Nothing;
  }
  else {
    return Just(Sslice(s, i, sub.length));
  }
}
 
// Find the first element satisfying some predicate and return it.
function find_maybe(xs, pred) /* forall<a,b> (xs : list<a>, pred : (a) -> maybe<b>) -> maybe<b> */  {
  return foreach_while(xs, pred);
}
 
// Concatenate the result lists from applying a function to all elements.
function _bind_flatmap(xs, f) /* forall<a,b,e> (xs : list<a>, f : (a) -> e list<b>) -> e list<b> */  {
  return $std_core._bind((_bind_map_5(xs, f)),(function(_y_227 /* list<list<15912>> */ ) {
    return concat(_y_227);
  }));
}
 
// Concatenate the result lists from applying a function to all elements.
function _fast_flatmap(xs, f) /* forall<a,b,e> (xs : list<a>, f : (a) -> e list<b>) -> e list<b> */  {
  return concat(_fast_map_5(xs, f));
}
 
// Concatenate the result lists from applying a function to all elements.
function flatmap(xs, f) /* forall<a,b,e> (xs : list<a>, f : (a) -> e list<b>) -> e list<b> */  {
  return _bind_flatmap(xs, f);
}
function _bind_foldl1(xs, f) /* forall<a,e> (xs : list<a>, f : (a, a) -> <exn|e> a) -> <exn|e> a */  {
  return (xs != null) ? _bind_foldl(xs.tail, xs.head, f) : error_pattern("lib/std/core.kk(919, 3)", "foldl1");
}
function _fast_foldl1(xs, f) /* forall<a,e> (xs : list<a>, f : (a, a) -> <exn|e> a) -> <exn|e> a */  {
  return (xs != null) ? _fast_foldl(xs.tail, xs.head, f) : error_pattern("lib/std/core.kk(919, 3)", "foldl1");
}
function foldl1(xs, f) /* forall<a,e> (xs : list<a>, f : (a, a) -> <exn|e> a) -> <exn|e> a */  {
  return _bind_foldl1(xs, f);
}
 
// Fold a list from the right, i.e. `foldr([1,2],0,(+)) == 1+(2+0)`
// Note, `foldr` is less efficient than `foldl` as it reverses the list first.
function _bind_foldr(xs, z, f) /* forall<a,b,e> (xs : list<a>, z : b, f : (a, b) -> e b) -> e b */  {
  return _bind_foldl(reverse(xs), z, function(x /* 15939 */ , y /* 15942 */ ) {
      return f(y, x);
    });
}
 
// Fold a list from the right, i.e. `foldr([1,2],0,(+)) == 1+(2+0)`
// Note, `foldr` is less efficient than `foldl` as it reverses the list first.
function _fast_foldr(xs, z, f) /* forall<a,b,e> (xs : list<a>, z : b, f : (a, b) -> e b) -> e b */  {
  return _fast_foldl(reverse(xs), z, function(x /* 15939 */ , y /* 15942 */ ) {
      return f(y, x);
    });
}
 
// Fold a list from the right, i.e. `foldr([1,2],0,(+)) == 1+(2+0)`
// Note, `foldr` is less efficient than `foldl` as it reverses the list first.
function foldr(xs, z, f) /* forall<a,b,e> (xs : list<a>, z : b, f : (a, b) -> e b) -> e b */  {
  return _bind_foldr(xs, z, f);
}
function _bind_foldr1(xs, f) /* forall<a,e> (xs : list<a>, f : (a, a) -> <exn|e> a) -> <exn|e> a */  {
  if (xs != null && xs.tail == null) {
    return xs.head;
  }
  else if (xs != null) {
    return $std_core._bind((_bind_foldr1(xs.tail, f)),(function(_y_234 /* 15987 */ ) {
      return f(xs.head, _y_234);
    }));
  }
  else {
    return error_pattern("lib/std/core.kk(926, 3)", "foldr1");
  }
}
function _fast_foldr1(xs0, f0) /* forall<a,e> (xs : list<a>, f : (a, a) -> <exn|e> a) -> <exn|e> a */  {
  if (xs0 != null && xs0.tail == null) {
    return xs0.head;
  }
  else if (xs0 != null) {
    return f0(xs0.head, _fast_foldr1(xs0.tail, f0));
  }
  else {
    return error_pattern("lib/std/core.kk(926, 3)", "foldr1");
  }
}
function foldr1(xs1, f1) /* forall<a,e> (xs : list<a>, f : (a, a) -> <exn|e> a) -> <exn|e> a */  {
  return _bind_foldr1(xs1, f1);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
// If `action` returns `Just`, the iteration is stopped and the result returned
function _bind_for_while(start0, end, action) /* forall<a,e> (start : int, end : int, action : (int) -> e maybe<a>) -> e maybe<a> */  {
  function rep(i) /* (i : int) -> 16052 maybe<16051> */  {
    if ($std_core._int_le(i,end)) {
      return $std_core._bind((action(i)),(function(_y_240 /* maybe<16051> */ ) {
        if (_y_240 == null) {
          return rep((inc(i)));
        }
        else {
          return Just(_y_240.value);
        }
      }));
    }
    else {
      return Nothing;
    }
  }
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
// If `action` returns `Just`, the iteration is stopped and the result returned
function _fast_for_while(start0, end, action) /* forall<a,e> (start : int, end : int, action : (int) -> e maybe<a>) -> e maybe<a> */  {
  function rep(i) /* (i : int) -> 16052 maybe<16051> */  { tailcall: while(1)
  {
    if ($std_core._int_le(i,end)) {
      var _x20 = action(i);
      if (_x20 == null) {
        {
          // tail call
          var _x21 = (inc(i));
          i = _x21;
          continue tailcall;
        }
      }
      else {
        return Just(_x20.value);
      }
    }
    else {
      return Nothing;
    }
  }}
  return rep(start0);
}
 
// Executes `action`  for each integer between `start`  upto `end`  (including both `start`  and `end` ).
// If `start > end`  the function returns without any call to `action` .
// If `action` returns `Just`, the iteration is stopped and the result returned
function for_while(start0, end, action) /* forall<a,e> (start : int, end : int, action : (int) -> e maybe<a>) -> e maybe<a> */  {
  return _bind_for_while(start0, end, action);
}
 
// Force a delayed value; the value is computed only on the first
// call to `force` and cached afterwards.
function _bind_force(delayed) /* forall<a,e> (delayed : delayed<e,a>) -> e a */  {
  return unsafe_total(function() {
    var r_26056 = dref(delayed);
    var _x20 = ((r_26056).value);
    if (_x20._tag === 2) {
      return _x20.right;
    }
    else {
      return $std_core._bind((((_x20.left))()),(function(x0 /* 16276 */ ) {
        ((r_26056).value = (Right(x0)));
        return x0;
      }));
    }
  });
}
 
// Force a delayed value; the value is computed only on the first
// call to `force` and cached afterwards.
function _fast_force(delayed) /* forall<a,e> (delayed : delayed<e,a>) -> e a */  {
  return unsafe_total(function() {
    var r = dref(delayed);
    var _x21 = ((r).value);
    if (_x21._tag === 2) {
      return _x21.right;
    }
    else {
      var x0 = ((_x21.left))();
      ((r).value = (Right(x0)));
      return x0;
    }
  });
}
 
// Force a delayed value; the value is computed only on the first
// call to `force` and cached afterwards.
function force(delayed) /* forall<a,e> (delayed : delayed<e,a>) -> e a */  {
  return _bind_force(delayed);
}
 
// Invoke `action` for each element of a list, passing also the position of the element.
function _bind_foreach_indexed(xs, action) /* forall<a,e> (xs : list<a>, action : (int, a) -> e ()) -> e () */  {
  var i = { value: 0 };
  return _bind_foreach(xs, function(x /* 16558 */ ) {
      return $std_core._bind((action(((i).value), x)),(function(__ /* () */ ) {
        var _y_263_26062 = $std_core._int_add((((i).value)),1);
        return ((i).value = _y_263_26062);
      }));
    });
}
 
// Invoke `action` for each element of a list, passing also the position of the element.
function _fast_foreach_indexed(xs, action) /* forall<a,e> (xs : list<a>, action : (int, a) -> e ()) -> e () */  {
  var i = { value: 0 };
  return _fast_foreach(xs, function(x /* 16558 */ ) {
      action(((i).value), x);
      return ((i).value = ($std_core._int_add((((i).value)),1)));
    });
}
 
// Invoke `action` for each element of a list, passing also the position of the element.
function foreach_indexed(xs, action) /* forall<a,e> (xs : list<a>, action : (int, a) -> e ()) -> e () */  {
  return _bind_foreach_indexed(xs, action);
}
 
// Invoke a function `f` for each element in a vector `v`
function _bind_foreach_indexed_1(v, f) /* forall<a,e> (v : vector<a>, f : (a, int) -> e ()) -> e () */  {
  return _bind_foreach_indexed32(v, function(x /* 16594 */ , i /* int32 */ ) {
      return f(x, $std_core._int_double(i));
    });
}
 
// Invoke a function `f` for each element in a vector `v`
function _fast_foreach_indexed_1(v, f) /* forall<a,e> (v : vector<a>, f : (a, int) -> e ()) -> e () */  {
  return _fast_foreach_indexed32(v, function(x /* 16594 */ , i /* int32 */ ) {
      return f(x, $std_core._int_double(i));
    });
}
 
// Invoke a function `f` for each element in a vector `v`
function foreach_indexed_1(v, f) /* forall<a,e> (v : vector<a>, f : (a, int) -> e ()) -> e () */  {
  return _bind_foreach_indexed_1(v, f);
}
var redirect = unsafe_total(function() {
  return { value: Nothing };
});
function prints(s) /* (s : string) -> console () */  {
  return unsafe_total(function() {
    var _x22 = ((redirect).value);
    return (_x22 == null) ? xprints(s) : _x22.value(s);
  });
}
 
// Concatenate all strings in a list
function joinsep(xs, sep) /* (xs : list<string>, sep : string) -> string */  {
  function join_acc(ys, acc) /* (ys : list<string>, acc : string) -> string */  { tailcall: while(1)
  {
    if (ys != null) {
      {
        // tail call
        var _x23 = (((acc + sep)) + (ys.head));
        ys = ys.tail;
        acc = _x23;
        continue tailcall;
      }
    }
    else {
      return acc;
    }
  }}
  return (xs == null) ? "" : join_acc(xs.tail, xs.head);
}
 
// Concatenate all strings in a list
function join_2(xs) /* (xs : list<string>) -> string */  {
  return joinsep(xs, "");
}
 
// Concatenate all strings in a list using a specific separator
function join_3(xs, sep) /* (xs : list<string>, sep : string) -> string */  {
  return joinsep(xs, sep);
}
 
// Right-align a string to width `width`  using `fill`  (default is a space) to fill from the left.
function pad_left(s, width, fill) /* (s : string, width : int, fill : ?char) -> string */  {
  var _fill_16830 = (fill !== undefined) ? fill : 0x0020;
  var w = $std_core._int_to_int32(width);
  var n = s.length;
  if ((w <= n)) {
    return s;
  }
  else {
    return ((repeat32(string(_fill_16830), ((w - n)|0))) + s);
  }
}
 
// Show an `:int` as a hexadecimal value.\
// The `width`  parameter specifies how wide the hex value is where `"0"`  is used to align.\
// The `use-capitals` parameter (= `True`) determines if captical letters should be used to display the hexadecimal digits.\
// The `pre` (=`"0x"`) is an optional prefix for the number (goes between the sign and the number).
function show_hex(i, width, use_capitals, pre) /* (i : int, width : ?int, use-capitals : ?bool, pre : ?string) -> string */  {
  var _width_16998 = (width !== undefined) ? width : 1;
  var _use_capitals_17002 = (use_capitals !== undefined) ? use_capitals : true;
  var _pre_17006 = (pre !== undefined) ? pre : "0x";
  var _x23 = ($std_core._int_lt(i,0)) ? "-" : "";
  return (((_x23 + _pre_17006)) + (pad_left(int_show_hex($std_core._int_abs(i), _use_capitals_17002), _width_16998, 0x0030)));
}
 
// Show a character as a string
function show_char(c) /* (c : char) -> string */  {
  var _x24 = (((c < 0x0020)) || ((c > 0x007E)));
  if (_x24) {
    if ((c === 0x000A)) {
      return "\\n";
    }
    else {
      if ((c === 0x000D)) {
        return "\\r";
      }
      else {
        if ((c === 0x0009)) {
          return "\\t";
        }
        else {
          var _x25 = $std_core._int_le(c,255);
          if (_x25) {
            return (("\\x") + (show_hex(c, 2, undefined, "")));
          }
          else {
            var _x26 = $std_core._int_le(c,65535);
            if (_x26) {
              return (("\\u") + (show_hex(c, 4, undefined, "")));
            }
            else {
              return (("\\U") + (show_hex(c, 6, undefined, "")));
            }
          }
        }
      }
    }
  }
  else {
    if ((c === 0x0027)) {
      return "\\\'";
    }
    else {
      if ((c === 0x0022)) {
        return "\\\"";
      }
      else {
        return ((c === 0x005C)) ? "\\\\" : string(c);
      }
    }
  }
}
 
// Show a `:double` in exponential (scientific) notation.
// The optional `precision` (= `-17`) specifies the precision.
// If `>=0` it specifies the number of digits behind the dot (up to `17` max).
// If negative, then at most the absolute value of `precision` digits behind the dot are used.
function show_exp(d, precision) /* (d : double, precision : ?int) -> string */  {
  var _precision_17864 = (precision !== undefined) ? precision : -17;
  return show_expx(d, $std_core._int_to_int32(_precision_17864));
}
 
// Show a `:double` fixed-point notation.
// The optional `precision` (= `-2`) specifies the maximum precision.
// If `>=0` it specifies the number of digits behind the dot (up to `20` max).
// If negative, then at most the absolute value of `precision` digits behind the dot are used.
// This may still show a number in exponential notation if the it is too small or large,
// in particular, for  a `d` where `d > 1.0e21` or `d < 1.0e-15`, or if
// `precision.abs > 17`, the `show-exp` routine is used.
function show_fixed(d, precision) /* (d : double, precision : ?int) -> string */  {
  var _precision_17876 = (precision !== undefined) ? precision : -2;
  var dabs = Math.abs(d);
  var _x27 = (((dabs < (1.0e-15))) || ((dabs > (1.0e21))));
  if (_x27) {
    return show_exp(d, _precision_17876);
  }
  else {
    return show_fixedx(d, $std_core._int_to_int32(_precision_17876));
  }
}
 
// Convert a list to a string
function _bind_show_list(xs, show_elem) /* forall<a,e> (xs : list<a>, show-elem : (a) -> e string) -> e string */  {
  return $std_core._bind((_bind_map_5(xs, show_elem)),(function(_y_273 /* list<string> */ ) {
    return (((("[") + (join_3(_y_273, ",")))) + ("]"));
  }));
}
 
// Convert a list to a string
function _fast_show_list(xs, show_elem) /* forall<a,e> (xs : list<a>, show-elem : (a) -> e string) -> e string */  {
  return (((("[") + (join_3(_fast_map_5(xs, show_elem), ",")))) + ("]"));
}
 
// Convert a list to a string
function show_list(xs, show_elem) /* forall<a,e> (xs : list<a>, show-elem : (a) -> e string) -> e string */  {
  return _bind_show_list(xs, show_elem);
}
 
// Show the exception message and its stack trace.
function show(exn) /* (exn : exception) -> string */  {
  return stack_trace(exn);
}
 
// Convert an `:int` to a string
function show_1(i) /* (i : int) -> string */  {
  return gshow(i);
}
 
// Convert a `:bool` to a string
function show_5(b) /* (b : bool) -> string */  {
  return (b) ? "True" : "False";
}
function show_10(xs) /* (xs : list<bool>) -> string */  {
  return show_list(xs, show_5);
}
 
// Show a `:double` as a string.
// If `d >= 1.0e-5` and `d < 1.0e+21`, `show-fixed` is used and otherwise `show-exp`.
// Default `precision` is `-17`.
function show_2(d, precision) /* (d : double, precision : ?int) -> string */  {
  var _precision_18670 = (precision !== undefined) ? precision : -17;
  var dabs = Math.abs(d);
  var _x28 = (((dabs >= (1.0e-5))) && ((dabs < (1.0e21))));
  if (_x28) {
    return show_fixed(d, _precision_18670);
  }
  else {
    return show_exp(d, _precision_18670);
  }
}
 
// Show a `:char` as a character literal
function show_3(c) /* (c : char) -> string */  {
  return (((("\'") + (show_char(c)))) + ("\'"));
}
 
// Show a string as a string literal
function show_4(s) /* (s : string) -> string */  {
  return (((("\"") + (join_2(map_5(list_4(s), show_char))))) + ("\""));
}
 
// Convert a unit value `()` to a string
function show_6(u) /* (u : ()) -> string */  {
  return "()";
}
 
// Show an `:sslice` as a string literal
function show_7(s) /* (s : sslice) -> string */  {
  return show_4(string_3(s));
}
function show_8(xs) /* (xs : list<string>) -> string */  {
  return show_list(xs, show_4);
}
function show_9(xs) /* (xs : list<int>) -> string */  {
  return show_list(xs, show_1);
}
 
// Print a string to the console.
function print(s) /* (s : string) -> console () */  {
  return prints(s);
}
 
// Print an integer to the console.
function print_1(i) /* (i : int) -> console () */  {
  return prints(show_1(i));
}
 
// Print a double to the console.
function print_2(d) /* (d : double) -> console () */  {
  return prints(show_2(d));
}
 
// Print a boolean to the console
function print_3(b) /* (b : bool) -> console () */  {
  return prints(show_5(b));
}
 
// Print a character to the console.
function print_4(c) /* (c : char) -> console () */  {
  return prints(string(c));
}
 
// Print a unit value to the console
function print_5(u) /* (u : ()) -> console () */  {
  return prints(show_6(_unit_));
}
 
// Generic print routine: prints the internal representation as a string to the console,
// including a final newline character.
// Note: this breaks parametricity so it should not be public
function gprint(x) /* forall<a> (x : a) -> console () */  {
  return print(gshow(x));
}
function printsln(s) /* (s : string) -> console () */  {
  return unsafe_total(function() {
    var _x29 = ((redirect).value);
    if (_x29 == null) {
      return xprintsln(s);
    }
    else {
      return _x29.value((s + ("\n")));
    }
  });
}
 
// Print a string to the console, including a final newline character.
function println(s) /* (s : string) -> console () */  {
  return printsln(s);
}
 
// Print an integer to the console, including a final newline character.
function println_1(i) /* (i : int) -> console () */  {
  return printsln(show_1(i));
}
 
// Print a double to the console, including a final newline character.
function println_2(d) /* (d : double) -> console () */  {
  return printsln(show_2(d));
}
 
// Print a boolean to the console, including a final newline character
function println_3(b) /* (b : bool) -> console () */  {
  return printsln(show_5(b));
}
 
// Print a character to the console, including a final newline character.
function println_4(c) /* (c : char) -> console () */  {
  return printsln(string(c));
}
 
// Print a unit value to the console, including a final newline character
function println_5(u) /* (u : ()) -> console () */  {
  return printsln(show_6(_unit_));
}
 
// Generic print routine: prints the internal representation as a string to the console, including a final newline character.
// Note: this breaks parametricity so it should not be public
function gprintln(x) /* forall<a> (x : a) -> console () */  {
  return println(gshow(x));
}
 
// Return the head of list if the list is not empty.
function head_1(xs) /* forall<a> (xs : list<a>) -> maybe<a> */  {
  return (xs != null) ? Just(xs.head) : Nothing;
}
 
// Return the head of list if the list is not empty, or use `default` otherwise
function head_2(xs, default0) /* forall<a> (xs : list<a>, default : a) -> a */  {
  return (xs != null) ? xs.head : default0;
}
 
// Return the first character of a string as a string (or the empty string)
function head_3(s) /* (s : string) -> string */  {
  return string_3(first(s));
}
 
// Return the first character of a string (or `Nothing` for the empty string).
function head_char(s) /* (s : string) -> maybe<char> */  {
  return foreach_while_2(s, Just);
}
 
// Is the character an ASCII hexa-decimal digit ?
function hex_digit_ques_(c) /* (c : char) -> bool */  {
  return ((digit_ques_(c)) || ((((((c >= 0x0061)) && ((c <= 0x0066)))) || ((((c >= 0x0041)) && ((c <= 0x0046)))))));
}
function index_of_acc(xs, pred, idx) /* forall<a> (xs : list<a>, pred : (a) -> bool, idx : int) -> int */  { tailcall: while(1)
{
  if (xs == null) {
    return $std_core._int_sub(0,1);
  }
  else {
    if (pred(xs.head)) {
      return idx;
    }
    else {
      {
        // tail call
        var _x30 = $std_core._int_add(idx,1);
        xs = xs.tail;
        idx = _x30;
        continue tailcall;
      }
    }
  }
}}
 
// Returns the index of the first element where `pred` holds, or `-1` if no such element exists.
function index_of(xs, pred) /* forall<a> (xs : list<a>, pred : (a) -> bool) -> int */  {
  return index_of_acc(xs, pred, 0);
}
 
// Return the list without its last element.
// Return an empty list for an empty list.
function init(xs) /* forall<a> (xs : list<a>) -> list<a> */  {
  if (xs != null) {
    if (xs.tail == null) {
      return Nil;
    }
    else {
      return Cons(xs.head, init(xs.tail));
    }
  }
  else {
    return Nil;
  }
}
 
// Append `end` to each string in the list `xs` and join them all together.\
// `join-end([],end) === ""`\
// `join-end(["a","b"],"/") === "a/b/"`
function join_end(xs, end) /* (xs : list<string>, end : string) -> string */  {
  if (xs == null) {
    return "";
  }
  else {
    return ((joinsep(xs, end)) + end);
  }
}
 
// Return the last element of a list (or `Nothing` for the empty list)
function last(xs) /* forall<a> (xs : list<a>) -> maybe<a> */  { tailcall: while(1)
{
  if (xs != null && xs.tail == null) {
    return Just(xs.head);
  }
  else if (xs != null) {
    {
      // tail call
      xs = xs.tail;
      continue tailcall;
    }
  }
  else {
    return Nothing;
  }
}}
 
// Return the last element of a list (or `default` for the empty list)
function last_1(xs, default0) /* forall<a> (xs : list<a>, default : a) -> a */  { tailcall: while(1)
{
  if (xs != null && xs.tail == null) {
    return xs.head;
  }
  else if (xs != null) {
    {
      // tail call
      xs = xs.tail;
      continue tailcall;
    }
  }
  else {
    return default0;
  }
}}
 
// O(`n`). The last `n` (default = `1`) characters in a string
function last_2(s, n) /* (s : string, n : ?int) -> sslice */  {
  var _n_21046 = (n !== undefined) ? n : 1;
  var slice0 = _sslice_last(s);
  if ($std_core._int_eq(_n_21046,1)) {
    return slice0;
  }
  else {
    return extend(advance(slice0, $std_core._int_sub(1,_n_21046)), $std_core._int_sub(_n_21046,1));
  }
}
 
// Take the first `n` elements of a list (or fewer if the list is shorter than `n`)
function take(xs, n) /* forall<a> (xs : list<a>, n : int) -> list<a> */  {
  if ($std_core._int_le(n,0)) {
    return Nil;
  }
  else {
    if (xs == null) {
      return Nil;
    }
    else {
      return Cons(xs.head, take(xs.tail, $std_core._int_sub(n,1)));
    }
  }
}
 
// split a list at position `n`
function split(xs, n) /* forall<a> (xs : list<a>, n : int) -> (list<a>, list<a>) */  {
  return _tuple2_(take(xs, n), drop(xs, n));
}
 
// Split a string into parts that were delimited by `sep`. The delimeters are not included in the results.
// For example: `split("1,,2",",") == ["1","","2]`
function split_1(s, sep) /* (s : string, sep : string) -> list<string> */  {
  return list_5(((s).split(sep)));
}
 
// Split a string into at most `n` parts that were delimited by a string `sep`. The delimeters are not included in the results (except for possibly the final part).
// For example: `split("1,2,3",",",2) == ["1","2,3"]`
function split_2(s, sep, n) /* (s : string, sep : string, n : int) -> list<string> */  {
  return list_5((s).split(sep, ($std_core._int_to_int32(n))));
}
 
// Split a string into a list of lines
function lines(s) /* (s : string) -> list<string> */  {
  return split_1(s, "\n");
}
 
// Lookup the first element satisfying some predicate
function lookup(xs, pred) /* forall<a,b> (xs : list<(a, b)>, pred : (a) -> bool) -> maybe<b> */  {
  return foreach_while(xs, function(kv /* (21629, 21630) */ ) {
      var _x31 = pred(fst(kv));
      if (_x31) {
        return Just(snd(kv));
      }
      else {
        return Nothing;
      }
    });
}
 
// Apply a function `f`  to each element of the input list in sequence where takes
// both the index of the current element and the element itself as arguments.
function _bind_map_indexed(xs, f) /* forall<a,b,e> (xs : list<a>, f : (idx : int, value : a) -> e b) -> e list<b> */  {
  return _bind_map_indexed_peek(xs, function(i /* int */ , x /* 21650 */ , xx /* list<21650> */ ) {
      return f(i, x);
    });
}
 
// Apply a function `f`  to each element of the input list in sequence where takes
// both the index of the current element and the element itself as arguments.
function _fast_map_indexed(xs, f) /* forall<a,b,e> (xs : list<a>, f : (idx : int, value : a) -> e b) -> e list<b> */  {
  return _fast_map_indexed_peek(xs, function(i /* int */ , x /* 21650 */ , xx /* list<21650> */ ) {
      return f(i, x);
    });
}
 
// Apply a function `f`  to each element of the input list in sequence where takes
// both the index of the current element and the element itself as arguments.
function map_indexed(xs, f) /* forall<a,b,e> (xs : list<a>, f : (idx : int, value : a) -> e b) -> e list<b> */  {
  return _bind_map_indexed(xs, f);
}
 
// Apply a function `f`  to each element of the input list in sequence where `f` takes
// both the current element and the tail list as arguments.
function _bind_map_peek(xs, f) /* forall<a,b,e> (xs : list<a>, f : (value : a, rest : list<a>) -> e b) -> e list<b> */  {
  return _bind_map_indexed_peek(xs, function(i /* int */ , x /* 21672 */ , xx /* list<21672> */ ) {
      return f(x, xx);
    });
}
 
// Apply a function `f`  to each element of the input list in sequence where `f` takes
// both the current element and the tail list as arguments.
function _fast_map_peek(xs, f) /* forall<a,b,e> (xs : list<a>, f : (value : a, rest : list<a>) -> e b) -> e list<b> */  {
  return _fast_map_indexed_peek(xs, function(i /* int */ , x /* 21672 */ , xx /* list<21672> */ ) {
      return f(x, xx);
    });
}
 
// Apply a function `f`  to each element of the input list in sequence where `f` takes
// both the current element and the tail list as arguments.
function map_peek(xs, f) /* forall<a,b,e> (xs : list<a>, f : (value : a, rest : list<a>) -> e b) -> e list<b> */  {
  return _bind_map_peek(xs, f);
}
 
// Invoke `action` on each element of a list while `action` returns `Just`
function _bind_map_while(xs, action) /* forall<a,b,e> (xs : list<a>, action : (a) -> e maybe<b>) -> e list<b> */  {
  if (xs == null) {
    return Nil;
  }
  else {
    return $std_core._bind((action(xs.head)),(function(_y_281 /* maybe<21715> */ ) {
      if (_y_281 != null) {
        return $std_core._bind((_bind_map_while(xs.tail, action)),(function(_y_282 /* list<21715> */ ) {
          return Cons(_y_281.value, _y_282);
        }));
      }
      else {
        return Nil;
      }
    }));
  }
}
 
// Invoke `action` on each element of a list while `action` returns `Just`
function _fast_map_while(xs0, action0) /* forall<a,b,e> (xs : list<a>, action : (a) -> e maybe<b>) -> e list<b> */  {
  if (xs0 == null) {
    return Nil;
  }
  else {
    var _x32 = action0(xs0.head);
    if (_x32 != null) {
      return Cons(_x32.value, _fast_map_while(xs0.tail, action0));
    }
    else {
      return Nil;
    }
  }
}
 
// Invoke `action` on each element of a list while `action` returns `Just`
function map_while(xs1, action1) /* forall<a,b,e> (xs : list<a>, action : (a) -> e maybe<b>) -> e list<b> */  {
  return _bind_map_while(xs1, action1);
}
 
// Returns the largest element of a list of integers (or `default` (=`0`) for the empty list)
function maximum(xs, default0) /* (xs : list<int>, default : ?int) -> int */  {
  var _default_21720 = (default0 !== undefined) ? default0 : 0;
  return (xs == null) ? _default_21720 : foldl(xs.tail, xs.head, max);
}
 
// Returns the largest element of a list of doubles (or `0` for the empty list)
function maximum_1(xs) /* (xs : list<double>) -> double */  {
  return (xs == null) ? 0.0 : foldl(xs.tail, xs.head, max_1);
}
 
// Transform a `:try` type to a `:maybe` value.
function maybe(t) /* forall<a> (t : try<a>) -> maybe<exception> */  {
  return (t._tag === 1) ? Just(t.exception) : Nothing;
}
 
// Transform a `:null` type to a `:maybe` type. Note that it is not
// always the case that `id(x) == maybe(null(x))` (e.g. when `x = Just(Nothing)`).
function maybe_1(n) /* forall<a> (n : null<a>) -> maybe<a> */  {
  return (n==null ? $std_core.Nothing : $std_core.Just(n));
}
 
// Match a `:maybe` value and either return a default value on `Nothing` or apply a function to the value on `Just`
function _bind_maybe_2(m, onNothing, onJust) /* forall<a,b,e> (m : maybe<a>, onNothing : b, onJust : (a) -> e b) -> e b */  {
  return (m == null) ? onNothing : onJust(m.value);
}
 
// Match a `:maybe` value and either return a default value on `Nothing` or apply a function to the value on `Just`
function _fast_maybe_2(m, onNothing, onJust) /* forall<a,b,e> (m : maybe<a>, onNothing : b, onJust : (a) -> e b) -> e b */  {
  return (m == null) ? onNothing : onJust(m.value);
}
 
// Match a `:maybe` value and either return a default value on `Nothing` or apply a function to the value on `Just`
function maybe_2(m, onNothing, onJust) /* forall<a,b,e> (m : maybe<a>, onNothing : b, onJust : (a) -> e b) -> e b */  {
  return _bind_maybe_2(m, onNothing, onJust);
}
 
// Convert a `:maybe<a>` value to `:a`, using the `nothing` parameter for `Nothing`.
// This is an alias for `default`.
function maybe_3(m, nothing) /* forall<a> (m : maybe<a>, nothing : a) -> a */  {
  return $default(m, nothing);
}
 
// Convert a `:either` to a `:maybe` type discarding the value of the `Left` constructor
// and using `Just` for the `Right` constructor.
function maybe_4(e) /* forall<a,b> (e : either<a,b>) -> maybe<b> */  {
  return (e._tag === 1) ? Nothing : Just(e.right);
}
 
// Convert a list to a `:maybe` type, using `Nothing` for an empty list, and otherwise `Just` on the head element.
// Note: this is just `head`.
function maybe_5(xs) /* forall<a> (xs : list<a>) -> maybe<a> */  {
  return (xs == null) ? Nothing : Just(xs.head);
}
 
// Transform a boolean to a maybe type, using `Nothing` for `False`
function maybe_6(b) /* (b : bool) -> maybe<()> */  {
  return (b) ? Just(_unit_) : Nothing;
}
 
// Transform an integer to a maybe type, using `Nothing` for `0`
function maybe_7(i) /* (i : int) -> maybe<int> */  {
  return ($std_core._int_eq(i,0)) ? Nothing : Just(i);
}
 
// Transform a string to a maybe type, using `Nothing` for an empty string
function maybe_8(s) /* (s : string) -> maybe<string> */  {
  return (empty_ques__1(s)) ? Nothing : Just(s);
}
 
// Returns the smallest element of a list of integers (or `default` (=`0`) for the empty list)
function minimum(xs, default0) /* (xs : list<int>, default : ?int) -> int */  {
  var _default_22229 = (default0 !== undefined) ? default0 : 0;
  return (xs == null) ? _default_22229 : foldl(xs.tail, xs.head, min);
}
 
// Returns the smallest element of a list of doubles (or `0` for the empty list)
function minimum_1(xs) /* (xs : list<double>) -> double */  {
  return (xs == null) ? 0.0 : foldl(xs.tail, xs.head, min_1);
}
 
// Is a slice not empty?
function notempty_ques_(slice0) /* (slice : sslice) -> bool */  {
  return ((len(slice0))>0);
}
 
// Is a string not empty?
function notempty_ques__1(s) /* (s : string) -> bool */  {
  return (s !== (""));
}
var trace_enabled = unsafe_total(function() {
  return { value: true };
});
 
// Disable tracing completely.
function notrace() /* () -> (st<global>) () */  {
  return ((trace_enabled).value = false);
}
 
// Transform a `:maybe` type to a `:null` type (using `null` for `Nothing`).
function $null(x) /* forall<a> (x : maybe<a>) -> null<a> */  {
  return (x==null ? null : x.value);
}
 
// Cast a integer that is zero to a null
function null_1(i) /* (i : int) -> null<int> */  {
  return $null(maybe_7(i));
}
 
// Cast an empty string a null
function null_2(s) /* (s : string) -> null<string> */  {
  return $null(maybe_8(s));
}
 
// Cast a boolean `False` to null
function null_3(b) /* (b : bool) -> null<()> */  {
  return $null(maybe_6(b));
}
var null_const = $null(Nothing);
var null_return = null_const;
var null_return1 = null_const;
 
// Set a `hndler` that is always called when the `action` finishes (either normally or with an exception).
// Note that `on-exit(handler,action) == finally(action,handler)`.
function _bind_on_exit(hndler, action) /* forall<a,e> (hndler : () -> e (), action : () -> e a) -> e a */  {
  return _bind_finally(action, hndler);
}
 
// Set a `hndler` that is always called when the `action` finishes (either normally or with an exception).
// Note that `on-exit(handler,action) == finally(action,handler)`.
function _fast_on_exit(hndler, action) /* forall<a,e> (hndler : () -> e (), action : () -> e a) -> e a */  {
  return _fast_finally(action, hndler);
}
 
// Set a `hndler` that is always called when the `action` finishes (either normally or with an exception).
// Note that `on-exit(handler,action) == finally(action,handler)`.
function on_exit(hndler, action) /* forall<a,e> (hndler : () -> e (), action : () -> e a) -> e a */  {
  return _bind_on_exit(hndler, action);
}
 
// Set a `hndler` that is called only when an exception is raised in the `action` block.
function _bind_on_exn(hndler, action) /* forall<a,e> (hndler : (exception) -> <exn|e> (), action : () -> <exn|e> a) -> <exn|e> a */  {
  return _bind_prim_try_some(action, function(exn /* exception */ ) {
      return $std_core._bind((hndler(exn)),(function(__ /* () */ ) {
        return $throw(exn);
      }));
    });
}
 
// Set a `hndler` that is called only when an exception is raised in the `action` block.
function _fast_on_exn(hndler, action) /* forall<a,e> (hndler : (exception) -> <exn|e> (), action : () -> <exn|e> a) -> <exn|e> a */  {
  return _fast_prim_try_some(action, function(exn /* exception */ ) {
      hndler(exn);
      return $throw(exn);
    });
}
 
// Set a `hndler` that is called only when an exception is raised in the `action` block.
function on_exn(hndler, action) /* forall<a,e> (hndler : (exception) -> <exn|e> (), action : () -> <exn|e> a) -> <exn|e> a */  {
  return _bind_on_exn(hndler, action);
}
 
// Given a total function to calculate a value `:a`, return
// a total function that only calculates the value once and then
// returns the cached result.
function once(calc) /* forall<a> (calc : () -> a) -> (() -> a) */  {
  return unsafe_total(function() {
    var value = { value: Nothing };
    return (function() {
      return unsafe_total(function() {
        var _x33 = ((value).value);
        if (_x33 != null) {
          return _x33.value;
        }
        else {
          var x0 = calc();
          ((value).value = (Just(x0)));
          return x0;
        }
      });
    });
  });
}
 
// Left-align a string to width `width`  using `fill`  (default is a space) to fill on the right.
function pad_right(s, width, fill) /* (s : string, width : int, fill : ?char) -> string */  {
  var _fill_23035 = (fill !== undefined) ? fill : 0x0020;
  var w = $std_core._int_to_int32(width);
  var n = s.length;
  if ((w <= n)) {
    return s;
  }
  else {
    return (s + (repeat32(string(_fill_23035), ((w - n)|0))));
  }
}
 
// Is `pre`  a prefix of `s`? If so, returns a slice
// of `s` following `pre` up to the end of `s`.
function starts_with(s, pre) /* (s : string, pre : string) -> maybe<sslice> */  {
  if ((s.substr(0,pre.length) === pre)) {
    return Just(Sslice(s, pre.length, (((s.length) - (pre.length))|0)));
  }
  else {
    return Nothing;
  }
}
 
// Trim off a substring `sub` while `s` starts with that string.
function trim_left_1(s, sub) /* (s : string, sub : string) -> string */  { tailcall: while(1)
{
  if (empty_ques__1(sub)) {
    return s;
  }
  else {
    var _x34 = starts_with(s, sub);
    if (_x34 != null) {
      {
        // tail call
        var _x35 = (string_3(_x34.value));
        s = _x35;
        continue tailcall;
      }
    }
    else {
      return s;
    }
  }
}}
 
// Trim off a substring `sub` while `s` ends with that string.
function trim_right_1(s, sub) /* (s : string, sub : string) -> string */  { tailcall: while(1)
{
  if (empty_ques__1(sub)) {
    return s;
  }
  else {
    var _x36 = ends_with(s, sub);
    if (_x36 != null) {
      {
        // tail call
        var _x37 = (string_3(_x36.value));
        s = _x37;
        continue tailcall;
      }
    }
    else {
      return s;
    }
  }
}}
 
// Trim whitespace on the left and right side of a string
function trim(s) /* (s : string) -> string */  {
  return (((((s).replace(/^\s\s*/,'')))).replace(/\s+$/,''));
}
 
// Parse an integer after trimming whitespace.
// If an illegal digit character is encountered `Nothing` is returned.
// An empty string will result in `Just(0)`.
// A string can start with a `-` sign for negative numbers,
// and with `0x` or `0X` for hexadecimal numbers (in which case the `hex` parameter is ignored).
function parse_int(s, hex) /* (s : string, hex : ?bool) -> maybe<int> */  {
  var _hex_23424 = (hex !== undefined) ? hex : false;
  return xparse_int(trim(s), _hex_23424);
}
 
// Parse an integer using `parseInt`. If an illegal digit character is encountered the
// `default` value is returned. An empty string will also result in `default`.
function parse_int_default(s, default0, hex) /* (s : string, default : ?int, hex : ?bool) -> int */  {
  var _default_23436 = (default0 !== undefined) ? default0 : 0;
  var _hex_23440 = (hex !== undefined) ? hex : false;
  if (empty_ques__1(s)) {
    return _default_23436;
  }
  else {
    return maybe_3(parse_int(s, _hex_23440), _default_23436);
  }
}
function partition_acc(xs, pred, acc1, acc2) /* forall<a> (xs : list<a>, pred : (a) -> bool, acc1 : list<a>, acc2 : list<a>) -> (list<a>, list<a>) */  { tailcall: while(1)
{
  if (xs == null) {
    return _tuple2_(reverse(acc1), reverse(acc2));
  }
  else {
    if (pred(xs.head)) {
      {
        // tail call
        var _x38 = Cons(xs.head, acc1);
        xs = xs.tail;
        acc1 = _x38;
        continue tailcall;
      }
    }
    else {
      {
        // tail call
        var _x39 = Cons(xs.head, acc2);
        xs = xs.tail;
        acc2 = _x39;
        continue tailcall;
      }
    }
  }
}}
 
// Partition a list in two lists where the first list contains
// those elements that satisfy the given predicate `pred`.
// For example: `partition([1,2,3],odd?) == ([1,3],[2])`
function partition(xs, pred) /* forall<a> (xs : list<a>, pred : (a) -> bool) -> (list<a>, list<a>) */  {
  return partition_acc(xs, pred, Nil, Nil);
}
 
// redirect `print` and `println` calls to a specified function.
function print_redirect(print0) /* (print : (msg : string) -> console ()) -> io () */  {
  return ((redirect).value = (Just(print0)));
}
 
// Remove those elements of a list that satisfy the given predicate `pred`.
// For example: `remove([1,2,3],odd?) == [2]`
function remove(xs, pred) /* forall<a> (xs : list<a>, pred : (a) -> bool) -> list<a> */  {
  return filter(xs, function(x /* 23638 */ ) {
      return !((pred(x)));
    });
}
 
// Repeat a string `n` times
function repeat(s, n) /* (s : string, n : int) -> string */  {
  return repeat32(s, $std_core._int_to_int32(n));
}
 
// The `repeat` fun executes `action`  `n`  times.
function _bind_repeat_1(n, action) /* forall<e> (n : int, action : () -> e ()) -> e () */  {
  return _bind_for(1, n, function(i /* int */ ) {
      return action();
    });
}
 
// The `repeat` fun executes `action`  `n`  times.
function _fast_repeat_1(n, action) /* forall<e> (n : int, action : () -> e ()) -> e () */  {
  return _fast_for(1, n, function(i /* int */ ) {
      return action();
    });
}
 
// The `repeat` fun executes `action`  `n`  times.
function repeat_1(n, action) /* forall<e> (n : int, action : () -> e ()) -> e () */  {
  return _bind_repeat_1(n, action);
}
 
// Create a list of `n`  repeated elementes `x`
function replicate(x, n) /* forall<a> (x : a, n : int) -> list<a> */  {
  function enumerate(i, acc) /* (i : int, acc : list<23721>) -> list<23721> */  { tailcall: while(1)
  {
    if ($std_core._int_le(i,0)) {
      return acc;
    }
    else {
      {
        // tail call
        var _x40 = (dec(i));
        var _x41 = Cons(x, acc);
        i = _x40;
        acc = _x41;
        continue tailcall;
      }
    }
  }}
  return enumerate(n, Nil);
}
function show_tuple(x, showfst, showsnd) /* forall<a,b> (x : (a, b), showfst : (a) -> string, showsnd : (b) -> string) -> string */  {
  return (((((((("(") + (showfst(fst(x))))) + (","))) + (showsnd(snd(x))))) + (")"));
}
 
// Return the tail of list. Returns the empty list if `xs` is empty.
function tail_1(xs) /* forall<a> (xs : list<a>) -> list<a> */  {
  return (xs != null) ? xs.tail : Nil;
}
 
// Return the tail of a string (or the empty string)
function tail_2(s) /* (s : string) -> string */  {
  return string_3(after(first(s)));
}
 
// Keep only those initial elements that satisfy `predicate`
function _bind_take_while(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e list<a> */  {
  return $std_core._bind((_bind_span(xs, predicate)),(function(_y_294 /* (list<25017>, list<25017>) */ ) {
    return fst(_y_294);
  }));
}
 
// Keep only those initial elements that satisfy `predicate`
function _fast_take_while(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e list<a> */  {
  return fst(_fast_span(xs, predicate));
}
 
// Keep only those initial elements that satisfy `predicate`
function take_while(xs, predicate) /* forall<a,e> (xs : list<a>, predicate : (a) -> e bool) -> e list<a> */  {
  return _bind_take_while(xs, predicate);
}
function todo(message0) /* (message : string) -> () */  {
  return unsafe_noexn(function() {
    return throw_1(message0, Todo);
  });
}
 
// Trace a message used for debug purposes.
// The behaviour is system dependent. On a browser and node it uses
// `console.log`  by default.
// Disabled if `notrace` is called.
function trace(message0) /* (message : string) -> () */  {
  return unsafe_total(function() {
    return (((trace_enabled).value)) ? xtrace(message0) : _unit_;
  });
}
function trace_any(message0, x) /* forall<a> (message : string, x : a) -> () */  {
  return unsafe_total(function() {
    return (((trace_enabled).value)) ? xtrace_any(message0, x) : _unit_;
  });
}
 
// Truncate a string to `count` characters.
function truncate(s, count) /* (s : string, count : int) -> string */  {
  return string_3(extend(first(s), $std_core._int_sub(count,1)));
}
 
// Return a default value when an exception is raised
function _bind_try_default(value, action) /* forall<a,e> (value : a, action : () -> <exn|e> a) -> e a */  {
  return _bind_try(action, function(___lp_285_comma_20_rp_ /* exception */ ) {
      return value;
    });
}
 
// Return a default value when an exception is raised
function _fast_try_default(value, action) /* forall<a,e> (value : a, action : () -> <exn|e> a) -> e a */  {
  return _fast_try(action, function(___lp_285_comma_20_rp_ /* exception */ ) {
      return value;
    });
}
 
// Return a default value when an exception is raised
function try_default(value, action) /* forall<a,e> (value : a, action : () -> <exn|e> a) -> e a */  {
  return _bind_try_default(value, action);
}
var unique_count = unsafe_total(function() {
  return { value: 0 };
});
 
// Returns a unique integer (modulo 32-bits).
function unique() /* () -> ndet int */  {
  return unsafe_total(function() {
    var u = ((unique_count).value);
    ((unique_count).value = ($std_core._int_add(u,1)));
    return u;
  });
}
 
// Join a list of strings with newlines
function unlines(xs) /* (xs : list<string>) -> string */  {
  return join_3(xs, "\n");
}
 
// _unsafe_. The cancelation exception. User code should never throw
// this exception as it cannot be caught (but it is respected by `finally` blocks).
// It is used internally to `finalize` effect handlers that do not resume.
function unsafe_cancel_exn() /* () -> exception */  {
  return exception("computation is canceled", Cancel);
}
 
// _Unsafe_. This function removes the non-termination effect (`:div`) from the effect of an action
function _bind_unsafe_nodiv(action) /* forall<a,e> (action : () -> <div|e> a) -> e a */  {
  return unsafe_total(action);
}
 
// _Unsafe_. This function removes the non-termination effect (`:div`) from the effect of an action
function _fast_unsafe_nodiv(action) /* forall<a,e> (action : () -> <div|e> a) -> e a */  {
  return unsafe_total(action);
}
 
// _Unsafe_. This function removes the non-termination effect (`:div`) from the effect of an action
function unsafe_nodiv(action) /* forall<a,e> (action : () -> <div|e> a) -> e a */  {
  return _bind_unsafe_nodiv(action);
}
 
// _unsafe_. Catch any exception, including a possible cancelation.
// Unsafe to use in general as you must guarantee to later use `untry` to re-throw
// at least a cancelation exception.
function _bind_unsafe_try_all(action) /* forall<a,e> (action : () -> <exn|e> a) -> e try<a> */  {
  return _bind_prim_try_all(function() {
      return $std_core._bind((action()),(function(_y_298 /* 25424 */ ) {
        return Ok(_y_298);
      }));
    }, function(exception0 /* exception */ ) {
      return (Exn(exception0));
    });
}
 
// _unsafe_. Catch any exception, including a possible cancelation.
// Unsafe to use in general as you must guarantee to later use `untry` to re-throw
// at least a cancelation exception.
function _fast_unsafe_try_all(action) /* forall<a,e> (action : () -> <exn|e> a) -> e try<a> */  {
  return _fast_prim_try_all(function() {
      return Ok(action());
    }, Exn);
}
 
// _unsafe_. Catch any exception, including a possible cancelation.
// Unsafe to use in general as you must guarantee to later use `untry` to re-throw
// at least a cancelation exception.
function unsafe_try_all(action) /* forall<a,e> (action : () -> <exn|e> a) -> e try<a> */  {
  return _bind_unsafe_try_all(action);
}
 
// Transform an `:try` type back to an `exn` effect.
function untry(ex) /* forall<a> (ex : try<a>) -> exn a */  {
  return (ex._tag === 1) ? $throw(ex.exception) : ex.result;
}
 
// Unzip a list of pairs into two lists
function unzip(xs) /* forall<a,b> (xs : list<(a, b)>) -> (list<a>, list<b>) */  {
  function iter(ys, acc1, acc2) /* forall<a,b> (list<(a, b)>, list<a>, list<b>) -> (list<a>, list<b>) */  { tailcall: while(1)
  {
    if (ys != null) {
      {
        // tail call
        var _x40 = Cons(ys.head.fst, acc1);
        var _x41 = Cons(ys.head.snd, acc2);
        ys = ys.tail;
        acc1 = _x40;
        acc2 = _x41;
        continue tailcall;
      }
    }
    else {
      return _tuple2_(reverse(acc1), reverse(acc2));
    }
  }}
  return iter(xs, Nil, Nil);
}
 
// Convert a string to a vector of characters.
function vector_1(s) /* (s : string) -> vector<char> */  {
  return _string_to_chars(s);
}
 
// Create a new vector of length `n`  with initial elements `default` .
function vector_2(n, default0) /* forall<a> (n : int, default : a) -> vector<a> */  {
  return vector_init32($std_core._int_to_int32(n), function(__i /* int32 */ ) {
      return default0;
    });
}
 
// Convert a list to a vector.
function vector_3(xs) /* forall<a> (xs : list<a>) -> vector<a> */  {
  return _unvlist(xs);
}
 
// Create a new vector of length `n`  with initial elements given by function `f` .
function vector_init(n, f) /* forall<a> (n : int, f : (int) -> a) -> vector<a> */  {
  return vector_init32($std_core._int_to_int32(n), function(i /* int32 */ ) {
      return f($std_core._int_double(i));
    });
}
 
// The `while` fun executes `action`  as long as `pred`  is `true`.
function _bind_while(predicate, action) /* forall<e> (predicate : () -> <div|e> bool, action : () -> <div|e> ()) -> <div|e> () */  {
  return $std_core._bind((predicate()),(function(_y_301 /* bool */ ) {
    if (_y_301) {
      return $std_core._bind((action()),(function(__ /* () */ ) {
        return _bind_while(predicate, action);
      }));
    }
    else {
      return _unit_;
    }
  }));
}
 
// The `while` fun executes `action`  as long as `pred`  is `true`.
function _fast_while(predicate0, action0) /* forall<e> (predicate : () -> <div|e> bool, action : () -> <div|e> ()) -> <div|e> () */  { tailcall: while(1)
{
  if (predicate0()) {
    action0();
    {
      // tail call
      continue tailcall;
    }
  }
  else {
    return _unit_;
  }
}}
 
// The `while` fun executes `action`  as long as `pred`  is `true`.
function $while(predicate1, action1) /* forall<e> (predicate : () -> <div|e> bool, action : () -> <div|e> ()) -> <div|e> () */  {
  return _bind_while(predicate1, action1);
}
 
// Tests if a character is an element of `" \t\n\r"`
function white_ques_(c) /* (c : char) -> bool */  {
  return (((c === 0x0020)) || ((((c === 0x0009)) || ((((c === 0x000A)) || ((c === 0x000D)))))));
}
 
// Is the value zero?
function zero_ques__1(d) /* (d : double) -> bool */  {
  return (d === (0.0));
}
 
// Zip two lists together by apply a function `f` to all corresponding elements.
// The returned list is only as long as the smallest input list.
function _bind_zipwith(xs, ys, f) /* forall<a,b,c,e> (xs : list<a>, ys : list<b>, f : (a, b) -> e c) -> e list<c> */  {
  return _bind_zipwith_indexed(xs, ys, function(i /* int */ , x /* 25972 */ , y /* 25973 */ ) {
      return f(x, y);
    });
}
 
// Zip two lists together by apply a function `f` to all corresponding elements.
// The returned list is only as long as the smallest input list.
function _fast_zipwith(xs, ys, f) /* forall<a,b,c,e> (xs : list<a>, ys : list<b>, f : (a, b) -> e c) -> e list<c> */  {
  return _fast_zipwith_indexed(xs, ys, function(i /* int */ , x /* 25972 */ , y /* 25973 */ ) {
      return f(x, y);
    });
}
 
// Zip two lists together by apply a function `f` to all corresponding elements.
// The returned list is only as long as the smallest input list.
function zipwith(xs, ys, f) /* forall<a,b,c,e> (xs : list<a>, ys : list<b>, f : (a, b) -> e c) -> e list<c> */  {
  return _bind_zipwith(xs, ys, f);
}
 
// exports
$std_core = $std_core._export($std_core, {
  _unit_      : _unit_,
  _tuple2_    : _tuple2_,
  Exn         : Exn,
  Ok          : Ok,
  _tuple3_    : _tuple3_,
  _tuple4_    : _tuple4_,
  _lp__comma__comma__comma__comma__rp_: _lp__comma__comma__comma__comma__rp_,
  False       : False,
  True        : True,
  Left        : Left,
  Right       : Right,
  $Error      : $Error,
  Assert      : Assert,
  Todo        : Todo,
  Range       : Range,
  Finalize    : Finalize,
  Pattern     : Pattern,
  System      : System,
  Internal    : Internal,
  Nil         : Nil,
  Cons        : Cons,
  Nothing     : Nothing,
  Just        : Just,
  Optional    : Optional,
  None        : None,
  Lt          : Lt,
  Eq          : Eq,
  Gt          : Gt,
  _Resource   : _Resource,
  Next        : Next,
  error_pattern: error_pattern,
  _copy       : _copy,
  fst         : fst,
  snd         : snd,
  _copy_1     : _copy_1,
  exn_ques_   : exn_ques_,
  ok_ques_    : ok_ques_,
  fst_1       : fst_1,
  snd_1       : snd_1,
  thd         : thd,
  _copy_2     : _copy_2,
  fst_2       : fst_2,
  snd_2       : snd_2,
  thd_1       : thd_1,
  field4      : field4,
  _copy_3     : _copy_3,
  fst_3       : fst_3,
  snd_3       : snd_3,
  thd_2       : thd_2,
  field4_1    : field4_1,
  field5      : field5,
  _copy_4     : _copy_4,
  false_ques_ : false_ques_,
  true_ques_  : true_ques_,
  left_ques_  : left_ques_,
  right_ques_ : right_ques_,
  dref        : dref,
  _copy_5     : _copy_5,
  error_ques_ : error_ques_,
  assert_ques_: assert_ques_,
  todo_ques_  : todo_ques_,
  range_ques_ : range_ques_,
  finalize_ques_: finalize_ques_,
  pattern_ques_: pattern_ques_,
  system_ques_: system_ques_,
  internal_ques_: internal_ques_,
  _tag_Error  : _tag_Error,
  _tag_Assert : _tag_Assert,
  _tag_Todo   : _tag_Todo,
  _tag_Range  : _tag_Range,
  _tag_Finalize: _tag_Finalize,
  _tag_Pattern: _tag_Pattern,
  _tag_System : _tag_System,
  _tag_Internal: _tag_Internal,
  nil_ques_   : nil_ques_,
  cons_ques_  : cons_ques_,
  nothing_ques_: nothing_ques_,
  just_ques_  : just_ques_,
  optional_ques_: optional_ques_,
  none_ques_  : none_ques_,
  lt_ques_    : lt_ques_,
  eq_ques_    : eq_ques_,
  gt_ques_    : gt_ques_,
  str         : str,
  start       : start,
  len         : len,
  _copy_6     : _copy_6,
  head        : head,
  tail        : tail,
  _copy_7     : _copy_7,
  cancel_ques_: cancel_ques_,
  _tag_Cancel : _tag_Cancel,
  _makeFreshResourceHandler0: _makeFreshResourceHandler0,
  _makeFreshResourceHandler1: _makeFreshResourceHandler1,
  _makeHandler0: _makeHandler0,
  _makeHandler1: _makeHandler1,
  _makeHandlerBranch0: _makeHandlerBranch0,
  _makeHandlerBranch0_x1: _makeHandlerBranch0_x1,
  _makeHandlerBranch1: _makeHandlerBranch1,
  _makeHandlerBranch1_x1: _makeHandlerBranch1_x1,
  _makeHandlerRet0: _makeHandlerRet0,
  _makeHandlerRet1: _makeHandlerRet1,
  _makeResourceHandler0: _makeResourceHandler0,
  _makeResourceHandler1: _makeResourceHandler1,
  _new_sslice : _new_sslice,
  _null_any   : _null_any,
  _yieldop    : _yieldop,
  _yieldop_x1 : _yieldop_x1,
  string_compare: string_compare,
  maxListStack: maxListStack,
  reverse_append: reverse_append,
  pow         : pow,
  o           : o,
  id          : id,
  vlist       : vlist,
  string      : string,
  string_1    : string_1,
  string_2    : string_2,
  string_3    : string_3,
  string_4    : string_4,
  advance     : advance,
  _bind_apply : _bind_apply,
  _fast_apply : _fast_apply,
  apply       : apply,
  exception   : exception,
  unsafe_total: unsafe_total,
  before      : before,
  info        : info,
  extend      : extend,
  to_upper    : to_upper,
  cdiv_exp10  : cdiv_exp10,
  mul_exp10   : mul_exp10,
  random      : random,
  common_prefix: common_prefix,
  $const      : $const,
  const_1     : const_1,
  next        : next,
  count_digits: count_digits,
  $default    : $default,
  empty       : empty,
  xends_with  : xends_with,
  even_ques_  : even_ques_,
  exp10_ques_ : exp10_ques_,
  _bind_finalize: _bind_finalize,
  _fast_finalize: _fast_finalize,
  finalize    : finalize,
  _bind_finalize_1: _bind_finalize_1,
  _fast_finalize_1: _fast_finalize_1,
  finalize_1  : finalize_1,
  _bind_finally: _bind_finally,
  _fast_finally: _fast_finally,
  $finally    : $finally,
  gshow       : gshow,
  xprints     : xprints,
  int_show_hex: int_show_hex,
  repeat32    : repeat32,
  show_expx   : show_expx,
  show_fixedx : show_fixedx,
  stack_trace : stack_trace,
  xprintsln   : xprintsln,
  host        : host,
  ignore      : ignore,
  _bind_inject_exn: _bind_inject_exn,
  _fast_inject_exn: _fast_inject_exn,
  inject_exn  : inject_exn,
  intersperse : intersperse,
  _bind_main_console: _bind_main_console,
  _fast_main_console: _fast_main_console,
  main_console: main_console,
  mbint       : mbint,
  message     : message,
  negate      : negate,
  _bind_prim_try_some: _bind_prim_try_some,
  _fast_prim_try_some: _fast_prim_try_some,
  prim_try_some: prim_try_some,
  xparse_int  : xparse_int,
  _bind_prim_try_all: _bind_prim_try_all,
  _fast_prim_try_all: _fast_prim_try_all,
  prim_try_all: prim_try_all,
  random_int  : random_int,
  _bind_resume: _bind_resume,
  _fast_resume: _fast_resume,
  resume      : resume,
  _bind_resume_1: _bind_resume_1,
  _fast_resume_1: _fast_resume_1,
  resume_1    : resume_1,
  single      : single,
  to_lower    : to_lower,
  xtrace      : xtrace,
  xtrace_any  : xtrace_any,
  unjust      : unjust,
  vector_init32: vector_init32,
  _dash__3    : _dash__3,
  int_3       : int_3,
  int_4       : int_4,
  _eq__eq__4  : _eq__eq__4,
  _eq__eq__5  : _eq__eq__5,
  _lt__4      : _lt__4,
  _lt__5      : _lt__5,
  order       : order,
  compare_4   : compare_4,
  _lt__6      : _lt__6,
  _gt__3      : _gt__3,
  _gt__4      : _gt__4,
  _gt__5      : _gt__5,
  compare_1   : compare_1,
  compare_2   : compare_2,
  compare_3   : compare_3,
  reverse     : reverse,
  _plus__4    : _plus__4,
  _plus__5    : _plus__5,
  _hat__1     : _hat__1,
  _excl__eq__4: _excl__eq__4,
  _excl__eq__5: _excl__eq__5,
  _lt__eq__4  : _lt__eq__4,
  _lt__eq__5  : _lt__eq__5,
  _lt__eq__6  : _lt__eq__6,
  _gt__eq__3  : _gt__eq__3,
  _gt__eq__4  : _gt__eq__4,
  _gt__eq__5  : _gt__eq__5,
  _lb__rb__1  : _lb__rb__1,
  sign_1      : sign_1,
  pos_ques__1 : pos_ques__1,
  pos_ques__2 : pos_ques__2,
  empty_ques_ : empty_ques_,
  empty_ques__1: empty_ques__1,
  _bar__bar__1: _bar__bar__1,
  _bar__bar__2: _bar__bar__2,
  at          : at,
  _bind_all   : _bind_all,
  _fast_all   : _fast_all,
  all         : all,
  _bind_any   : _bind_any,
  _fast_any   : _fast_any,
  any         : any,
  dec         : dec,
  inc         : inc,
  _bind_for   : _bind_for,
  _fast_for   : _fast_for,
  $for        : $for,
  decr        : decr,
  incr        : incr,
  _bind_for32 : _bind_for32,
  _fast_for32 : _fast_for32,
  for32       : for32,
  _bind_foreach_indexed32: _bind_foreach_indexed32,
  _fast_foreach_indexed32: _fast_foreach_indexed32,
  foreach_indexed32: foreach_indexed32,
  length_1    : length_1,
  length_2    : length_2,
  _bind_map_acc: _bind_map_acc,
  _fast_map_acc: _fast_map_acc,
  map_acc     : map_acc,
  _bind_map_indexed_peek: _bind_map_indexed_peek,
  _fast_map_indexed_peek: _fast_map_indexed_peek,
  map_indexed_peek: map_indexed_peek,
  _bind_map   : _bind_map,
  _fast_map   : _fast_map,
  map         : map,
  list        : list,
  _bind_list_1: _bind_list_1,
  _fast_list_1: _fast_list_1,
  list_1      : list_1,
  _bind_map_5 : _bind_map_5,
  _fast_map_5 : _fast_map_5,
  map_5       : map_5,
  list_2      : list_2,
  list_3      : list_3,
  list_4      : list_4,
  list_5      : list_5,
  _bind_map_1 : _bind_map_1,
  _fast_map_1 : _fast_map_1,
  map_1       : map_1,
  _bind_map_2 : _bind_map_2,
  _fast_map_2 : _fast_map_2,
  map_2       : map_2,
  _bind_map_3 : _bind_map_3,
  _fast_map_3 : _fast_map_3,
  map_3       : map_3,
  _bind_map_4 : _bind_map_4,
  _fast_map_4 : _fast_map_4,
  map_4       : map_4,
  _bind_map_6 : _bind_map_6,
  _fast_map_6 : _fast_map_6,
  map_6       : map_6,
  _bind_map_7 : _bind_map_7,
  _fast_map_7 : _fast_map_7,
  map_7       : map_7,
  max         : max,
  max_1       : max_1,
  min         : min,
  min_1       : min_1,
  _bind_foldl : _bind_foldl,
  _fast_foldl : _fast_foldl,
  foldl       : foldl,
  sum         : sum,
  _bind_try   : _bind_try,
  _fast_try   : _fast_try,
  $try        : $try,
  _bind_try_1 : _bind_try_1,
  _fast_try_1 : _fast_try_1,
  try_1       : try_1,
  _bind_zipwith_acc: _bind_zipwith_acc,
  _fast_zipwith_acc: _fast_zipwith_acc,
  zipwith_acc : zipwith_acc,
  _bind_zipwith_iter: _bind_zipwith_iter,
  _fast_zipwith_iter: _fast_zipwith_iter,
  zipwith_iter: zipwith_iter,
  _bind_zipwith_indexed: _bind_zipwith_indexed,
  _fast_zipwith_indexed: _fast_zipwith_indexed,
  zipwith_indexed: zipwith_indexed,
  zip         : zip,
  after       : after,
  lower_ques_ : lower_ques_,
  upper_ques_ : upper_ques_,
  alpha_ques_ : alpha_ques_,
  digit_ques_ : digit_ques_,
  alpha_num_ques_: alpha_num_ques_,
  ascii_ques_ : ascii_ques_,
  $throw      : $throw,
  throw_1     : throw_1,
  error       : error,
  _bind_unsafe_noexn: _bind_unsafe_noexn,
  _fast_unsafe_noexn: _fast_unsafe_noexn,
  unsafe_noexn: unsafe_noexn,
  assert      : assert,
  bool        : bool,
  bool_1      : bool_1,
  bool_2      : bool_2,
  cancel_ques__1: cancel_ques__1,
  first       : first,
  capitalize  : capitalize,
  _bind_catch : _bind_catch,
  _fast_catch : _fast_catch,
  $catch      : $catch,
  cdivmod_exp10: cdivmod_exp10,
  random_bool : random_bool,
  choose      : choose,
  concat      : concat,
  concat_maybe: concat_maybe,
  control_ques_: control_ques_,
  _bind_for_while32: _bind_for_while32,
  _fast_for_while32: _fast_for_while32,
  for_while32 : for_while32,
  slice       : slice,
  _bind_foreach_while: _bind_foreach_while,
  _fast_foreach_while: _fast_foreach_while,
  foreach_while: foreach_while,
  _bind_foreach_while_1: _bind_foreach_while_1,
  _fast_foreach_while_1: _fast_foreach_while_1,
  foreach_while_1: foreach_while_1,
  _bind_foreach_while_2: _bind_foreach_while_2,
  _fast_foreach_while_2: _fast_foreach_while_2,
  foreach_while_2: foreach_while_2,
  _bind_foreach_while_3: _bind_foreach_while_3,
  _fast_foreach_while_3: _fast_foreach_while_3,
  foreach_while_3: foreach_while_3,
  _bind_foreach: _bind_foreach,
  _fast_foreach: _fast_foreach,
  foreach     : foreach,
  _bind_foreach_1: _bind_foreach_1,
  _fast_foreach_1: _fast_foreach_1,
  foreach_1   : foreach_1,
  _bind_foreach_2: _bind_foreach_2,
  _fast_foreach_2: _fast_foreach_2,
  foreach_2   : foreach_2,
  _bind_foreach_3: _bind_foreach_3,
  _fast_foreach_3: _fast_foreach_3,
  foreach_3   : foreach_3,
  count_1     : count_1,
  count_2     : count_2,
  count_3     : count_3,
  delay       : delay,
  exp10       : exp10,
  neg_ques__1 : neg_ques__1,
  neg_ques__2 : neg_ques__2,
  divmod_exp10: divmod_exp10,
  drop        : drop,
  _bind_span  : _bind_span,
  _fast_span  : _fast_span,
  span        : span,
  _bind_drop_while: _bind_drop_while,
  _fast_drop_while: _fast_drop_while,
  drop_while  : drop_while,
  ends_with   : ends_with,
  exp2        : exp2,
  _bind_filter: _bind_filter,
  _fast_filter: _fast_filter,
  filter      : filter,
  _bind_filter_map: _bind_filter_map,
  _fast_filter_map: _fast_filter_map,
  filter_map  : filter_map,
  finalize_ques__1: finalize_ques__1,
  find        : find,
  find_1      : find_1,
  find_last   : find_last,
  find_maybe  : find_maybe,
  _bind_flatmap: _bind_flatmap,
  _fast_flatmap: _fast_flatmap,
  flatmap     : flatmap,
  _bind_foldl1: _bind_foldl1,
  _fast_foldl1: _fast_foldl1,
  foldl1      : foldl1,
  _bind_foldr : _bind_foldr,
  _fast_foldr : _fast_foldr,
  foldr       : foldr,
  _bind_foldr1: _bind_foldr1,
  _fast_foldr1: _fast_foldr1,
  foldr1      : foldr1,
  _bind_for_while: _bind_for_while,
  _fast_for_while: _fast_for_while,
  for_while   : for_while,
  _bind_force : _bind_force,
  _fast_force : _fast_force,
  force       : force,
  _bind_foreach_indexed: _bind_foreach_indexed,
  _fast_foreach_indexed: _fast_foreach_indexed,
  foreach_indexed: foreach_indexed,
  _bind_foreach_indexed_1: _bind_foreach_indexed_1,
  _fast_foreach_indexed_1: _fast_foreach_indexed_1,
  foreach_indexed_1: foreach_indexed_1,
  redirect    : redirect,
  prints      : prints,
  joinsep     : joinsep,
  join_2      : join_2,
  join_3      : join_3,
  pad_left    : pad_left,
  show_hex    : show_hex,
  show_char   : show_char,
  show_exp    : show_exp,
  show_fixed  : show_fixed,
  _bind_show_list: _bind_show_list,
  _fast_show_list: _fast_show_list,
  show_list   : show_list,
  show        : show,
  show_1      : show_1,
  show_5      : show_5,
  show_10     : show_10,
  show_2      : show_2,
  show_3      : show_3,
  show_4      : show_4,
  show_6      : show_6,
  show_7      : show_7,
  show_8      : show_8,
  show_9      : show_9,
  print       : print,
  print_1     : print_1,
  print_2     : print_2,
  print_3     : print_3,
  print_4     : print_4,
  print_5     : print_5,
  gprint      : gprint,
  printsln    : printsln,
  println     : println,
  println_1   : println_1,
  println_2   : println_2,
  println_3   : println_3,
  println_4   : println_4,
  println_5   : println_5,
  gprintln    : gprintln,
  head_1      : head_1,
  head_2      : head_2,
  head_3      : head_3,
  head_char   : head_char,
  hex_digit_ques_: hex_digit_ques_,
  index_of_acc: index_of_acc,
  index_of    : index_of,
  init        : init,
  join_end    : join_end,
  last        : last,
  last_1      : last_1,
  last_2      : last_2,
  take        : take,
  split       : split,
  split_1     : split_1,
  split_2     : split_2,
  lines       : lines,
  lookup      : lookup,
  _bind_map_indexed: _bind_map_indexed,
  _fast_map_indexed: _fast_map_indexed,
  map_indexed : map_indexed,
  _bind_map_peek: _bind_map_peek,
  _fast_map_peek: _fast_map_peek,
  map_peek    : map_peek,
  _bind_map_while: _bind_map_while,
  _fast_map_while: _fast_map_while,
  map_while   : map_while,
  maximum     : maximum,
  maximum_1   : maximum_1,
  maybe       : maybe,
  maybe_1     : maybe_1,
  _bind_maybe_2: _bind_maybe_2,
  _fast_maybe_2: _fast_maybe_2,
  maybe_2     : maybe_2,
  maybe_3     : maybe_3,
  maybe_4     : maybe_4,
  maybe_5     : maybe_5,
  maybe_6     : maybe_6,
  maybe_7     : maybe_7,
  maybe_8     : maybe_8,
  minimum     : minimum,
  minimum_1   : minimum_1,
  notempty_ques_: notempty_ques_,
  notempty_ques__1: notempty_ques__1,
  trace_enabled: trace_enabled,
  notrace     : notrace,
  $null       : $null,
  null_1      : null_1,
  null_2      : null_2,
  null_3      : null_3,
  null_const  : null_const,
  null_return : null_return,
  null_return1: null_return1,
  _bind_on_exit: _bind_on_exit,
  _fast_on_exit: _fast_on_exit,
  on_exit     : on_exit,
  _bind_on_exn: _bind_on_exn,
  _fast_on_exn: _fast_on_exn,
  on_exn      : on_exn,
  once        : once,
  pad_right   : pad_right,
  starts_with : starts_with,
  trim_left_1 : trim_left_1,
  trim_right_1: trim_right_1,
  trim        : trim,
  parse_int   : parse_int,
  parse_int_default: parse_int_default,
  partition_acc: partition_acc,
  partition   : partition,
  print_redirect: print_redirect,
  remove      : remove,
  repeat      : repeat,
  _bind_repeat_1: _bind_repeat_1,
  _fast_repeat_1: _fast_repeat_1,
  repeat_1    : repeat_1,
  replicate   : replicate,
  show_tuple  : show_tuple,
  tail_1      : tail_1,
  tail_2      : tail_2,
  _bind_take_while: _bind_take_while,
  _fast_take_while: _fast_take_while,
  take_while  : take_while,
  todo        : todo,
  trace       : trace,
  trace_any   : trace_any,
  truncate    : truncate,
  _bind_try_default: _bind_try_default,
  _fast_try_default: _fast_try_default,
  try_default : try_default,
  unique_count: unique_count,
  unique      : unique,
  unlines     : unlines,
  unsafe_cancel_exn: unsafe_cancel_exn,
  _bind_unsafe_nodiv: _bind_unsafe_nodiv,
  _fast_unsafe_nodiv: _fast_unsafe_nodiv,
  unsafe_nodiv: unsafe_nodiv,
  _bind_unsafe_try_all: _bind_unsafe_try_all,
  _fast_unsafe_try_all: _fast_unsafe_try_all,
  unsafe_try_all: unsafe_try_all,
  untry       : untry,
  unzip       : unzip,
  vector_1    : vector_1,
  vector_2    : vector_2,
  vector_3    : vector_3,
  vector_init : vector_init,
  _bind_while : _bind_while,
  _fast_while : _fast_while,
  $while      : $while,
  white_ques_ : white_ques_,
  zero_ques__1: zero_ques__1,
  _bind_zipwith: _bind_zipwith,
  _fast_zipwith: _fast_zipwith,
  zipwith     : zipwith
});
return $std_core;
});