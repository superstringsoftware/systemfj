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

# used for regular variables
class Var extends Variable
  constructor: (name, boundTo, type)->
    super name, boundTo
    @type = type
  type: -> @type # should return Type that our variable indexes - can be either TypeVar OR specific type
  bind: (val) -> throw "Var::bind() not implemented yet"

# class generating Product Type values (records)
# Should NOT be available to constuct publicly, only from inside of Type
class Constructor
  constructor: (@name, vars) ->
    @vars = []
    @vars = vars if vars?

  # internal method assigning a value to n-th variable, doing typechecking etc along the way
  _instantiate: (n, val) ->
  # same as above but instantiates type for n-th variable, needed to e.g. create Just Int from Just a
  _instantiateType: (n, type) ->

  # creates new value of the current type, typechecks etc
  new: (vals) ->

class Type
  # create a new type with name and type variables (no regular vars as no dependent types yet)
  # e.g. Maybe = new Type "Maybe a"
  constructor: (type, constructors...)->
    xs = type.split(' ');
    @name = xs[0]
    # creating TypeVars for each var name in the constructor
    @vars = (new TypeVar xs[i], -1 for i in [1...xs.length])
    @add cons for cons in constructors # adding constructors
    Type[@name] = this # adding this type to the list of all types

  # adding a new constructor to this type in the same format as Type constructor,
  # e.g. "Just a" or "MyPair Int Float"
  add: (cons) ->
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

    cons = new Constructor name, vars
    @[cons.name] = cons

# some built in types
tTOP = new Type "_TOP_" # top type of all types - for the future subtyping?
tBOTTOM = new Type "_BOTTOM_" # _|_ in Haskell
tEmpty = new Type "_EMPTY_" # () in Haskell
tUnit = new Type "_UNIT_", "Unit" # type with a single element

# primitive types (substituted into js types directly)
tInt = new Type "Int", "I#"
tFloat = new Type "Float", "F#"
tString = new Type "String", "S#"

# some standard types
tPair = new Type "Pair a b", "Pair a b"
tEither = new Type "Either a b", "Left a", "Right b"
tMaybe = new Type "Maybe a", "Just a", "Nothing"
tList = new Type "List a", "Cell a List", "Nil"

tPeano = new Type "Nat", "Z", "S Nat"

T = Type # alias for global types, so that we can write things like T.Int

# our functional function with pattern matching and type checking and polymorphism
class Function
  constructor: (@name) ->
    @functions = {}

  match: (consTag, func) ->
    @functions[consTag] = func

  # function application - think through
  ap: (vals) ->



# Some tests #################################################

#Maybe.add "Nothing"
#Maybe.add "Just a"
#tMaybe.add "Crazy Int"
#tMaybe.add "MoreCrazy Afasf"
tCustom = new Type "Custom", "Cons Int"

length = new Function "length"
length.match "Nil", -> 0
length.match "Cell", (x) -> 1 + length.ap (tail x)

#console.dir length
#console.dir Maybe, {depth: 4, colors: true}
#console.dir List, {depth: 4, colors: true}
console.dir Type, {depth: 5, colors: true}
