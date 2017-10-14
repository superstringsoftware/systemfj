# base class shouldnt be used directly
class Variable
  constructor: (@name, boundTo) ->
    @boundTo = boundTo # boundTo is used in lambda and type functions to index to which variable current one is bound
  bind: (val)-> throw "Variable::bind() shouldn't be called directly!"
  show: -> console.dir this

# used for type variables
class TypeVar extends Variable
  constructor: (name, boundTo)-> super name, boundTo
  kind: -> # should return Kind of a type variable's current value
  bind: (val) -> throw "TypeVar::bind() not implemented yet"
  show: => @name + " :: " + "Type"
  shortShow: => @name

# used for regular variables
class Var extends Variable
  constructor: (name, boundTo, type)->
    super name, boundTo
    @type = type
  type: -> @type # should return Type that our variable indexes - can be either TypeVar OR specific type
  bind: (val) -> throw "Var::bind() not implemented yet"
  show: => @name + " :: " + @type.name

# class for holding values - basically, a record. Do we even need a class here?
class Value
  # pass in constructorTag and reference to type, add value fields as needed
  # for now passing reference to Type, ideally need to do all type checking via
  # constructorTags only for efficiency
  constructor: (@_constructorTag_, @_type_) ->
  # pretty printing values
  show: (top_level = true)=>
    keys = (v for v in Object.keys(@) when v not in ["show", "_constructorTag_", "_type_"])
    ret = if (keys.length > 0) and (not top_level) then "(" + @_constructorTag_ else @_constructorTag_  #+ " :: " + @_type_.name
    #console.log "Properties: --------------------------"
    #console.dir keys
    for v in keys
      if (@[v] instanceof Value)
        ret = ret + " " + (@[v].show false)
      else
        ret += if (typeof @[v] is "string") then " '" + @[v] + "'" else " " + @[v].toString()
    ret = if (keys.length > 0) and (not top_level) then ret + ")" else ret
    ret = ret + " :: " + @_type_.name if top_level
    ret

# class generating Product Type values (records)
# Should NOT be available to constuct publicly, only from inside of Type
# now can only generate Tuples (unnamed records)
class Constructor
  constructor: (@name, @type, vars) ->
    @vars = []
    @vars = vars if vars?

  # internal method assigning a value to n-th variable, doing typechecking etc along the way
  _instantiate: (n, val) ->
  # same as above but instantiates type for n-th variable, needed to e.g. create Just Int from Just a
  _instantiateType: (n, type) ->

  # creates new value of the current type, typechecks etc
  # this is the main function to construct values
  # now very inefficient
  # bound since we are doing some fancy assignments for better syntax
  new: (vals...) =>
    #console.log "Calling new!"
    #console.dir vals
    if @vars.length is 0
      new Value @name, @type # empty constructor is easy
    else
      #console.log "Compound constructor"
      val = new Value @name, @type
      for i in [0...@vars.length]
        #console.log "Processing " + @vars[i].show()
        #console.dir vals[i]
        v = vals[i] # is there a value number i?
        if v?
          if @vars[i].type.equals Type.checkType v # are the types ok? doesnt work for polymorphic yet!!!
            val[@vars[i].name] = v
          else throw "Type mismatch in assignment!"
      val

  show: =>
    ret = @name
    for v in @vars
      ret = ret + " " + v.type.shortShow true
    ret

