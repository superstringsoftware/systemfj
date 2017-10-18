root = require './systemfj'
# exporting everything from systemfj into global namespace
global[k] = root[k] for k of root

# Some tests #################################################

#console.log t for t in Type.showAllTypes()

#_id = new Func "id"

#console.log f1.show()
#console.dir Maybe, {depth: 4, colors: true}
#console.dir List, {depth: 4, colors: true}
#console.dir Type, {depth: 6, colors: true}


#t1 = T.Custom.Cons 2, "Hello"
#console.log t1.show()

#console.log T.List.constructors.Cell.show()
#console.log T.List.show()
