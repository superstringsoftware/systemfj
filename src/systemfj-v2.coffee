util = require('util')
util.inspect.defaultOptions.colors = true
#util.inspect.defaultOptions.depth = 3

# SystemFJ - type theory library for JS / Coffee

# Javascript Classes are first class types in the system

# Values are Tuples - product types - and are represented as JS arrays, frozen (so readonly):
# [x1, x2, ..., xn, constructorEncoding, typeEncoding], 
# where xi are values of Concrete types (primitive JS or other Tuples),
# constructorEncoding is a pointer (array index?) to all constructors in the system,
# typeEncoding is an Array of structure [typeName, type1, type2, ..., typek] - for type constructors
# Examples:
# Just 4 :: Maybe Int --> [4, i->"Just", [j->"Maybe", k->"Int"]]
# Cell 1.2 Nil :: List Float  --> [1.2, [i->"Nil", [j->"List", k->"Float"], l->"Cell", [m->"List", n->"Float"]]

# Alternative --> DON'T store type info in the tuple, but only the constructor. Type can be reconstructed from it? Then:
# [x1, ..., xn, constructorEncoding] - much more lightweight
# Just 4 -> [4, i->"Just"] (int follows from 4? how to distinguish between int and Number?)
# Cell 1.2 Nil -> [1.2, [i->"Nil"], j->"Cell"] (float follows from 1.2)
# Person "Anton" "Antich" 40 -> ["Anton", "Antich", 40, i->"Person"]

# Then, Type global object shall contain:
# array of Constructors, which can be accessed by @constructors[val[val.length]]
# array of Types, also indexed by integer
# this way we can encode all typing info via integers
# what if we want dependent types, such as Vector a:Type, n:Int? where do we store n??? simply as part of a tuple on each value?
# so, Vector a n = DepVector (List a) n, and n will be fixed to a constant on a constructor?

# basics:
# Either a:Type, b:Type = Left x:a | Right y:b - sum
# Pair a:Type, b:Type = Pair x:a y:b - product

# So we need - some sort of a "type template" + function that clones it and instantiates vars to specific values
# can we start from constructors and encode all info there?
# e.g., to produce Pair 4 "hello" we call Pair Int, 4, String, "Hello"?
# then we need partial application if somebody does something like:
# type MyPair a = Pair Int a - question is, should MyPair be equal to Pair Int?????
#
# so, something like:
# Type.new "Maybe", Type
#   .cons "Just", 0
#   .cons "Nil"
# Type.new "Pair", Type, Type
# .cons "Pair", [0, 1]
# Type.new "Either", Type, Type
#   .cons "Left", 0
# .cons "Right", 1

# what if we want something like:
# data Crazy a b = Cons Int a String b???
# Type.new "Crazy", Type, Type
#   .cons "Cons", [Int, 0, String, 1]


class Constructor
  @MAGIC: -7777.777 # magic number to make sure our array is a Tuple and not just a JS array - is the LAST item in all Tuples
  # varBindings is an array containing either Types or numbers. If it's a number - it's a type variable bound to Type level vars.
  constructor: (@type, @index, @name, varBindings)->
    @varBindings = []
    @varBindings = varBindings if varBindings?

  # function creating new Tuple from given values with this constructor
  # should do typechecking and then form a value
  # vals is either a value (primitive or tuple) or an array of values 
  new: (v) =>
    vals = []
    if v instanceof Array
      vals = v 
    else 
      vals = [v] if v? # if undefined, keeping empty array
    if vals.length isnt @varBindings.length then throw "Expecting " + @varBindings.length + " arguments and received " + vals.length + " in the call of " + @name
    ret = []
    # 1. Need to typecheck all values: 
    #    - if there's a concrete type - do a typecheck, 
    #    - if there's a type variable, do a constrain check (non existent now!!!) and simply instantiate
    for i in [0...vals.length]
      if Type.isTypeOk vals[i], @varBindings[i]
        Object.freeze vals[i]
        ret.push vals[i]
      else throw "Type mismatch in the " + i + "-th argument in the call to " + @name + ": expected " + @varBindings[i].fullName() + " and got " + Type.getTypeName vals[i]
    ret.push @index # pushing index of this constructor as the last-1 item in value array
    ret.push Constructor.MAGIC
    Object.freeze ret
    ret 


