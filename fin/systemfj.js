"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Generated by CoffeeScript 2.0.1
//import "babel-register"
//require "babel-register"

// base class shouldnt be used directly
var T,
    id,
    imagPart,
    isZero,
    length,
    magnitude,
    map,
    realPart,
    runTests,
    _show,
    toInt,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

var Variable = exports.Variable = function () {
  function Variable(name1, boundTo) {
    _classCallCheck(this, Variable);

    this.name = name1;
    this.boundTo = boundTo; // boundTo is used in lambda and type functions to index to which variable current one is bound
  }

  _createClass(Variable, [{
    key: "bind",
    value: function bind(val) {
      throw "Variable::bind() shouldn't be called directly!";
    }
  }, {
    key: "show",
    value: function show() {
      return console.dir(this);
    }
  }]);

  return Variable;
}();

var TypeVar = exports.TypeVar = function (_Variable) {
  _inherits(TypeVar, _Variable);

  function TypeVar(name, boundTo) {
    _classCallCheck(this, TypeVar);

    var _this = _possibleConstructorReturn(this, (TypeVar.__proto__ || Object.getPrototypeOf(TypeVar)).call(this, name, boundTo));

    _this.show = _this.show.bind(_this);
    _this.shortShow = _this.shortShow.bind(_this);
    return _this;
  }

  _createClass(TypeVar, [{
    key: "kind",
    value: function kind() {} // should return Kind of a type variable's current value

  }, {
    key: "bind",
    value: function bind(val) {
      throw "TypeVar::bind() not implemented yet";
    }
  }, {
    key: "show",
    value: function show() {
      // used for type variables
      boundMethodCheck(this, TypeVar);
      return this.name + " :: " + "Type";
    }
  }, {
    key: "shortShow",
    value: function shortShow() {
      boundMethodCheck(this, TypeVar);
      return this.name;
    }
  }]);

  return TypeVar;
}(Variable);

var Var = exports.Var = function (_Variable2) {
  _inherits(Var, _Variable2);

  function Var(name, boundTo, type) {
    _classCallCheck(this, Var);

    var _this2 = _possibleConstructorReturn(this, (Var.__proto__ || Object.getPrototypeOf(Var)).call(this, name, boundTo));

    _this2.show = _this2.show.bind(_this2);
    _this2.type = type;
    return _this2;
  }

  _createClass(Var, [{
    key: "type",
    value: function type() {
      return this.type; // should return Type that our variable indexes - can be either TypeVar OR specific type
    }
  }, {
    key: "bind",
    value: function bind(val) {
      throw "Var::bind() not implemented yet";
    }
  }, {
    key: "show",
    value: function show() {
      // used for regular variables
      boundMethodCheck(this, Var);
      return this.name + " :: " + this.type.name;
    }
  }]);

  return Var;
}(Variable);

// class for holding values - basically, a record. Do we even need a class here?
// current thinking is - turn this into a record, tuples will be handled as a simple array (see Constructor)
var Value = exports.Value = function () {
  // pass in constructorTag and reference to type, add value fields as needed
  // for now passing reference to Type, ideally need to do all type checking via
  // constructorTags only for efficiency
  function Value(_constructorTag_1, _type_) {
    _classCallCheck(this, Value);

    // pretty printing values
    this.show = this.show.bind(this);
    this._constructorTag_ = _constructorTag_1;
    this._type_ = _type_;
  }

  _createClass(Value, [{
    key: "show",
    value: function show() {
      var top_level = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var j, keys, len, ret, v;
      keys = function () {
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
      }.call(this);
      ret = keys.length > 0 && !top_level ? "(" + this._constructorTag_ : this._constructorTag_; //+ " :: " + @_type_.name
      //console.log "Properties: --------------------------"
      //console.dir keys
      for (j = 0, len = keys.length; j < len; j++) {
        v = keys[j];
        if (this[v] instanceof Value) {
          ret = ret + " " + this[v].show(false);
        } else {
          ret += typeof this[v] === "string" ? " '" + this[v] + "'" : " " + this[v].toString();
        }
      }
      ret = keys.length > 0 && !top_level ? ret + ")" : ret;
      if (top_level) {
        ret = ret + " :: " + this._type_.name;
      }
      return ret;
    }
  }]);

  return Value;
}();

