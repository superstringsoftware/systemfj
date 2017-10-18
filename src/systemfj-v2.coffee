util = require('util')
util.inspect.defaultOptions.colors = true
util.inspect.defaultOptions.depth = 3

# setting up old-type exports for Node
root = exports ? window

#colors = require('colors/safe')

#console.dir colors
#console.log (colors.green 'hello')

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
    @currentVarBindings = [] # this gets copied each time from Type

  # function creating new Tuple from given values with this constructor
  # should do typechecking and then form a value
  # vals is either a value (primitive or tuple) or an array of values 
  new: (v) =>
    vals = []
    if v instanceof Array
      vals = v 
    else 
      vals = [v] if v? # if undefined, keeping empty array, if just one item - putting it into array
    # cannot do partial instantiation (technically, we can, might be needed in dynamic type operations)
    if vals.length isnt @varBindings.length then throw "Expecting " + @varBindings.length + " arguments and received " + vals.length + " in the call of " + @name
    ret = []
    # 1. Need to typecheck all values: 
    #    - if there's a concrete type - do a typecheck, 
    #    - if there's a type variable, do a constrain check (non existent now!!!) and simply instantiate
    
    # this will contain bound vars for handling cases like Cell 1.4:Float (Cell 2:Int Nil) -
    # constructor is Cell a (List a) and we need to make sure we instantiate our type to List Float from the first variable
    # so that then typecheck fails when it gets List Int as the second! 
    @currentVarBindings = @varBindings.slice() # cloning array of vars our type has - this is the one against which we need to be type checking!!!
    for i in [0...vals.length]
      #console.log "Processing var " + i
      vb = @currentVarBindings[i]
      #console.log "Comparing ", vals[i]
      #console.log "And ", vb
      if Type.isTypeOk vals[i], vb 
        if typeof vb is "number"
          #console.log "Updating parametric type while constructing"
          # so this is a bound variable - need to update typeBoundVars to its' type
          @updateCurrentBindings i, Type.getType vals[i]
        # now freezing and returning
        Object.freeze vals[i]
        ret.push vals[i]
      else
        throw "Type mismatch in the argument #" + (i+1) + " in the call to " + @name + ": expected " + vb.fullName() + " and got " + Type.getTypeName vals[i]
    ret.push @index # pushing index of this constructor as the last-1 item in value array
    ret.push Constructor.MAGIC # pushing MAGIC number to identify tuple against a regular array as the last item
    Object.freeze ret
    ret 

  # needed to bind variables in our signature - e.g., if we have Cons a a and call Cons 4 "hello",
  # will have to update bindings to [Int, Int] after first occurence so then the latter typecheck fails
  # Recursive types such as List a = Cell a (List a) are trickier to do but have to be as well!
  updateCurrentBindings: (k, val)=>
    for i in [0...@currentVarBindings.length]
      @currentVarBindings[i] = val if @currentVarBindings[i] is k
      if @type.name is @currentVarBindings[i].name # recursive type - handle with care
        #console.log "Found recursive type definition: " + @type.name
        t = @currentVarBindings[i]._clone() # copying original type to which we are bound
        # instantiating *it's* type variables
        t.varTypes[k] = val
        # putting it back into bound place
        @currentVarBindings[i] = t
    #console.log "Updated currentVarBindings from ", @varBindings
    #console.log "To: ", @currentVarBindings