# Class that contains all types in the system and at the same time serves as a SumType
# of Constructors (which are Product types)
class Type
  # create a new type with name and type variables (no regular vars as no dependent types yet)
  # e.g. Maybe = new Type "Maybe a"
  constructor: (type, constructors...)->
    @constructors = {}
    xs = type.split(' ');
    @name = xs[0]
    # creating TypeVars for each var name in the constructor
    @vars = (new TypeVar xs[i], -1 for i in [1...xs.length])
    @add cons for cons in constructors # adding constructors
    Type[@name] = this # adding this type to the list of all types

  # comparing 2 types, for now very basic (simply name)
  equals: (type)=> @name is type.name

  # adding a new constructor to this type in the same format as Type constructor,
  # e.g. "Just a" or "MyPair Int Float"
  add: (cons) =>
    xs = cons.split(' ');
    name = xs[0];
    # for the remainder of the cons string things are a bit tricky:
    # if there's a type var name ("Just a") - we need to create a Var, type of which is bound to the TypeVar with the same name on the type level
    # if there's a specific type name ("Just Int") - we need to create a Var with type Int - *if* it exists in our system!
    vars = []
    for i in [1...xs.length]
      # finding an index of the variable with the name given
      v = @vars.findIndex (el)=> el.name is xs[i]
      if v isnt -1 # found a variable, need to bind
        # tricky: creating a Var of type TypeVar that is bound to an index found
        vars.push new Var (i-1).toString(), -1, new TypeVar xs[i], v
      else
        if xs[i] is @name # recursive type
          vars.push new Var (i-1).toString(), -1, this # since this is recursive type, just giving our var a reference to this
        else # final option: need to look in existing types
          t = Type[xs[i]]
          # adding concrete type instead of a variable. No checking for it being a concrete type etc, very rudimentary
          if t?
            vars.push new Var (i-1).toString(), -1, t
          else # error, nothing is found. TODO: handle error more gracefully
            throw ("Type " + xs[i] + " not found!")

    cons = new Constructor name, this, vars
    @constructors[cons.name] = cons # adding constructor to the list of constructors
    @[cons.name] = cons.new # adding "new" generating function as a constructor name - for cleaner syntax! (Nat.Z is a function call instead of Nat.Z.new)
    #@[cons.name].bind cons # binding this to newly created constructor

  # helper function that returns name of the type *even if v is not Value* but a primitive type
  @checkType: (v) ->
    if (v instanceof Value)
      v._type_
    else
      switch (typeof v)
        when "string" then Type.String
        when "number" then Type.Float
        else throw "We got an unboxed value of type " + (typeof v) + " -- shouldn't happen!"

  shortShow: (inside = false)=>
    ret = if (@vars.length > 0) and inside then "(" + @name else @name
    for v in @vars
      ret = ret + " " + v.name
    ret = if (@vars.length > 0) and inside then ret + ")" else ret
    ret

  show: =>
    ret = "type " + @shortShow()
    cs = Object.keys @constructors
    if cs.length > 0
      ret += " = " + @constructors[cs[0]].show()
      ret += " | " + @constructors[cs[i]].show() for i in [1...cs.length]
    ret

  # returns array of all types pretty printed as Strings
  @showAllTypes: =>
    ret = []
    for t of Type
      ret.push Type[t].show() if Type[t] instanceof Type
    ret

# some built in types
TOP = new Type "_TOP_" # top type of all types - for the future subtyping?
BOTTOM = new Type "_BOTTOM_" # _|_ in Haskell
EMPTY = new Type "_EMPTY_" # () in Haskell
UNIT = new Type "_UNIT_", "Unit" # type with a single element
# exposing constructors for cleaner syntax
Unit = UNIT.Unit

#console.log Unit().show()

# primitive types (substituted into js types directly)
JInt = new Type "Int", "I#"
JFloat = new Type "Float", "F#"
JString = new Type "String", "S#"

# some standard types - exposing constructors right away
# THIS SHOULD GO TO Type creation function - just add the names to Exports!!!
Pair = (new Type "Pair a b", "Pair a b").Pair
#p = Pair 1, 2
Left = (new Type "Either a b", "Left a", "Right b").Left
Right = Type.Either.Right
Just = (new Type "Maybe a", "Just a", "Nothing").Just
Nothing = Type.Maybe.Nothing
Cell = (new Type "List a", "Cell a List", "Nil").Cell
Nil = Type.List.Nil

Z = (new Type "Nat", "Z", "S Nat").Z
S = Type.Nat.S

T = Type # alias for global types, so that we can write things like T.Int

# our functional function with pattern matching and type checking and polymorphism
class Func
  constructor: (@name, @arity) ->
    @functions = {}

  match: (consTag, func) =>
    @functions[consTag] = func

  # function application - think through
  # now only works with 1 argument - think about lambda for many argument functions???
  ap: (vals...) =>
    v = vals[0]
    if not (v instanceof Value)
      throw ("Type error while calling " + @name)
    # pattern matching first
    fn = x for x of @functions when x is v._constructorTag_
    @functions[fn] v # calling matched function with the argument


# Some tests #################################################

#Maybe.add "Nothing"
#Maybe.add "Just a"
#tMaybe.add "Crazy Int"
#tMaybe.add "MoreCrazy Afasf"
tCustom = new Type "Custom", "Cons Float String"

console.log t for t in Type.showAllTypes()

length = new Func "length"
length.match "Nil", -> 0
length.match "Cell", (x) -> 1 + length.ap (tail x)

f1 = new Func "toInt", 1
f1.match "Z", -> 0
f1.match "S", (x) -> 1 + f1.ap x['0'] # this pattern matching works for 0th element of S constructor - how do we make it a better syntax???
toInt = f1.ap

#console.dir toInt
#console.dir Maybe, {depth: 4, colors: true}
#console.dir List, {depth: 4, colors: true}
#console.dir Type, {depth: 6, colors: true}

two = S S S S Z()
console.log Z().show()
console.log two.show()
y0 = toInt Z()
y1 = toInt two
console.log y0, y1

t1 = T.Custom.Cons 2, "Hello"
console.log t1.show()

#console.log T.List.constructors.Cell.show()
#console.log T.List.show()
