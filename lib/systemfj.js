// Generated by CoffeeScript 2.0.1
  //import "babel-register"
  //require "babel-register"

  // base class shouldnt be used directly
var BOTTOM, EMPTY, JBool, JFloat, JInt, JString, T, TOP, UNIT, Unit, isZero, module, runTests, show, toInt, tta, ttf,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

export var Variable = class Variable {
  constructor(name1, boundTo) {
    this.name = name1;
    this.boundTo = boundTo; // boundTo is used in lambda and type functions to index to which variable current one is bound
  }

  bind(val) {
    throw "Variable::bind() shouldn't be called directly!";
  }

  show() {
    return console.dir(this);
  }

};

export var TypeVar = class TypeVar extends Variable {
  constructor(name, boundTo) {
    super(name, boundTo);
    this.show = this.show.bind(this);
    this.shortShow = this.shortShow.bind(this);
  }

  kind() {} // should return Kind of a type variable's current value

  bind(val) {
    throw "TypeVar::bind() not implemented yet";
  }

  show() {
    // used for type variables
    boundMethodCheck(this, TypeVar);
    return this.name + " :: " + "Type";
  }

  shortShow() {
    boundMethodCheck(this, TypeVar);
    return this.name;
  }

};

export var Var = class Var extends Variable {
  constructor(name, boundTo, type) {
    super(name, boundTo);
    this.show = this.show.bind(this);
    this.type = type;
  }

  type() {
    return this.type; // should return Type that our variable indexes - can be either TypeVar OR specific type
  }

  bind(val) {
    throw "Var::bind() not implemented yet";
  }

  show() {
    // used for regular variables
    boundMethodCheck(this, Var);
    return this.name + " :: " + this.type.name;
  }

};

// class for holding values - basically, a record. Do we even need a class here?
// current thinking is - turn this into a record, tuples will be handled as a simple array (see Constructor)
export var Value = class Value {
  // pass in constructorTag and reference to type, add value fields as needed
  // for now passing reference to Type, ideally need to do all type checking via
  // constructorTags only for efficiency
  constructor(_constructorTag_1, _type_) {
    // pretty printing values
    this.show = this.show.bind(this);
    this._constructorTag_ = _constructorTag_1;
    this._type_ = _type_;
  }

  show(top_level = true) {
    var j, keys, len, ret, v;
    keys = (function() {
      var j, len, ref, results;
      ref = Object.keys(this);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        v = ref[j];
        if (v !== "show" && v !== "_constructorTag_" && v !== "_type_") {
          results.push(v);
        }
      }
      return results;
    }).call(this);
    ret = (keys.length > 0) && (!top_level) ? "(" + this._constructorTag_ : this._constructorTag_; //+ " :: " + @_type_.name
    //console.log "Properties: --------------------------"
    //console.dir keys
    for (j = 0, len = keys.length; j < len; j++) {
      v = keys[j];
      if (this[v] instanceof Value) {
        ret = ret + " " + (this[v].show(false));
      } else {
        ret += (typeof this[v] === "string") ? " '" + this[v] + "'" : " " + this[v].toString();
      }
    }
    ret = (keys.length > 0) && (!top_level) ? ret + ")" : ret;
    if (top_level) {
      ret = ret + " :: " + this._type_.name;
    }
    return ret;
  }

};

