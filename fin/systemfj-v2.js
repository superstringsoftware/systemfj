"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Generated by CoffeeScript 1.12.7
(function () {
  var Constructor,
      Func,
      T,
      Type,
      _,
      fromArray,
      head,
      id,
      length,
      map,
      root,
      runTests,
      _show,
      tail,
      util,
      bind = function bind(fn, me) {
    return function () {
      return fn.apply(me, arguments);
    };
  },
      indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }return -1;
  },
      slice = [].slice;

  util = require('util');

  util.inspect.defaultOptions.colors = true;

  util.inspect.defaultOptions.depth = 3;

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  Constructor = function () {
    Constructor.MAGIC = -7777.777;

    function Constructor(type, index, name1, varBindings) {
      this.type = type;
      this.index = index;
      this.name = name1;
      this.updateCurrentBindings = bind(this.updateCurrentBindings, this);
      this["new"] = bind(this["new"], this);
      this.varBindings = [];
      if (varBindings != null) {
        this.varBindings = varBindings;
      }
      this.currentVarBindings = [];
    }

    Constructor.prototype["new"] = function (v) {
      var i, j, ref, ret, vals, vb;
      vals = [];
      if (v instanceof Array) {
        vals = v;
      } else {
        if (v != null) {
          vals = [v];
        }
      }
      if (vals.length !== this.varBindings.length) {
        throw "Expecting " + this.varBindings.length + " arguments and received " + vals.length + " in the call of " + this.name;
      }
      ret = [];
      this.currentVarBindings = this.varBindings.slice();
      for (i = j = 0, ref = vals.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        vb = this.currentVarBindings[i];
        if (Type.isTypeOk(vals[i], vb)) {
          if (typeof vb === "number") {
            this.updateCurrentBindings(i, Type.getType(vals[i]));
          }
          Object.freeze(vals[i]);
          ret.push(vals[i]);
        } else {
          throw "Type mismatch in the argument #" + (i + 1) + " in the call to " + this.name + ": expected " + vb.fullName() + " and got " + Type.getTypeName(vals[i]);
        }
      }
      ret.push(this.index);
      ret.push(Constructor.MAGIC);
      Object.freeze(ret);
      return ret;
    };

    Constructor.prototype.updateCurrentBindings = function (k, val) {
      var i, j, ref, results, t;
      results = [];
      for (i = j = 0, ref = this.currentVarBindings.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        if (this.currentVarBindings[i] === k) {
          this.currentVarBindings[i] = val;
        }
        if (this.type.name === this.currentVarBindings[i].name) {
          t = this.currentVarBindings[i]._clone();
          t.varTypes[k] = val;
          results.push(this.currentVarBindings[i] = t);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return Constructor;
  }();

  Type = function () {
    Type._typeVarNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    Type.allConstructors = [];

    Type.isTypeOk = function (val, binding) {
      var i, j, ok, ref, ref1, ref2, ret, tt, vt;
      if (typeof binding === "number") {
        return true;
      } else {
        vt = Type.getTypeName(val).split(' ');
        tt = binding.fullName().split(' ');
        ret = true;
        for (i = j = 0, ref = tt.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          if ((ref1 = tt[i], indexOf.call(Type._typeVarNames, ref1) >= 0) || (ref2 = vt[i], indexOf.call(Type._typeVarNames, ref2) >= 0)) {
            ok = true;
          } else {
            ok = vt[i] === tt[i] ? true : false;
          }
          ret = ret && ok;
        }
        return ret;
      }
    };

    Type.prototype.fullName = function () {
      var i, j, ref, ret;
      ret = this.name;
      for (i = j = 0, ref = this.varTypes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        ret += this.varTypes[i].name === "Type" ? " " + Type._typeVarNames[i] : " " + this.varTypes[i].name;
      }
      return ret;
    };

    Type.isTuple = function (v) {
      return v instanceof Array && v[v.length - 1] === Constructor.MAGIC;
    };

    Type.getType = function (v) {
      var cons;
      if (Type.isTuple(v)) {
        cons = Type.allConstructors[v[v.length - 2]];
        return cons.type;
      } else {
        switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
          case "string":
            return Type.String;
          case "number":
            if (Number.isInteger(v)) {
              return Type.Int;
            } else {
              return Type.Float;
            }
            break;
          case "boolean":
            return Type.Bool;
          case "function":
            return Type.Function;
          case "object":
            return Type.Object;
          default:
            throw "We got an unboxed value of type " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + " while checking type -- shouldn't happen!";
        }
      }
    };

    Type.getTypeName = function (v) {
      var cons, i, j, len, m, ref, ret, s, vararr, x;
      if (Type.isTuple(v)) {
        cons = Type.allConstructors[v[v.length - 2]];
        ret = cons.type.name;
        vararr = function () {
          var j, ref, results;
          results = [];
          for (i = j = 0, ref = cons.type.varTypes.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            results.push(Type._typeVarNames[i]);
          }
          return results;
        }();
        for (i = j = 0, ref = cons.varBindings.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          if (typeof cons.varBindings[i] === "number") {
            vararr[cons.varBindings[i]] = Type.getTypeName(v[i]);
          }
        }
        for (m = 0, len = vararr.length; m < len; m++) {
          x = vararr[m];
          ret += " " + x;
        }
        return ret;
      } else {
        switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
          case "string":
            return "String";
          case "number":
            if (Number.isInteger(v)) {
              return "Int";
            } else {
              return "Float";
            }
            break;
          case "boolean":
            return "Bool";
          case "function":
            return "Function";
          case "object":
            s = v.constructor.toString();
            return s.substring(s.indexOf(' ') + 1, s.indexOf('('));
          default:
            throw "We got an unboxed value of type " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + " while checking type -- shouldn't happen!";
        }
      }
    };

    Type.checkConstructor = function (v) {
      var s;
      if (Type.isTuple(v)) {
        return Type.allConstructors[v[v.length - 2]].name;
      } else {
        switch (typeof v === "undefined" ? "undefined" : _typeof(v)) {
          case "string":
            return "String";
          case "number":
            return "Float";
          case "boolean":
            return "Bool";
          case "function":
            return "Function";
          case "object":
            s = v.constructor.toString();
            return s.substring(s.indexOf(' ') + 1, s.indexOf('('));
          default:
            throw "We got an unboxed value of type " + (typeof v === "undefined" ? "undefined" : _typeof(v)) + " while checking Constructor -- shouldn't happen!";
        }
      }
    };

    function Type(name1, varTypes, addToTypes) {
      this.name = name1;
      if (addToTypes == null) {
        addToTypes = true;
      }
      this.cons = bind(this.cons, this);
      this.instantiate = bind(this.instantiate, this);
      this._clone = bind(this._clone, this);
      this.fullName = bind(this.fullName, this);
      this.constructors = {};
      this.varTypes = [];
      if (varTypes != null) {
        this.varTypes = varTypes;
      }
      if (addToTypes) {
        Type[this.name] = this;
      }
    }

    Type.prototype._clone = function () {
      return new Type(this.name, this.varTypes.slice(), false);
    };

    Type.prototype.instantiate = function (vals) {
      if (vals.length !== this.varTypes.length) {
        throw "Have to instantiate a type with full signature now!";
      }
      return new Type(this.name, vals, false);
    };

    Type["new"] = function (name, varTypes) {
      var i, j, ref, vt;
      switch (typeof varTypes === "undefined" ? "undefined" : _typeof(varTypes)) {
        case "undefined":
          return new Type(name);
        case "number":
          vt = [];
          for (i = j = 0, ref = varTypes; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            vt.push(Type.Type);
          }
          return new Type(name, vt);
        default:
          if (varTypes instanceof Array) {
            return new Type(name, varTypes);
          } else {
            throw "Unexpected arguments in Type construction!";
          }
      }
    };

    Type.prototype.cons = function (name, bindings) {
      var c;
      c = new Constructor(this, Type.allConstructors.length, name, bindings);
      Type.allConstructors.push(c);
      this.constructors[name] = c;
      global[name] = c["new"];
      root[name] = c["new"];
      return this;
    };

    return Type;
  }();

  _show = function show(v, top_level) {
    var cons, i, j, ref, ret;
    if (top_level == null) {
      top_level = true;
    }
    cons = Type.allConstructors[v[v.length - 2]];
    ret = v.length > 2 && !top_level ? "(" + cons.name : cons.name;
    for (i = j = 0, ref = v.length - 2; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (Type.isTuple(v[i])) {
        ret += " " + _show(v[i], false);
      } else {
        switch (Type.checkConstructor(v[i])) {
          case "String":
            ret += " '" + v[i] + "'";
            break;
          case "Array":
            ret += " [" + v[i] + "]";
            break;
          default:
            ret += " " + v[i];
        }
      }
    }
    ret = v.length > 2 && !top_level ? ret + ")" : ret;
    if (top_level) {
      ret += " :: " + Type.getTypeName(v);
    }
    return ret;
  };

  Type["new"]("Type");

  Type["new"]("Int");

  Type["new"]("Float");

  Type["new"]("String");

  Type["new"]("Function");

  Type["new"]("Object");

  Type["new"]("Array");

  T = Type;

  Type["new"]("Maybe", 1).cons("Just", [0]).cons("Nothing");

  Type["new"]("Pair", 2).cons("Pair", [0, 1]);

  Type["new"]("Either", 2).cons("Left", [0]).cons("Right", [1]);

  Type["new"]("Strange", 1).cons("Crazy", [T.Int, 0]);

  Type["new"]("Concrete").cons("Concrete", [T.Int]);

  /*
  FUNCTION CLASS with pattern matching and partial application  --------------------------------------------------------------
   */

  Func = function () {
    function Func() {
      var name1, varTypes;
      name1 = arguments[0], varTypes = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      this.name = name1;
      this.show = bind(this.show, this);
      this.ap = bind(this.ap, this);
      this.match = bind(this.match, this);
      this.matchMany = bind(this.matchMany, this);
      this.matchOne = bind(this.matchOne, this);
      this["default"] = bind(this["default"], this);
      this._clone = bind(this._clone, this);
      this.functions = {};
      this.vars = [];
      this.vals = [];
      this.returnType = varTypes.pop();
      if (varTypes != null) {
        this.vars = varTypes;
      }
      this.functions["__DEFAULT__"] = function (_this) {
        return function () {
          var a, e, j, k, len, len1, m, ref, v;
          console.dir(arguments);
          v = "Arguments:";
          for (j = 0, len = arguments.length; j < len; j++) {
            a = arguments[j];
            v += " " + Type.checkConstructor(a);
          }
          e = "Expected: ";
          ref = _this.vars;
          for (m = 0, len1 = ref.length; m < len1; m++) {
            k = ref[m];
            e += " " + k.type.name;
          }
          throw "Non-exaustive pattern match in definition of " + _this.show() + "\n" + v + "\n" + e;
        };
      }(this);
      this.fdef = this.functions["__DEFAULT__"];
      root[this.name] = this.ap;
    }

    Func.prototype._clone = function () {
      var f, v;
      f = new Func(this.name);
      f.returnType = this.returnType;
      f.fdef = this.fdef;
      f.functions = this.functions;
      f.vars = function () {
        var j, len, ref, results;
        ref = this.vars;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          v = ref[j];
          results.push(v.clone());
        }
        return results;
      }.call(this);
      f.vals = this.vals.slice(0);
      return f;
    };

    Func.prototype["default"] = function (func) {
      this.functions["__DEFAULT__"] = func;
      return this.fdef = func;
    };

    Func.prototype.matchOne = function (consTag, func) {
      return this.functions[consTag] = func;
    };

    Func.prototype.matchMany = function (patterns, func) {
      var j, len, pat, v;
      pat = "";
      for (j = 0, len = patterns.length; j < len; j++) {
        v = patterns[j];
        pat += v;
      }
      return this.functions[pat] = func;
    };

    Func.prototype.match = function (patterns, func) {
      switch (typeof patterns === "undefined" ? "undefined" : _typeof(patterns)) {
        case "function":
          this["default"](patterns);
          break;
        case "string":
          this.matchOne(patterns, func);
          break;
        default:
          if (patterns instanceof Array) {
            this.matchMany(patterns, func);
          } else {
            throw "Unrecognized pattern in pattern match definition of" + this.show();
          }
      }
      return this;
    };

    Func.prototype.ap = function () {
      var allVals, f, j, len, len1, m, pat, v, vals;
      vals = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (vals.length < this.vars.length) {
        f = this._clone();
        for (j = 0, len = vals.length; j < len; j++) {
          v = vals[j];
          f.vals.push(v);
        }
        f.vars = f.vars.slice(vals.length);
        return f.ap;
      } else {
        allVals = this.vals.concat(vals);
        pat = "";
        for (m = 0, len1 = allVals.length; m < len1; m++) {
          v = allVals[m];
          pat += Type.checkConstructor(v);
        }
        f = this.functions[pat];
        if (f != null) {
          return f.apply(this, allVals);
        } else {
          return this.fdef.apply(this, allVals);
        }
      }
    };

    Func.prototype.show = function () {
      var i, j, ref, ret;
      ret = this.name + " :: ";
      for (i = j = 0, ref = this.vars.length - 1; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        ret += this.vars[i].type.name + " -> ";
      }
      ret += this.vars[this.vars.length - 1].type.name;
      return ret += " -> " + this.returnType.name;
    };

    return Func;
  }();

  _ = "__ANY_PATTERN_MATCH__";

  /*
  SOME STANDARD FUNCTIONS --------------------------------------------------------------
   */

  id = new Func("id").match(function (x) {
    return x;
  }).ap;

  /*
   * ========= LISTS VIA TYPECLASSES =========================================================
   */

  Type["new"]("List", 1).cons("Cell", [0, Type.List]).cons("Nil");

  length = new Func("length", Type.List, Type.Int).match("Nil", function () {
    return 0;
  }).match("Cell", function (arg) {
    var _, tail;
    _ = arg[0], tail = arg[1];
    return 1 + length(tail);
  }).ap;

  map = new Func("map", Type.Function, Type.List, Type.List).match(["Function", "Nil"], function () {
    return Nil();
  }).match(["Function", "Cell"], function (f, arg) {
    var tail, x;
    x = arg[0], tail = arg[1];
    return Cell([f(x), map(f, tail)]);
  }).ap;

  Type["new"]("JList", 1).cons("JList", [Type.Array]);

  fromArray = new Func("fromArray", Type.Array, Type.JList).match("Array", function (a) {
    return JList(a);
  }).ap;

  head = new Func("head").match("JList", function (arg) {
    var l;
    l = arg[0];
    return l[0];
  }).ap;

  tail = new Func("tail", Type.JList, Type.JList).match("JList", function (arg) {
    var l;
    l = arg[0];
    return JList(l.slice(1));
  }).ap;

  runTests = function runTests() {
    var jl, l1, l2, l3;
    console.log(_show(Just(17)));
    console.log(_show(Just("hello")));
    console.log(_show(Nothing()));
    console.log(_show(Concrete(41)));
    console.log(_show(Pair(["Hello", 249])));
    console.log(_show(Right("hello")));
    console.log(_show(Left(3.1415)));
    console.log(_show(Crazy([4, "hello"])));
    l1 = Cell([5, Nil()]);
    console.log(_show(l1));
    l2 = Cell([18, l1]);
    console.log(_show(l2));

    /*
    #l3 = Cell.new [15, 29] # has to fail 
    
    
     * for testing incremental construction
    Type.new "T1", 1
      .cons "T1C", [0, 0]
    
    t = T1C.new ["4", "7"]
    console.log show t
     */
    console.log(" ");
    console.log("==============================================");
    console.log("             TESTING FUNCTIONS                ");
    console.log("==============================================");
    console.log(_show(id(Just(13))));
    console.log("Length of list " + _show(l2) + " is " + length(l2));
    console.log("Mapping * 2 over this same list: ");
    l3 = map(function (x) {
      return x * 2;
    }, l2);
    console.log(_show(l3));
    jl = fromArray([[1, 2, 3, 4, 5]]);
    return console.log(_show(jl));
  };

  root.Type = Type;

  root.Func = Func;

  console.log(root);
}).call(undefined);