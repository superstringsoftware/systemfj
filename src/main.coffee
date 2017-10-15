import {Type, Constructor, Value, Func, Var, TypeVar} from './systemfj'
import {S, Z} from './base'

# Some tests #################################################
T = Type
tCustom = new Type "Custom", "Cons Float String"

console.log t for t in Type.showAllTypes()

length = new Func "length"
length.match "Nil", -> 0
length.match "Cell", (x) -> 1 + length.ap (tail x)



#_id = new Func "id"

#console.log f1.show()
#console.dir Maybe, {depth: 4, colors: true}
#console.dir List, {depth: 4, colors: true}
#console.dir Type, {depth: 6, colors: true}


t1 = T.Custom.Cons 2, "Hello"
console.log t1.show()

#console.log T.List.constructors.Cell.show()
#console.log T.List.show()