// class generating Product Type values (records)
// Should NOT be available to constuct publicly, only from inside of Type
// now can only generate Tuples (unnamed records)
export var Constructor = class Constructor {
  constructor(name1, type1, vars) {
    // creates new value of the current type, typechecks etc
    // this is the main function to construct values
    // now very inefficient
    // bound since we are doing some fancy assignments for better syntax
    /* for typechecking polymorphic constructors, need to have a very different logic
    ideally, to follow lambda calculus, even if loosely, we need to do:
    - check types of the vals that the constructor is applied to
    - make sure it is possible to do that with all the constrains etc
    - instantiate type variables to concrete types in the Type, which should automatically generate Concrete Constructors
    - only now, CALL concrete constructor function with given values to generate Value

    Let's develop this on Just a constructor.
    Also, need to think how to kill typing in the "compiled code" - in a sense, we are doing 1 pass with dynamic typechecking,
    then if no errors - erase all typing info and keep just code.

    Idea: have different concrete Types as a sub-dictionary on the Type-generating function, so that we don't generate too many types,
    but once a programmer adds a specific type - we put it in the dictionary. So we'll have in Maybe a:
    Maybe Int, Maybe Float, Maybe String etc - but only if the values of this specific types are used.

    Alternative approach: maybe more lightweight, use generic constructor function, but use some sort of specific type annotations.
    */
    // For tuples, we are using a convention:
    // [val1, val2, ..., constructorTag, typeTag]
    // Eventually for optimizations can encode it into bytes, for now --
    // so, Nil :: List a will be ["Nil", "List a"]
    // Just 4 :: Maybe Int --> [4, "Just", "Maybe Int"] etc
    // this way, coffee destructuring assignment works quite nicely
    this.new = this.new.bind(this);
    // this function creates a Value, but it's useful for records
    // for tuples, see "new"
    this.newValue = this.newValue.bind(this);
    this.show = this.show.bind(this);
    this.name = name1;
    this.type = type1;
    this.vars = [];
    if (vars != null) {
      this.vars = vars;
    }
  }

  // internal method assigning a value to n-th variable, doing typechecking etc along the way
  _instantiate(n, val) {}

  // same as above but instantiates type for n-th variable, needed to e.g. create Just Int from Just a
  _instantiateType(n, type) {}

  new(...vals) {
    var i, j, ref, t, v, val;
    //console.log "Calling new!"
    //console.dir vals
    val = []; //new Value @name, @type
    for (i = j = 0, ref = this.vars.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      //console.log "Processing " + @vars[i].show()
      //console.dir vals[i]
      v = vals[i];
      if (v != null) {
        t = this.vars[i].type; // t can be TypeVar (in polymorphic constructors) or a concrete Type, need to handle separately
        if (t instanceof TypeVar) {
          console.log("new Value creation - Partially implemented");
          // 1. need to check type constrains (type classes etc), now NOT implemented
          // 2. need to set the TypeVar to the type of the current val - somewhere on Value, now NOT implemented
          // 3. set the value to value
          val.push(v);
        } else {
          if (t.equals(Type.checkType(v))) { // are the types ok? doesnt work for polymorphic yet!!!
            val.push(v);
          } else {
            throw "Type mismatch in assignment!";
          }
        }
      }
    }
    val.push(this.name);
    val.push(this.type);
    return val;
  }

  newValue(...vals) {
    var i, j, ref, t, v, val;
    //console.log "Calling new!"
    //console.dir vals
    if (this.vars.length === 0) {
      return new Value(this.name, this.type); // empty constructor is easy
    } else {
      //console.log "Compound constructor"
      val = new Value(this.name, this.type);
      for (i = j = 0, ref = this.vars.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        //console.log "Processing " + @vars[i].show()
        //console.dir vals[i]
        v = vals[i];
        if (v != null) {
          t = this.vars[i].type; // t can be TypeVar (in polymorphic constructors) or a concrete Type, need to handle separately
          if (t instanceof TypeVar) {
            console.log("new Value creation - Partially implemented");
            // 1. need to check type constrains (type classes etc), now NOT implemented
            // 2. need to set the TypeVar to the type of the current val - somewhere on Value, now NOT implemented
            // 3. set the value to value
            val[this.vars[i].name] = v;
          } else {
            if (t.equals(Type.checkType(v))) { // are the types ok? doesnt work for polymorphic yet!!!
              val[this.vars[i].name] = v;
            } else {
              throw "Type mismatch in assignment!";
            }
          }
        }
      }
      return val;
    }
  }

  show() {
    var j, len, ref, ret, v;
    ret = this.name;
    ref = this.vars;
    for (j = 0, len = ref.length; j < len; j++) {
      v = ref[j];
      ret = ret + " " + v.type.shortShow(true);
    }
    return ret;
  }

};