class Type
  @_typeVarNames = ['a','b','c','d','e','f','g','h']
  @allConstructors = [] 

  # function checks if the type of val is ok for the binding
  @isTypeOk: (val, binding)->
    if typeof binding is "number"
      # it's a bound type variable, need to - 
      # DO A CONSTRAIN CHECK ON TYPE!!! - NOT IMPLEMENTED!!!
      # for now, simply returning true
      # console.log "Got a bound var in typecheck: " + val + ", " + binding
      true
    else # binding is a concrete type 
      # this is a bit tricky as we have a Type constructor such as "List a" and on values we have concrete types such as "List Int"
      # so, for now we do typechecking via strings, which is obviously inefficient and will need to redo it on the more low level
      #console.log "We are now in type checking"
      vt = (Type.getTypeName val).split ' '
      tt = binding.fullName().split ' '
      #console.log "Comparing ", vt
      #console.log "And ", tt
      ret = true
      for i in [0...tt.length]
        # if we expect a type var - it's ok, BUT need to CHECK CONSTRAINS WHEN THEY ARE IMPLEMENTED!!!
        # OR if value type is polymorphic (e.g., Nil :: List a - can attach to any other list)
        # OR we are building something recursively with a function - eventually, will need to typecheck function return type, for now just ignoring
        if (tt[i] in Type._typeVarNames) or (vt[i] in Type._typeVarNames) #or (vt[i] is 'Function') or vt[i] is undefined # this last one is needed for Function case handling, but NEEDS FIXING!!!
          #console.log i, " ", vt[i], "ret is " + ret
          ok = true
        else 
          #console.log i, " ", vt[i], "ret is " + ret
          ok = if vt[i] is tt[i] then true else false
        ret = ret and ok
      #console.log "Typechecks: " + ret
      ret 

  # returning fully qualified type name based on current var bindings
  fullName: => 
    ret = @name
    for i in [0...@varTypes.length]
      ret += if @varTypes[i].name is "Type" then " " + Type._typeVarNames[i] else " " + @varTypes[i].name 
    ret

  @isTuple: (v)->(v instanceof Array) and (v[v.length-1] is Constructor.MAGIC)

  # gets a type of val, whether it's our tuple value or JS value
  @getType: (v) -> 
    if Type.isTuple v # it's a tuple - need to reconstruct the type from constructor index! 
      cons = Type.allConstructors[v[v.length-2]]
      cons.type
    else #primitives
      switch (typeof v)
        when "string" then Type.String
        when "number" 
          if Number.isInteger v then Type.Int else Type.Float
        when "boolean" then Type.Bool
        when "function" then Type.Function # ok, this is actually not good, since pattern matching won't work with curried functions this way
        when "object" then Type.Object # finding the name of the constructor for a standard JS object - useful for defining generic pattern matched functions
        else throw "We got an unboxed value of type " + (typeof v) + " while checking type -- shouldn't happen!"


  # gets a type *name* of a val, whether it's our tuple value or JS value
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
    else #primitives
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

  # this is a key function - used in function pattern matching etc
  @checkConstructor: (v) ->
    if Type.isTuple v then Type.allConstructors[v[v.length-2]].name
    else
      switch (typeof v)
        when "string" then "String"
        when "number" then "Float"
        when "boolean" then "Bool"
        when "function" then "Function" # ok, this is actually not good, since pattern matching won't work with curried functions this way
        when "object"  # finding the name of the constructor for a standard JS object - useful for defining generic pattern matched functions
          s = v.constructor.toString()
          s.substring (s.indexOf ' ') + 1, (s.indexOf '(')
        else throw "We got an unboxed value of type " + (typeof v) + " while checking Constructor -- shouldn't happen!"

  # creating new type with name @name and array of Types as variables (for * -> * etc kinds)
  constructor: (@name, varTypes, addToTypes = true)->
    @constructors = {}
    @varTypes = []
    @varTypes = varTypes if varTypes?
    Type[@name] = @ if addToTypes # putting newly created type to the Type object itself

  # internal method needed for creating the Type with the same name, but instantiated variables
  _clone: => new Type @name, @varTypes.slice(), false # calling with addToTypes = false to not override the master type

  # instantiating parametric type with the full signature, e.g. make Pair Int String from Pair a b etc
  # TODO: Type / Constrain checking eventually, now none present!!!
  instantiate: (vals) => 
    if vals.length isnt @varTypes.length then throw "Have to instantiate a type with full signature now!"
    new Type @name, vals, false

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
    global[name] = c.new # putting constructor into global scope
    root[name] = c.new # exporting Constructor functions
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
      switch (Type.checkConstructor v[i])
        when "String" then ret += " '" + v[i] + "'"
        when "Array" then ret += " [" + v[i] + "]"
        else ret += " " + v[i]
      
  ret = if (v.length > 2) and (not top_level) then ret + ")" else ret
  ret += " :: " + Type.getTypeName v if top_level
  ret

# standard types
Type.new "Type"
Type.new "Int"
Type.new "Float"
Type.new "String"
Type.new "Function"
Type.new "Object"
Type.new "Array"
T = Type


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