// class generating Product Type values (records)
// Should NOT be available to constuct publicly, only from inside of Type
// now can only generate Tuples (unnamed records)
var Constructor = exports.Constructor = function () {
  function Constructor(name1, type1, vars) {
    _classCallCheck(this, Constructor);

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


  _createClass(Constructor, [{
    key: "_instantiate",
    value: function _instantiate(n, val) {}

    // same as above but instantiates type for n-th variable, needed to e.g. create Just Int from Just a

  }, {
    key: "_instantiateType",
    value: function _instantiateType(n, type) {}
  }, {
    key: "new",
    value: function _new() {
      var i, j, ref, t, v, val;
      //console.log "Calling new!"
      //console.dir vals
      val = []; //new Value @name, @type

      for (var _len = arguments.length, vals = Array(_len), _key = 0; _key < _len; _key++) {
        vals[_key] = arguments[_key];
      }

      for (i = j = 0, ref = this.vars.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        //console.log "Processing " + @vars[i].show()
        //console.dir vals[i]
        v = vals[i];
        if (v != null) {
          t = this.vars[i].type; // t can be TypeVar (in polymorphic constructors) or a concrete Type, need to handle separately
          if (t instanceof TypeVar) {
            // console.log "new Value creation - Partially implemented"
            // 1. need to check type constrains (type classes etc), now NOT implemented
            // 2. need to set the TypeVar to the type of the current val - somewhere on Value, now NOT implemented
            // 3. set the value to value
            val.push(v);
          } else {
            if (t.equals(Type.checkType(v))) {
              // are the types ok? doesnt work for polymorphic yet!!!
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
  }, {
    key: "newValue",
    value: function newValue() {
      var i, j, ref, t, v, val;
      //console.log "Calling new!"
      //console.dir vals
      if (this.vars.length === 0) {
        return new Value(this.name, this.type); // empty constructor is easy
      } else {
        //console.log "Compound constructor"
        val = new Value(this.name, this.type);

        for (var _len2 = arguments.length, vals = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          vals[_key2] = arguments[_key2];
        }

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
              if (t.equals(Type.checkType(v))) {
                // are the types ok? doesnt work for polymorphic yet!!!
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
  }, {
    key: "show",
    value: function show() {
      var j, len, ref, ret, v;
      ret = this.name;
      ref = this.vars;
      for (j = 0, len = ref.length; j < len; j++) {
        v = ref[j];
        ret = ret + " " + v.type.shortShow(true);
      }
      return ret;
    }
  }]);

  return Constructor;
}();

// Class that contains all types in the system and at the same time serves as a SumType
// of Constructors (which are Product types)
var Type = exports.Type = function () {
  // create a new type with name and type variables (no regular vars as no dependent types yet)
  // e.g. Maybe = new Type "Maybe a"
  function Type(type, constructors) {
    _classCallCheck(this, Type);

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
    this.vars = function () {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = xs.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        results.push(new TypeVar(xs[i], -1));
      }
      return results;
    }();
    // adding constructors
    for (j = 0, len = constructors.length; j < len; j++) {
      cons = constructors[j];
      this.add(cons);
    }
    Type[this.name] = this; // adding this type to the list of all types
  }

  // static function to add a new type - potentially we may not want to construct new types directly


  _createClass(Type, [{
    key: "equals",
    value: function equals(type) {
      return this.name === type.name;
    }
  }, {
    key: "add",
    value: function add(cons) {
      var i, j, name, ref, t, v, vars, xs;
      xs = cons.split(' ');
      name = xs[0];
      vars = [];
      for (i = j = 1, ref = xs.length; 1 <= ref ? j < ref : j > ref; i = 1 <= ref ? ++j : --j) {
        // finding an index of the variable with the name given
        v = this.vars.findIndex(function (el) {
          return el.name === xs[i];
        });
        if (v !== -1) {
          // found a variable, need to bind
          // tricky: creating a Var of type TypeVar that is bound to an index found
          vars.push(new Var((i - 1).toString(), -1, new TypeVar(xs[i], v)));
        } else {
          if (xs[i] === this.name) {
            // recursive type
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
      this[cons.name] = cons.new; // adding "new" generating function as a constructor name - for cleaner syntax! (Nat.Z is a function call instead of Nat.Z.new)
      return global[cons.name] = cons.new; // putting constructor function to the global namespace - IS IT EVEN A GOOD APPROACH??
    }

    //export cons.new as cons.name
    //@[cons.name].bind cons # binding this to newly created constructor

    // checking if v is a tuple - for now, checking type of last element in the array (which is Type now),
    // but will need optimized away

  }, {
    key: "shortShow",
    value: function shortShow() {
      var inside = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var j, len, ref, ret, v;
      ret = this.vars.length > 0 && inside ? "(" + this.name : this.name;
      ref = this.vars;
      for (j = 0, len = ref.length; j < len; j++) {
        v = ref[j];
        ret = ret + " " + v.name;
      }
      ret = this.vars.length > 0 && inside ? ret + ")" : ret;
      return ret;
    }
  }, {
    key: "show",
    value: function show() {
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

  }], [{
    key: "new",
    value: function _new(type) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      return new Type(type, args);
    }
  }, {
    key: "isTuple",
    value: function isTuple(v) {
      return v instanceof Array && v[v.length - 1] instanceof Type;
    }

    // helper function that returns name of the type *even if v is not Value* but a primitive type

  }, {
    key: "checkType",
    value: function checkType(v) {
      if (v instanceof Value) {
        return v._type_;
      } else {
        if (Type.isTuple(v)) {
          // checking if it's a tuple
          return v[v.length - 1];
        } else {
          switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
            case "string":
              return Type.String;
            case "number":
              return Type.Float;
            case "boolean":
              return Type.Bool;
            default:
              throw "We got an unboxed value of type " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + " -- shouldn't happen!";
          }
        }
      }
    }

    // this is a key function - used in function pattern matching etc

  }, {
    key: "checkConstructor",
    value: function checkConstructor(v) {
      if (v === _) {
        _;
      }
      if (v instanceof Value) {
        v._constructorTag_;
      }
      if (Type.isTuple(v)) {
        return v[v.length - 2];
      } else {
        switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
          case "string":
            return "String";
          case "number":
            return "Float";
          case "boolean":
            return "Bool";
          case "function":
            return "Function"; // ok, this is actually not good, since pattern matching won't work with curried functions this way
          default:
            throw "We got an unboxed value of type " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + " -- shouldn't happen!";
        }
      }
    }
  }, {
    key: "showAllTypes",
    value: function showAllTypes() {
      var ret, t;
      ret = [];
      for (t in Type) {
        if (Type[t] instanceof Type) {
          ret.push(Type[t].show());
        }
      }
      return ret;
    }
  }]);

  return Type;
}();

/*
HELPER FUNCTIONS --------------------------------------------------------------
*/
// show - only Tuple for now
_show = function show(val) {
  var top_level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  var _constructorTag_, i, j, ref, ret;
  //keys = (v for v in Object.keys(@) when v not in ["show", "_constructorTag_", "_type_"])
  _constructorTag_ = val[val.length - 2];
  ret = val.length > 2 && !top_level ? "(" + _constructorTag_ : _constructorTag_; //+ " :: " + @_type_.name
  //console.log "Properties: --------------------------"
  //console.dir keys
  for (i = j = 0, ref = val.length - 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    if (Type.isTuple(val[i])) {
      ret = ret + " " + _show(val[i], false);
    } else {
      ret += typeof val[i] === "string" ? " '" + val[i] + "'" : " " + val[i].toString();
    }
  }
  ret = val.length > 2 && !top_level ? ret + ")" : ret;
  if (top_level) {
    ret = ret + " :: " + val[val.length - 1].name;
  }
  return ret;
};

/*
 * some built in types --------------------------------------------------------------
 */
Type.new("_TOP_"); // top type of all types - for the future subtyping?

Type.new("_BOTTOM_"); // _|_ in Haskell

Type.new("_EMPTY_"); // () in Haskell

Type.new("_UNIT_", "Unit"); // type with a single element

Type.new("FUNCTION"); // placeholder for all functions, eventually needs to be replaced with proper (a -> b) signatures

// exposing constructors for cleaner syntax
// Unit = UNIT.Unit

//console.log Unit().show()

// primitive types (substituted into js types directly)
Type.new("Int", "I#");

Type.new("Float", "F#");

Type.new("String", "S#");

Type.new("Bool", "B#");

T = Type; // alias for global types, so that we can write things like T.Int


// some standard types - exposing constructors right away
// THIS SHOULD GO TO Type creation function - just add the names to Exports!!!
Type.new("Pair a b", "Pair a b");

Type.new("Either a b", "Left a", "Right b");

Type.new("Maybe a", "Just a", "Nothing");

Type.new("List a", "Cell a List", "Nil");

Type.new("Nat", "Z", "S Nat");

// our functional function with pattern matching and type checking and polymorphism
var Func = exports.Func = function () {
  // creating a function with specific types. Last one in the list should be return type!!!
  function Func(name1) {
    var _this3 = this;

    _classCallCheck(this, Func);

    var i, j, ref;
    //console.log "Created function " + @name + " with arguments:"
    //console.log @vars

    // adding a default pattern match
    this.default = this.default.bind(this);
    // single argument call
    this.matchOne = this.matchOne.bind(this);
    // many arguments pattern match
    // tricky since we need to handle empty pattern (_) somehow
    this.matchMany = this.matchMany.bind(this);
    // general match function, handles 3 cases:
    // 1. no pattern, so "match (x)->x" - default match, simply a function definition
    // 2. pattern is a string - so, 1 argument function, e.g. "match 'Nil', -> Nil()"
    // 3. pattern is an array of patterns, so many arguments function e.g. "match [f, "Cell"], (f, [x, tail]) -> ..."
    this.match = this.match.bind(this);

    // function application - think through. now extremely inefficient, esp. w/ recursive functions
    // now only works with 1 argument - think about lambda for many argument functions???
    // now there's no partial application and we do need it!!!
    this.ap = this.ap.bind(this);
    this.show = this.show.bind(this);
    this.name = name1;
    this.functions = {};
    this.vars = [];

    for (var _len4 = arguments.length, varTypes = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      varTypes[_key4 - 1] = arguments[_key4];
    }

    this.returnType = varTypes.pop();
    for (i = j = 0, ref = varTypes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      this.vars.push(new Var(i.toString(), -1, varTypes[i]));
    }
    // adding a default catch all function
    this.functions["__DEFAULT__"] = function () {
      throw "Non-exaustive pattern match in definition of " + _this3.show();
    };
    this.fdef = this.functions["__DEFAULT__"];
  }

  _createClass(Func, [{
    key: "default",
    value: function _default(func) {
      this.functions["__DEFAULT__"] = func;
      return this.fdef = func;
    }
  }, {
    key: "matchOne",
    value: function matchOne(consTag, func) {
      return this.functions[consTag] = func;
    }
  }, {
    key: "matchMany",
    value: function matchMany(patterns, func) {
      var j, len, pat, v;
      pat = ""; // building a pattern first
      for (j = 0, len = patterns.length; j < len; j++) {
        v = patterns[j];
        pat += v;
      }
      return this.functions[pat] = func;
    }
  }, {
    key: "match",
    value: function match(patterns, func) {
      switch (typeof patterns === "undefined" ? "undefined" : _typeof(patterns)) {
        case "function":
          // -- it's a default
          this.default(patterns);
          break;
        case "string":
          // -- it's a 1-arg function
          this.matchOne(patterns, func);
          break;
        default:
          if (patterns instanceof Array) {
            //console.log "multiple pattern match"
            this.matchMany(patterns, func);
          } else {
            throw "Unrecognized pattern in pattern match definition of" + this.show();
          }
      }
      return this;
    }
  }, {
    key: "ap",
    value: function ap() {
      var f, j, len, pat, v;
      //console.log "Calling function " + @name + " with args:"
      //console.log vals
      pat = ""; // building a pattern first

      for (var _len5 = arguments.length, vals = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        vals[_key5] = arguments[_key5];
      }

      for (j = 0, len = vals.length; j < len; j++) {
        v = vals[j];
        pat += Type.checkConstructor(v);
      }
      //console.log "Pattern in pattern application: " + pat
      // pattern matching first
      f = this.functions[pat];
      // calling matched function with the argument
      if (f != null) {
        return f.apply(this, vals);
      } else {
        return this.fdef.apply(this, vals);
      }
    }
  }, {
    key: "show",
    value: function show() {
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
      return ret += " -> " + this.returnType.name;
    }
  }]);

  return Func;
}();

var _ = exports._ = "__ANY_PATTERN_MATCH__"; // exporting _ for empty pattern matches


// id - checking "default" functionality and polymorphic functions
// for now, works in terms of default but there's no polymorphic type checks etc
id = new Func("id").match(function (x) {
  return x;
}).ap;

// Nat functions - to work on functions implementations
isZero = new Func("isZero", Type.Nat, Type.Bool).match("Z", function () {
  return true;
}).match("S", function () {
  return false;
}).ap;

toInt = new Func("toInt", Type.Nat, Type.Int).match("Z", function () {
  return 0;
}).match("S", function (_ref) {
  var _ref2 = _slicedToArray(_ref, 1),
      x = _ref2[0];

  return 1 + toInt(x); // wow, recursion is automatically beautiful in this model!!!
}).ap;

// complex type and some functions, loosely following Haskell interface
// in Haskell, Complex is actually a type constructor: data Complex a
// we only have quick and dirty Float implementation
Type.new("Complex", "Complex Float Float");

realPart = new Func("realPart", Type.Complex, Type.Float).match("Complex", function (_ref3) {
  var _ref4 = _slicedToArray(_ref3, 1),
      x = _ref4[0];

  return x;
}).ap;

imagPart = new Func("realPart", Type.Complex, Type.Float).match("Complex", function (_ref5) {
  var _ref6 = _slicedToArray(_ref5, 2),
      _ = _ref6[0],
      y = _ref6[1];

  return y;
}).ap;

magnitude = new Func("magnitude", Type.Complex, Type.Float).match("Complex", function (_ref7) {
  var _ref8 = _slicedToArray(_ref7, 2),
      x = _ref8[0],
      y = _ref8[1];

  return x * x + y * y;
}).ap;

// List - basic recursive type, very much needed for some advanced experiments - mapping functions, recursion etc
length = new Func("length", Type.List, Type.Int).match("Nil", function () {
  return 0;
}).match("Cell", function (_ref9) {
  var _ref10 = _slicedToArray(_ref9, 2),
      _ = _ref10[0],
      tail = _ref10[1];

  return 1 + length(tail);
}).ap;

// ok, map is more complicated right away because it takes 2 parameters
map = new Func("map", Type.FUNCTION, Type.List, Type.List).match(["Function", "Nil"], function () {
  return Nil();
}).match(["Function", "Cell"], function (f, _ref11) {
  var _ref12 = _slicedToArray(_ref11, 2),
      x = _ref12[0],
      tail = _ref12[1];

  return Cell(f(x), map(f, tail));
}).ap;

// different test runs
runTests = function runTests() {
  var c1, j1, j2, j3, l, m, two, y0, y1;
  two = S(S(S(S(Z()))));
  console.log(_show(Z())); //.show()
  console.log(_show(two)); //.show()
  y0 = toInt(Z());
  y1 = toInt(two);
  console.log(y0, y1);
  console.log("isZero Z, isZero two");
  console.log(isZero(Z()));
  console.log(isZero(two));
  j1 = Just(2);
  j2 = Just("Hello");
  j3 = Just(two);
  console.log(_show(j1));
  console.log(_show(j2));
  console.log(_show(j3));
  c1 = Complex(2.3, -1.4);
  console.log(_show(c1));
  console.log(magnitude(c1));
  console.log("Real: " + realPart(c1));
  console.log("Imag: " + imagPart(c1));
  //console.log module 5
  console.log(id(4));
  console.log(id("hello"));
  console.log(_show(id(two)));
  l = Cell(1, Cell(2, Cell(3, Nil())));
  console.log(_show(l));
  console.log("Length of l: " + length(l));
  console.log("Testing map");
  m = map(function (x) {
    return x * 2;
  }, l);
  return console.log(_show(m));
};

runTests();