// Class that contains all types in the system and at the same time serves as a SumType
// of Constructors (which are Product types)
export var Type = class Type {
  // create a new type with name and type variables (no regular vars as no dependent types yet)
  // e.g. Maybe = new Type "Maybe a"
  constructor(type, ...constructors) {
    var cons, i, j, len, xs;
    
    // comparing 2 types, for now very basic (simply name)
    this.equals = this.equals.bind(this);
    // adding a new constructor to this type in the same format as Type constructor,
    // e.g. "Just a" or "MyPair Int Float"
    this.add = this.add.bind(this);
    this.shortShow = this.shortShow.bind(this);
    this.show = this.show.bind(this);
    this.constructors = {};
    xs = type.split(' ');
    this.name = xs[0];
    // creating TypeVars for each var name in the constructor
    this.vars = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = xs.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        results.push(new TypeVar(xs[i], -1));
      }
      return results;
    })();
    // adding constructors
    for (j = 0, len = constructors.length; j < len; j++) {
      cons = constructors[j];
      this.add(cons);
    }
    Type[this.name] = this; // adding this type to the list of all types
  }

  equals(type) {
    return this.name === type.name;
  }

  add(cons) {
    var i, j, name, ref, t, v, vars, xs;
    xs = cons.split(' ');
    name = xs[0];
    vars = [];
    for (i = j = 1, ref = xs.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
      // finding an index of the variable with the name given
      v = this.vars.findIndex((el) => {
        return el.name === xs[i];
      });
      if (v !== -1) { // found a variable, need to bind
        // tricky: creating a Var of type TypeVar that is bound to an index found
        vars.push(new Var((i - 1).toString(), -1, new TypeVar(xs[i], v)));
      } else {
        if (xs[i] === this.name) { // recursive type
          vars.push(new Var((i - 1).toString(), -1, this)); // since this is recursive type, just giving our var a reference to this
// final option: need to look in existing types
        } else {
          t = Type[xs[i]];
          // adding concrete type instead of a variable. No checking for it being a concrete type etc, very rudimentary
          if (t != null) {
            vars.push(new Var((i - 1).toString(), -1, t)); // error, nothing is found. TODO: handle error more gracefully
          } else {
            throw "Type " + xs[i] + " not found!";
          }
        }
      }
    }
    cons = new Constructor(name, this, vars);
    this.constructors[cons.name] = cons; // adding constructor to the list of constructors
    return this[cons.name] = cons.new; // adding "new" generating function as a constructor name - for cleaner syntax! (Nat.Z is a function call instead of Nat.Z.new)
  }

  //export cons.new as cons.name
  //@[cons.name].bind cons # binding this to newly created constructor

  // checking if v is a tuple - for now, checking type of last element in the array (which is Type now),
  // but will need optimized away
  static isTuple(v) {
    return (v instanceof Array) && (v[v.length - 1] instanceof Type);
  }

  // helper function that returns name of the type *even if v is not Value* but a primitive type
  static checkType(v) {
    if (v instanceof Value) {
      return v._type_;
    } else {
      if (Type.isTuple(v)) { // checking if it's a tuple
        return v[v.length - 1];
      } else {
        switch (typeof v) {
          case "string":
            return Type.String;
          case "number":
            return Type.Float;
          case "boolean":
            return Type.Bool;
          default:
            throw "We got an unboxed value of type " + (typeof v) + " -- shouldn't happen!";
        }
      }
    }
  }

  static checkConstructor(v) {
    if (v instanceof Value) {
      return v._constructorTag_;
    } else {
      if (Type.isTuple(v)) { // checking if it's a tuple
        return v[v.length - 2];
      } else {
        switch (typeof v) {
          case "string":
            return "String";
          case "number":
            return "Float";
          case "boolean":
            return "Bool";
          default:
            throw "We got an unboxed value of type " + (typeof v) + " -- shouldn't happen!";
        }
      }
    }
  }

  shortShow(inside = false) {
    var j, len, ref, ret, v;
    ret = (this.vars.length > 0) && inside ? "(" + this.name : this.name;
    ref = this.vars;
    for (j = 0, len = ref.length; j < len; j++) {
      v = ref[j];
      ret = ret + " " + v.name;
    }
    ret = (this.vars.length > 0) && inside ? ret + ")" : ret;
    return ret;
  }

  show() {
    var cs, i, j, ref, ret;
    ret = "type " + this.shortShow();
    cs = Object.keys(this.constructors);
    if (cs.length > 0) {
      ret += " = " + this.constructors[cs[0]].show();
      for (i = j = 1, ref = cs.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        ret += " | " + this.constructors[cs[i]].show();
      }
    }
    return ret;
  }

  // returns array of all types pretty printed as Strings
  static showAllTypes() {
    var ret, t;
    ret = [];
    for (t in Type) {
      if (Type[t] instanceof Type) {
        ret.push(Type[t].show());
      }
    }
    return ret;
  }

};

/*
HELPER FUNCTIONS --------------------------------------------------------------
*/
// show - only Tuple for now
show = (val, top_level = true) => {
  var _constructorTag_, i, j, ref, ret;
  //keys = (v for v in Object.keys(@) when v not in ["show", "_constructorTag_", "_type_"])
  _constructorTag_ = val[val.length - 2];
  ret = (val.length > 2) && (!top_level) ? "(" + _constructorTag_ : _constructorTag_; //+ " :: " + @_type_.name
  //console.log "Properties: --------------------------"
  //console.dir keys
  for (i = j = 0, ref = val.length - 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    if (Type.isTuple(val[i])) {
      ret = ret + " " + show(val[i], false);
    } else {
      ret += (typeof val[i] === "string") ? " '" + val[i] + "'" : " " + val[i].toString();
    }
  }
  ret = (val.length > 2) && (!top_level) ? ret + ")" : ret;
  if (top_level) {
    ret = ret + " :: " + val[val.length - 1].name;
  }
  return ret;
};

