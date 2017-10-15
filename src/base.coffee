import {Type, Constructor, Value, Func, Var, TypeVar} from './systemfj'

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