###
FUNCTION CLASS with pattern matching and partial application  --------------------------------------------------------------
###
# our functional function with pattern matching and type checking and polymorphism
class Func
  # creating a function with specific types. Last one in the list should be return type!!!
  constructor: (@name, varTypes...) ->
    @functions = {} # functions against which we pattern match
    @vars = [] # variables that this function accepts
    @vals = [] # array of values to handle partial application
    @returnType = varTypes.pop()
    @vars = varTypes if varTypes?
    # adding a default catch all function
    @functions["__DEFAULT__"] = => 
      console.dir arguments
      v = "Arguments:"
      v += " " + Type.checkConstructor a for a in arguments
      e = "Expected: "
      e += " " + k.type.name for k in @vars
      throw "Non-exaustive pattern match in definition of " + @show() + "\n" + v + "\n" + e
    @fdef = @functions["__DEFAULT__"]
    #console.log "Created function " + @name + " with arguments:"
    #console.log @vars
    root[@name] = @ap # Exporting to global scope!

  # internal function needed for creating new function based on this
  # when doing partial application without screwing original function signature
  _clone: =>
    f = new Func @name
    f.returnType = @returnType
    f.fdef = @fdef
    f.functions = @functions
    f.vars = (v.clone() for v in @vars) # deep cloning vars - do we need to?
    f.vals = @vals.slice 0 # shallow cloning vals
    f

  # adding a default pattern match
  default: (func) => @functions["__DEFAULT__"] = func; @fdef = func

  # single argument call
  matchOne: (consTag, func) => @functions[consTag] = func

  # many arguments pattern match
  # tricky since we need to handle empty pattern (_) somehow
  matchMany: (patterns, func) =>
    pat = "" # building a pattern first
    pat += v for v in patterns
    @functions[pat] = func

  # general match function, handles 3 cases:
  # 1. no pattern, so "match (x)->x" - default match, simply a function definition
  # 2. pattern is a string - so, 1 argument function, e.g. "match 'Nil', -> Nil()"
  # 3. pattern is an array of patterns, so many arguments function e.g. "match [f, "Cell"], (f, [x, tail]) -> ..."
  match: (patterns, func) =>
    switch typeof patterns
      when "function" # -- it's a default
        @default patterns
      when "string" # -- it's a 1-arg function
        @matchOne patterns, func
      else
        if (patterns instanceof Array)
          #console.log "multiple pattern match"
          @matchMany patterns, func
        else throw "Unrecognized pattern in pattern match definition of" + @show()
    @ # for chaining


  # function application - think through. now extremely inefficient, esp. w/ recursive functions
  # now only works with 1 argument - think about lambda for many argument functions???
  # now there's no partial application and we do need it!!!
  ap: (vals...) =>
    #console.log "Calling function " + @name + " with args:"
    #console.log vals
    if vals.length < @vars.length
      # partial application - cloning our function object, memoizing variables and values
      #console.log "Partial application in " + @name
      f = @_clone()
      f.vals.push v for v in vals # adding given values to memoized
      f.vars = f.vars.slice vals.length # cutting remaining vars array
      f.ap 
    else
      allVals = @vals.concat vals
      pat = "" # building a pattern first
      pat += Type.checkConstructor v for v in allVals
      #console.log "Pattern in pattern application: " + pat + " in " + @name
      # pattern matching first
      f = @functions[pat]
      # calling matched function with the argument
      if f? then f.apply @, allVals else @fdef.apply @, allVals

  show: =>
    ret = @name + " :: "
  
    for i in [0...@vars.length-1]
      ret += @vars[i].type.name + " -> "
    ret += @vars[@vars.length-1].type.name
    ret += " -> " + @returnType.name

_ = "__ANY_PATTERN_MATCH__" # exporting _ for empty pattern matches

###
SOME STANDARD FUNCTIONS --------------------------------------------------------------
###
# id - checking "default" functionality and polymorphic functions
# for now, works in terms of default but there's no polymorphic type checks etc
id = new Func "id"
  .match (x)->x
  .ap


###
# ========= LISTS VIA TYPECLASSES =========================================================
###

# purely functional list type - slow, inefficient etc
Type.new "List", 1
  .cons "Cell", [0, Type.List]
  .cons "Nil"

# List - basic recursive type, very much needed for some advanced experiments - mapping functions, recursion etc
length = new Func "length", Type.List, Type.Int
  .match "Nil", -> 0
  .match "Cell", ([_, tail]) -> 1 + length tail
  .ap

# ok, map is more complicated right away because it takes 2 parameters
map = new Func "map", Type.Function, Type.List, Type.List
  .match ["Function", "Nil"], -> Nil()
  .match ["Function", "Cell"], (f, [x, tail]) -> Cell [(f x), (map f, tail)]
  .ap


# Built in List type --------------------------------------------------------------
# type used to implement List behaviour using immutable JS Arrays as an underlying data representation
Type.new "JList", 1 
  .cons "JList", [Type.Array]

# function that builds a JList from a JS Array
# we don't want to expose JList constructor directly
# this function should be a primary way to construct the JList
# Eventually, has to handle typechecking and freezing - for now, simply boxes a given array
fromArray = new Func "fromArray", Type.Array, Type.JList
  .match "Array", (a) -> JList a
  .ap

head = new Func "head"
  .match "JList", ([l]) -> l[0]
  .ap

tail = new Func "tail", Type.JList, Type.JList
  .match "JList", ([l]) -> JList l.slice 1
  .ap


# tests
runTests = ->

  jl = fromArray [[1,2,3,4,5]]
  console.log show jl


#runTests()



# additional exports
root.Type = Type
root.Func = Func
root.show = show
root.Constructor = Constructor

#console.log root