/*
 * some built in types --------------------------------------------------------------
 */
TOP = new Type("_TOP_"); // top type of all types - for the future subtyping?

BOTTOM = new Type("_BOTTOM_"); // _|_ in Haskell

EMPTY = new Type("_EMPTY_"); // () in Haskell

UNIT = new Type("_UNIT_", "Unit"); // type with a single element

// exposing constructors for cleaner syntax
Unit = UNIT.Unit;

//console.log Unit().show()

// primitive types (substituted into js types directly)
JInt = new Type("Int", "I#");

JFloat = new Type("Float", "F#");

JString = new Type("String", "S#");

JBool = new Type("Bool", "B#");

T = Type; // alias for global types, so that we can write things like T.Int


// some standard types - exposing constructors right away
// THIS SHOULD GO TO Type creation function - just add the names to Exports!!!
export var Pair = (new Type("Pair a b", "Pair a b")).Pair;

//p = Pair 1, 2
export var Left = (new Type("Either a b", "Left a", "Right b")).Left;

export var Right = Type.Either.Right;

export var Just = (new Type("Maybe a", "Just a", "Nothing")).Just;

export var Nothing = Type.Maybe.Nothing;

export var Cell = (new Type("List a", "Cell a List", "Nil")).Cell;

export var Nil = Type.List.Nil;

export var Z = (new Type("Nat", "Z", "S Nat")).Z;

export var S = Type.Nat.S;

// our functional function with pattern matching and type checking and polymorphism
export var Func = class Func {
  // creating a function with specific types. Last one in the list should be return type!!!
  constructor(name1, ...varTypes) {
    var i, j, ref;
    this.match = this.match.bind(this);
    
    // function application - think through
    // now only works with 1 argument - think about lambda for many argument functions???
    this.ap = this.ap.bind(this);
    this.show = this.show.bind(this);
    this.name = name1;
    this.functions = {};
    this.vars = [];
    for (i = j = 0, ref = varTypes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.vars.push(new Var(i.toString(), -1, varTypes[i]));
    }
  }

  match(consTag, func) {
    this.functions[consTag] = func;
    return this;
  }

  ap(...vals) {
    var t, v;
    v = vals[0];
    t = Type.checkConstructor(v);
    // pattern matching first
    return this.functions[t](v); // calling matched function with the argument
  }

  show() {
    var i, j, ref, ret;
    ret = this.name + " :: ";
    if (this.vars.length < 2) {
      throw "Function must have a return type and at least 1 variable!";
    } else {
      for (i = j = 0, ref = this.vars.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        ret += this.vars[i].type.name + " -> ";
      }
      ret += this.vars[this.vars.length - 1].type.name;
    }
    return ret;
  }

};

// Nat functions - to work on functions implementations
isZero = new Func("isZero", Type.Nat, Type.Bool).match("Z", function() {
  return true;
}).match("S", function() {
  return false;
}).ap;

toInt = new Func("toInt", Type.Nat, Type.Int).match("Z", function() {
  return 0;
}).match("S", function([x]) {
  return 1 + toInt(x); // wow, recursion is automatically beautiful in this model!!!
}).ap;

export var Complex = (new Type("Complex", "Complex Float Float")).Complex;

module = new Func("module", Type.Complex, Type.Float).match("Complex", function([x, y]) {
  return x * x + y * y;
}).ap;

// the below works, so we *can* pattern match quite nicely
// problem is, we can match records like this but not tuples - since it has a structure {'0':..., '1':...} etc
ttf = function({x, y}) {
  console.log("testing destructuring assignment");
  console.dir(arguments);
  return console.log(x, y);
};

tta = function([x, y]) {
  console.log("testing array destructuring assignment");
  console.dir(arguments);
  return console.log(x, y);
};

// different test runs
runTests = function() {
  var c1, j1, j2, j3, two, y0, y1;
  two = S(S(S(S(Z()))));
  console.log(show(Z())); //.show()
  console.log(show(two)); //.show()
  y0 = toInt(Z());
  y1 = toInt(two);
  console.log(y0, y1);
  console.log("isZero Z, isZero two");
  console.log(isZero(Z()));
  console.log(isZero(two));
  j1 = Just(2);
  j2 = Just("Hello");
  j3 = Just(two);
  console.log(show(j1));
  console.log(show(j2));
  console.log(show(j3));
  c1 = Complex(2.3, -1.4);
  console.log(show(c1));
  return console.log(module(c1));
};

runTests();