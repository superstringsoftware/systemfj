// Generated by CoffeeScript 2.0.1
(function() {
  // base class shouldnt be used directly
  var Constructor, Function, Maybe, Type, TypeVar, Var, Variable, length;

  Variable = class Variable {
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

  // used for type variables
  TypeVar = class TypeVar extends Variable {
    constructor(name, boundTo) {
      super(name, boundTo);
    }

    kind() {} // should return Kind of a type variable's current value

    bind(val) {
      throw "TypeVar::bind() not implemented yet";
    }

  };

  // used for regular variables
  Var = class Var extends Variable {
    constructor(name, boundTo, type) {
      super(name, boundTo);
      this.type = type;
    }

    type() {
      return this.type; // should return Type that our variable indexes - can be either TypeVar OR specific type
    }

    bind(val) {
      throw "Var::bind() not implemented yet";
    }

  };

  // class generating Product Type values (records)
  // Should NOT be available to constuct publicly, only from inside of Type
  Constructor = class Constructor {
    constructor(name1, vars) {
      this.name = name1;
      this.vars = [];
      if (vars != null) {
        this.vars = vars;
      }
    }

    // internal method assigning a value to n-th variable, doing typechecking etc along the way
    _instantiate(n, val) {}

    // same as above but instantiates type for n-th variable, needed to e.g. create Just Int from Just a
    _instantiateType(n, type) {}

    // creates new value of the current type, typechecks etc
    new(vals) {}

  };

  Type = (function() {
    class Type {
      // create a new type with name and type variables (no regular vars as no dependent types yet)
      // e.g. Maybe = new Type "Maybe a"
      constructor(type, ...constructors) {
        var cons, i, j, len, xs;
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
        Type.allTypes[this.name] = this; // adding this type to the list of all types
      }

      
      // adding a new constructor to this type in the same format as Type constructor,
      // e.g. "Just a" or "MyPair Int Float"
      add(cons) {
        var i, j, name, ref, v, vars, xs;
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
            vars.push(new Var((i - 1).toString(), -1, new TypeVar(xs[i], v))); // not found, need to look for a type with this name - TBD
          } else {
            console.log("not found");
          }
        }
        cons = new Constructor(name, vars);
        return this[cons.name] = cons;
      }

    };

    Type.allTypes = {};

    return Type;

  })();

  // our functional function with pattern matching and type checking and polymorphism
  Function = class Function {
    constructor(name1) {
      this.name = name1;
      this.functions = {};
    }

    match(consTag, func) {
      return this.functions[consTag] = func;
    }

    // function application - think through
    ap(vals) {}

  };

  // Some tests #################################################
  Maybe = new Type("Maybe a", "Just a", "Nothing");

  //Maybe.add "Nothing"
  //Maybe.add "Just a"
  // Maybe.add "Crazy Int"
  length = new Function("length");

  length.match("Nil", function() {
    return 0;
  });

  length.match("Cell", function(x) {
    return 1 + length.ap(tail(x));
  });

  console.dir(length);

  console.dir(Maybe, {
    depth: 4,
    colors: true
  });

}).call(this);
