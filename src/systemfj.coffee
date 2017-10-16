#import "babel-register"
#require "babel-register"

# base class shouldnt be used directly
export class Variable
  constructor: (@name, boundTo) ->
    @boundTo = boundTo # boundTo is used in lambda and type functions to index to which variable current one is bound
  bind: (val)-> throw "Variable::bind() shouldn't be called directly!"
  show: -> console.dir this

# used for type variables
export class TypeVar extends Variable
  constructor: (name, boundTo)-> super name, boundTo
  kind: -> # should return Kind of a type variable's current value
  bind: (val) -> throw "TypeVar::bind() not implemented yet"
  show: => @name + " :: " + "Type"
  shortShow: => @name

# used for regular variables
export class Var extends Variable
  constructor: (name, boundTo, type)->
    super name, boundTo
    @type = type
  type: -> @type # should return Type that our variable indexes - can be either TypeVar OR specific type
  bind: (val) -> throw "Var::bind() not implemented yet"
  show: => @name + " :: " + @type.name

# class for holding values - basically, a record. Do we even need a class here?
# current thinking is - turn this into a record, tuples will be handled as a simple array (see Constructor)
export class Value
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
export class Constructor
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

  ### for typechecking polymorphic constructors, need to have a very different logic
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
  ###

  # For tuples, we are using a convention:
  # [val1, val2, ..., constructorTag, typeTag]
  # Eventually for optimizations can encode it into bytes, for now --
  # so, Nil :: List a will be ["Nil", "List a"]
  # Just 4 :: Maybe Int --> [4, "Just", "Maybe Int"] etc
  # this way, coffee destructuring assignment works quite nicely
  new: (vals...) =>
    #console.log "Calling new!"
    #console.dir vals
    val = [] #new Value @name, @type
    for i in [0...@vars.length]
      #console.log "Processing " + @vars[i].show()
      #console.dir vals[i]
      v = vals[i] # is there a value number i?
      if v?
        t = @vars[i].type # t can be TypeVar (in polymorphic constructors) or a concrete Type, need to handle separately
        if (t instanceof TypeVar)
          console.log "new Value creation - Partially implemented"
          # 1. need to check type constrains (type classes etc), now NOT implemented
          # 2. need to set the TypeVar to the type of the current val - somewhere on Value, now NOT implemented
          # 3. set the value to value
          val.push v
        else
          if t.equals Type.checkType v # are the types ok? doesnt work for polymorphic yet!!!
            val.push v
          else throw "Type mismatch in assignment!"
    val.push @name
    val.push @type
    val

  # this function creates a Value, but it's useful for records
  # for tuples, see "new"
  newValue: (vals...) =>
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
          t = @vars[i].type # t can be TypeVar (in polymorphic constructors) or a concrete Type, need to handle separately
          if (t instanceof TypeVar)
            console.log "new Value creation - Partially implemented"
            # 1. need to check type constrains (type classes etc), now NOT implemented
            # 2. need to set the TypeVar to the type of the current val - somewhere on Value, now NOT implemented
            # 3. set the value to value
            val[@vars[i].name] = v
          else
            if t.equals Type.checkType v # are the types ok? doesnt work for polymorphic yet!!!
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
export class Type
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
    #export cons.new as cons.name
    #@[cons.name].bind cons # binding this to newly created constructor

  # checking if v is a tuple - for now, checking type of last element in the array (which is Type now),
  # but will need optimized away
  @isTuple: (v)->
    (v instanceof Array) and (v[v.length-1] instanceof Type)

  # helper function that returns name of the type *even if v is not Value* but a primitive type
  @checkType: (v) ->
    if (v instanceof Value)
      v._type_
    else
      if Type.isTuple v # checking if it's a tuple
        v[v.length-1]
      else
        switch (typeof v)
          when "string" then Type.String
          when "number" then Type.Float
          when "boolean" then Type.Bool
          else throw "We got an unboxed value of type " + (typeof v) + " -- shouldn't happen!"

  @checkConstructor: (v) ->
    if (v instanceof Value)
      v._constructorTag_
    else
      if Type.isTuple v # checking if it's a tuple
        v[v.length-2]
      else
        switch (typeof v)
          when "string" then "String"
          when "number" then "Float"
          when "boolean" then "Bool"
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

