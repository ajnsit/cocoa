/* Props
*/  
public module concur/props

extern include {
  js file "props-inline.js"
}

// immutable props
type props<a>

// Create a prop
extern props : forall<a> () -> props<a> {
  // cs inline "new Primitive.MDict<##1,##2>()"
  js inline "{}"
}

private extern inline unsafe-index( p : props<a>, s : string ) : a {
  // cs inline "((#1)[#2])"
  js inline "((#1)[#2])"  
}

extern inline contains-key( p : props<a>, s : string ) : bool {
  // cs inline "((#1).ContainsKey(#2))"
  js inline "((#1)[#2]!==undefined)"
} 

private extern unsafe-props-add( d: props<a>, k: string, v: a ): props<a> {
  js inline "((#1)[#2]=(#3))"
}

// Index into props
fun []( p : props<a>, s : string ) : maybe<a> {
  if (p.contains-key(s)) then Just(p.unsafe-index(s)) else Nothing
}

// Create new props from a `:list` of key value pairs.
extern props( elems : list<(string,a)> ) : props<a> {
  js inline "_props_list(#1)"
}

//  SPECIFIC PROPS //

type prop

/* event handlers */
/* Handler with no args */
external mkHandler0 : forall<e> (() -> e ()) -> prop
{ inline "#1" }