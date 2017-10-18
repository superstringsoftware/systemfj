chai = require 'chai'
chai.should()

root = require '../src/systemfj-v2'
show = root.show
Constructor = root.Constructor
Type = root.Type
length = root.length
map = root.map
#console.dir root

describe 'Creating some basic values', ->
  x1 = Just 17
  x2 = Just "Hello"
  x3 = Nothing()
  x4 = Pair ["Hello", 249]
  x5 = Right "hello"
  x6 = Left 3.1415
  after ->
    console.log "\n\nSome examples:"
    console.log "    " + show x1
    console.log "    " + show x2
    console.log "    " + show x3
    console.log "    " + show x4
    console.log "    " + show x5
    console.log "    " + show x6
  it 'should be a Tuple', ->
    x1[x1.length-1].should.equal Constructor.MAGIC
    x2[x2.length-1].should.equal Constructor.MAGIC
    
  it "should pretty print as 
    \n      Just 17 :: Maybe Int
    \n      Just 'Hello' :: Maybe String
    \n      Nothing :: Maybe a
    \n      Pair 'Hello' 249 :: Pair String Int
    \n      Right 'hello' :: Either a String
    \n      Left 3.1415 :: Either Float b", ->
    (show x1).should.equal 'Just 17 :: Maybe Int'
    (show x2).should.equal "Just 'Hello' :: Maybe String"
    (show x3).should.equal "Nothing :: Maybe a"
    (show x4).should.equal "Pair 'Hello' 249 :: Pair String Int"
    (show x5).should.equal "Right 'hello' :: Either a String"
    (show x6).should.equal "Left 3.1415 :: Either Float b"
  
describe "Functional Lists (List a = Cell a (List a) | Nil) and basic functions", ->
  l = [ (Cell [5, Nil()]), (Cell [3.141, Nil()]), (Cell ["Hello", Nil()]), Nil() ]
  after ->
    console.log "\n\nSome examples:"
    for lv in l
      console.log "    " + show lv
    l1 = Cell [1, Cell [2, l[0]] ]
    console.log "    " + show l1
    console.log "    length of prev list is: " + length l1
    l2 = map ((x)->x*2), l1
    console.log "    map *2 over prev list: " + show l2
    

 
  it "Should create basic cells (Int, Float, String) with correct types", ->
    (Type.getTypeName l[0]).should.equal "List Int"
    (Type.getTypeName l[1]).should.equal "List Float"
    (Type.getTypeName l[2]).should.equal "List String"
    (Type.getTypeName l[3]).should.equal "List a"

  it "Should throw type mismatch error if we try to construct a list from a Float and List Int", ->
    (-> Cell [3.141, l[0]]).should.Throw "Type mismatch"
  
  describe "Some basic functions on List a", ->
    l1 = Cell [1, Cell [2, l[0]] ]
    it "Should create longer lists with correct type", ->
      (Type.getTypeName l1).should.equal "List Int"

    it "length function should calculate length for empty and non-empty lists", ->
      (length l1).should.equal 3
      (length Nil()).should.equal 0

    it "map *2 over the list should produce correct results", ->
      l2 = map ((x)->x*2), l1
      l2.should.deep.equal (Cell [2, Cell [4, Cell [10, Nil()] ] ]) 
    
    
    
    #l2 = Cell [18, l1] 