###
HELPER FUNCTIONS --------------------------------------------------------------
###

# show - only Tuple for now
show = (val, top_level = true)=>
  #keys = (v for v in Object.keys(@) when v not in ["show", "_constructorTag_", "_type_"])
  _constructorTag_ = val[val.length-2]
  ret = if (val.length > 2) and (not top_level) then "(" + _constructorTag_ else _constructorTag_  #+ " :: " + @_type_.name
  #console.log "Properties: --------------------------"
  #console.dir keys
  for i in [0...val.length-2]
    if Type.isTuple val[i]
      ret = ret + " " + show val[i], false
    else
      ret += if (typeof val[i] is "string") then " '" + val[i] + "'" else " " + val[i].toString()
  ret = if (val.length > 2) and (not top_level) then ret + ")" else ret
  ret = ret + " :: " + val[val.length-1].name if top_level
  ret


###
# some built in types --------------------------------------------------------------
###
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
JBool = new Type "Bool", "B#"

T = Type # alias for global types, so that we can write things like T.Int

# some standard types - exposing constructors right away
# THIS SHOULD GO TO Type creation function - just add the names to Exports!!!
export Pair = (new Type "Pair a b", "Pair a b").Pair
#p = Pair 1, 2
export Left = (new Type "Either a b", "Left a", "Right b").Left
export Right = Type.Either.Right
export Just = (new Type "Maybe a", "Just a", "Nothing").Just
export Nothing = Type.Maybe.Nothing
export Cell = (new Type "List a", "Cell a List", "Nil").Cell
export Nil = Type.List.Nil

export Z = (new Type "Nat", "Z", "S Nat").Z
export S = Type.Nat.S

# our functional function with pattern matching and type checking and polymorphism
export class Func
  # creating a function with specific types. Last one in the list should be return type!!!
  constructor: (@name, varTypes...) ->
    @functions = {}
    @vars = []
    for i in [0...varTypes.length]
      @vars.push new Var i.toString(), -1, varTypes[i]


  match: (consTag, func) =>
    @functions[consTag] = func

  # function application - think through
  # now only works with 1 argument - think about lambda for many argument functions???
  ap: (vals...) =>
    v = vals[0]
    t = Type.checkConstructor v
    # pattern matching first
    @functions[t] v # calling matched function with the argument

  show: =>
    ret = @name + " :: "
    if @vars.length < 2
      throw "Function must have a return type and at least 1 variable!"
    else
      for i in [0...@vars.length-1]
        ret += @vars[i].type.name + " -> "
      ret += @vars[@vars.length-1].type.name
    ret


# Nat functions - to work on functions implementations
fisZero = new Func "isZero", Type.Nat, Type.Bool
fisZero.match "Z", -> true
fisZero.match "S", -> false
isZero = fisZero.ap

f1 = new Func "toInt", Type.Nat, Type.Int
f1.match "Z", -> 0
f1.match "S", ([x]) -> 1 + f1.ap x
toInt = f1.ap

# the below works, so we *can* pattern match quite nicely
# problem is, we can match records like this but not tuples - since it has a structure {'0':..., '1':...} etc
ttf = ({x, y}) ->
  console.log "testing destructuring assignment"
  console.dir arguments
  console.log x, y

tta = ([x, y]) ->
  console.log "testing array destructuring assignment"
  console.dir arguments
  console.log x, y

# different test runs
runTests = ->
  two = S S S S Z()
  console.log show Z() #.show()
  console.log show two #.show()
  y0 = toInt Z()
  y1 = toInt two
  console.log y0, y1
  console.log "isZero Z, isZero two"
  console.log isZero Z()
  console.log isZero two

  j1 = Just 2
  j2 = Just "Hello"
  j3 = Just two
  console.log show j1
  console.log show j2
  console.log show j3





runTests()