class Type
  @_typeVarNames = ['a','b','c','d','e','f','g','h']
  @allConstructors = [] 

  # function checks if the type of val is ok for the binding
  @isTypeOk: (val, binding)->
    if typeof binding is "number"
      # it's a bound type variable, need to - 
      # DO A CONSTRAIN CHECK ON TYPE!!! - NOT IMPLEMENTED!!!
      # for now, simply returning true
      true
    else # binding is a concrete type 
      #console.log "Concrete type"
      #console.dir binding
      t1 = Type.getTypeName val
      #console.log "Type of val is " + t1 + " and binding is " + binding.fullName()
      #console.log binding
      if t1 is binding.fullName() then true else false 

  fullName: => 
    ret = @name
    ret += " " + Type._typeVarNames[i] for i in [0...@varTypes.length]
    ret

  @isTuple: (v)->(v instanceof Array) and (v[v.length-1] is Constructor.MAGIC)

  # gets a type of val, whether it's our tuple value or JS value
  @getTypeName: (v) -> 
    if Type.isTuple v # it's a tuple - need to reconstruct the type from constructor index! 
      cons = Type.allConstructors[v[v.length-2]]
      ret = cons.type.name # for now, simply returns type name - but needs to return fully qualified, e.g. List Int vs just List etc
      vararr = (Type._typeVarNames[i] for i in [0...cons.type.varTypes.length])
      for i in [0...cons.varBindings.length]
        if typeof cons.varBindings[i] is "number"
          vararr[cons.varBindings[i]] = Type.getTypeName v[i]
          
      ret += " " + x for x in vararr
      ret
    else
      switch (typeof v)
        when "string" then "String"
        when "number" 
          if Number.isInteger v then "Int" else "Float"
        when "boolean" then "Bool"
        when "function" then "Function" # ok, this is actually not good, since pattern matching won't work with curried functions this way
        when "object"  # finding the name of the constructor for a standard JS object - useful for defining generic pattern matched functions
          s = v.constructor.toString()
          s.substring (s.indexOf ' ') + 1, (s.indexOf '(')
        else throw "We got an unboxed value of type " + (typeof v) + " while checking type -- shouldn't happen!"

  # creating new type with name @name and array of Types as variables (for * -> * etc kinds)
  constructor: (@name, varTypes)->
    @constructors = {}
    @varTypes = []
    @varTypes = varTypes if varTypes?
    Type[@name] = @ # putting newly created type to the Type object itself

  # creates a new type with different signatures
  @new: (name, varTypes)->
    switch typeof varTypes
      when "undefined" then new Type name # no dependencies, concrete type
      when "number" # Type.new "Just", 1 - simply giving arity of the type constructor
        vt = []
        vt.push Type.Type for i in [0...varTypes]
        new Type name, vt
      else 
        if varTypes instanceof Array then new Type name, varTypes else throw "Unexpected arguments in Type construction!"

  # add a new constructor to a given type
  cons: (name, bindings)=>
    c = new Constructor @, Type.allConstructors.length, name, bindings
    Type.allConstructors.push c # adding this constructor to array of all constructors
    @constructors[name] = c # adding this constructor to the dictionary of this type constructors
    global[name] = c # putting constructor into global scope
    @ # for chaining calls


# some helper functions

# nice show for tuple values
show = (v, top_level = true)->
  cons = Type.allConstructors[v[v.length - 2]]
  ret = if (v.length > 2) and (not top_level) then "(" + cons.name else cons.name
  for i in [0...v.length-2]
    if Type.isTuple v[i] 
      ret += " " + show v[i], false
    else 
      ret += if typeof v[i] is "string" then " '" + v[i] + "'" else " " + v[i] 
  ret = if (v.length > 2) and (not top_level) then ret + ")" else ret
  ret += " :: " + Type.getTypeName v if top_level
  ret

# standard types
Type.new "Type"
Type.new "Int"
T = Type


# tests
runTests = ->

  Type.new "Maybe", 1
    .cons "Just", [0]
    .cons "Nothing"
  
  Type.new "Pair", 2
    .cons "Pair", [0, 1]
 
  Type.new "Either", 2
    .cons "Left", [0]
    .cons "Right", [1]

  Type.new "Strange", 1
    .cons "Crazy", [T.Int, 0]

  Type.new "Concrete"
    .cons "Concrete", [T.Int]

  Type.new "List", 1
    .cons "Cell", [0, Type.List]
    .cons "Nil"

  #console.dir Type 

  console.log show Just.new 17
  console.log show Just.new "hello"
  console.log show Nothing.new()
  console.log show Concrete.new 41
  console.log show Pair.new ["Hello", 249]
  #console.log show Concrete.new 41.2
  console.log show Right.new "hello"
  console.log show Left.new 3.1415

  console.log show Crazy.new [4, "hello"]

  #console.dir Type.List, depth: 3
  l1 = Cell.new [5, Nil.new()]
  #console.dir list
  console.log show l1

  # ok logic here - check the type of the 1st argument, update constructor bindings types (Int here), require List Int in all future calls.
  l2 = Cell.new [18.7, l1] 



runTests()












