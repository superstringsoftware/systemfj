# Welcome to SystemFJ!

This is a very early experiment to implement some modern type-theory based types, type checking and inference engine for CoffeeScript (JavaScript works as well of course, but syntax looks much uglier - as you'd expect) as well as accompanying functional approach. It is a very much a work in progress, for now you are only interested in systemfj.coffee file, but even now you can do the following to wet your appetite a bit:

* Product and Sum Types
* Type functions (parametric types, such as `List a`)
* Pattern matched functions (including recursive)

Surprisingly, these 2 points already allow for quite a powerful foundation to start experimenting with types and pure functions. Roadmap for the rest of functionality, goals and ideas is after the quick example:

#### Peano numbers in Haskell:

```haskell
data Nat = Z | S Nat

toInt :: Nat -> Int
toInt Z = 0
toInt (S x) = 1 + toInt x

two = S (S Z)
toInt two -- = 2
```

#### SystemFJ:

```coffeescript
Nat = new Type "Nat", "Z", "S Nat"

toInt = new Func "toInt", Type.Nat, Type.Int
  .match "Z", -> 0
  .match "S", ([x]) -> 1 + toInt x
  .ap

two = S S Z()
toInt two # = 2
```

## Motivation
...is basically two-fold:
* Have a flexible framework for testing different type-theory related ideas and concepts, for instance what if we made Types first-class in the language? Or how about implementing proper dependent types? Etc.
* Have a *library-based* proper typing support in coffeescript / JavaScript vs using a number of very good functional languages that compile to javascript (Elm, Fay, Haskell itself). This idea was suggested in the research literature (*"types should be pluggable in a language"*), plus it makes it easier to mix-and-match existing huge JS / CS code base with good functional programming for practical purposes.
* Added bonus: once you have it as a library, implementing an easy to use "surface-language" (similar to coffeescript, or a coffeescript extension) with even nicer syntax that compiles into js is a no brainer.

"SystemFJ" name simply means "System F" in javascript, even though it's not really a System F but rather System F-omega, and eventually may include subtyping (it's already sort-of built-in to JS via object inheritance) plus dependent types, but we may as well call it something new :)

##### BEWARE: It's nowhere near production, but feel free to play around and share ideas / feedback
It's very much an experiment at this point, but we do plan to turn it into a useful library. Syntax will most likely change many times before that.

## Some more examples
#### Polymorphic parametric Lists
```haskell
-- haskell
data List a = Cell a (List a) | Nil

map :: (a -> b) -> List a -> List b
map _ Nil = Nil
map f (Cell x xs) = Cell (f x) (map f xs)
```

```coffeescript
# SystemFJ
List = new Type "List a", "Cell a List", "Nil"

# pattern matching is a bit cumbersome and raw with multiple argument functions that include functions...
# ..but still follows Haskell quite closely
map = new Func "map", Type.FUNCTION, Type.List, Type.List
  .match ["Function", "Nil"], -> Nil()
  .match ["Function", "Cell"], (f, [x, tail]) -> Cell (f x), (map f, tail)
  .ap
# pattern match here works via pointing out types of arguments ("Function" and "Cell") and then using destructuring assignments in the actual function call.
# tuples are implemented as simple js arrays, so [x, tail] matches 0th and 1st elements in the "Cell" constructor - giving us very haskell-like syntax

# then you can do:
list = Cell 1, (Cell 2, (Cell 3, Nil()))
console.log show map ((x)->x*2), list
# > Cell 2 (Cell 4 (Cell 6 Nil)) :: List
```

## Roadmap
* Better basic type-checking
* Cleaner separation of pure vs side-effect functions
* Haskell Typeclasses are the next big thing to turn SystemFJ into something powerful and useful, since it allows for some great ad-hoc polymorphism
* Records - also quite straightforward, more a question of syntax design
* GADTs / Type families are actually very easy to add in the current framework and will help avoid GADT / Type family / Functional dependency confusion in Haskell
* Major Performance Revision: turn type-checking into 2-staged dynamic check --> compilation erasing type info process that should influence performance a lot
* Potential better runtime representation of tuples and records (ArrayBuffers?)
* Inclusion of JavaScript classes as first-class in the type-checker
* Type-inference engine
* Lambda-calculus based function definition (parallel to reusing existing js functions as it works now)
