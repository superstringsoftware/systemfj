map :: (a -> b) -> [a] -> [b]

-- map f xs is the list obtained by applying f to each element of xs, i.e.,

map f [x1, x2, ..., xn] == [f x1, f x2, ..., f xn]
map f [x1, x2, ...] == [f x1, f x2, ...]


(++) :: [a] -> [a] -> [a] infixr 5

-- Append two lists, i.e.,

[x1, ..., xm] ++ [y1, ..., yn] == [x1, ..., xm, y1, ..., yn]
[x1, ..., xm] ++ [y1, ...] == [x1, ..., xm, y1, ...]
-- If the first list is not finite, the result is the first list.

filter :: (a -> Bool) -> [a] -> [a]

-- filter, applied to a predicate and a list, returns the list of those elements that satisfy the predicate; i.e.,

filter p xs = [ x | x <- xs, p x]

head :: [a] -> a

--Extract the first element of a list, which must be non-empty.

last :: [a] -> a

--Extract the last element of a list, which must be finite and non-empty.

tail :: [a] -> [a]

--Extract the elements after the head of a list, which must be non-empty.

init :: [a] -> [a]

--Return all the elements of a list except the last one. The list must be non-empty.

null :: Foldable t => t a -> Bool

--Test whether the structure is empty. The default implementation is optimized for structures that are similar to cons-lists, because there is no general way to do better.

length :: Foldable t => t a -> Int

--Returns the size/length of a finite structure as an Int. The default implementation is optimized for structures that are similar to cons-lists, because there is no general way to do better.

(!!) :: [a] -> Int -> a infixl 9

--List index (subscript) operator, starting from 0. It is an instance of the more general genericIndex, which takes an index of any integral type.

reverse :: [a] -> [a]

--reverse xs returns the elements of xs in reverse order. xs must be finite.

--Special folds
and :: Foldable t => t Bool -> Bool

--and returns the conjunction of a container of Bools. For the result to be True, the container must be finite; False, however, results from a False value finitely far from the left end.

or :: Foldable t => t Bool -> Bool

--or returns the disjunction of a container of Bools. For the result to be False, the container must be finite; True, however, results from a True value finitely far from the left end.

any :: Foldable t => (a -> Bool) -> t a -> Bool

--Determines whether any element of the structure satisfies the predicate.

all :: Foldable t => (a -> Bool) -> t a -> Bool

--Determines whether all elements of the structure satisfy the predicate.

concat :: Foldable t => t [a] -> [a]

--The concatenation of all the elements of a container of lists.

concatMap :: Foldable t => (a -> [b]) -> t a -> [b]

--Map a function over all the elements of a container and concatenate the resulting lists.

--Building lists
--Scans
scanl :: (b -> a -> b) -> b -> [a] -> [b]

--scanl is similar to foldl, but returns a list of successive reduced values from the left:

scanl f z [x1, x2, ...] == [z, z `f` x1, (z `f` x1) `f` x2, ...]
--Note that

last (scanl f z xs) == foldl f z xs.
scanl1 :: (a -> a -> a) -> [a] -> [a]

--scanl1 is a variant of scanl that has no starting value argument:

scanl1 f [x1, x2, ...] == [x1, x1 `f` x2, ...]
scanr :: (a -> b -> b) -> b -> [a] -> [b]

scanr is the right-to-left dual of scanl. Note that

head (scanr f z xs) == foldr f z xs.
scanr1 :: (a -> a -> a) -> [a] -> [a]

scanr1 is a variant of scanr that has no starting value argument.

Infinite lists
iterate :: (a -> a) -> a -> [a]

iterate f x returns an infinite list of repeated applications of f to x:

iterate f x == [x, f x, f (f x), ...]
repeat :: a -> [a]

repeat x is an infinite list, with x the value of every element.

replicate :: Int -> a -> [a]

replicate n x is a list of length n with x the value of every element. It is an instance of the more general genericReplicate, in which n may be of any integral type.

cycle :: [a] -> [a]

cycle ties a finite list into a circular one, or equivalently, the infinite repetition of the original list. It is the identity on infinite lists.

Sublists
take :: Int -> [a] -> [a]

take n, applied to a list xs, returns the prefix of xs of length n, or xs itself if n > length xs:

take 5 "Hello World!" == "Hello"
take 3 [1,2,3,4,5] == [1,2,3]
take 3 [1,2] == [1,2]
take 3 [] == []
take (-1) [1,2] == []
take 0 [1,2] == []
It is an instance of the more general genericTake, in which n may be of any integral type.

drop :: Int -> [a] -> [a]

drop n xs returns the suffix of xs after the first n elements, or [] if n > length xs:

drop 6 "Hello World!" == "World!"
drop 3 [1,2,3,4,5] == [4,5]
drop 3 [1,2] == []
drop 3 [] == []
drop (-1) [1,2] == [1,2]
drop 0 [1,2] == [1,2]
It is an instance of the more general genericDrop, in which n may be of any integral type.

splitAt :: Int -> [a] -> ([a], [a])

splitAt n xs returns a tuple where first element is xs prefix of length n and second element is the remainder of the list:

splitAt 6 "Hello World!" == ("Hello ","World!")
splitAt 3 [1,2,3,4,5] == ([1,2,3],[4,5])
splitAt 1 [1,2,3] == ([1],[2,3])
splitAt 3 [1,2,3] == ([1,2,3],[])
splitAt 4 [1,2,3] == ([1,2,3],[])
splitAt 0 [1,2,3] == ([],[1,2,3])
splitAt (-1) [1,2,3] == ([],[1,2,3])
It is equivalent to (take n xs, drop n xs) when n is not _|_ (splitAt _|_ xs = _|_). splitAt is an instance of the more general genericSplitAt, in which n may be of any integral type.

takeWhile :: (a -> Bool) -> [a] -> [a]

takeWhile, applied to a predicate p and a list xs, returns the longest prefix (possibly empty) of xs of elements that satisfy p:

takeWhile (< 3) [1,2,3,4,1,2,3,4] == [1,2]
takeWhile (< 9) [1,2,3] == [1,2,3]
takeWhile (< 0) [1,2,3] == []
dropWhile :: (a -> Bool) -> [a] -> [a]

dropWhile p xs returns the suffix remaining after takeWhile p xs:

dropWhile (< 3) [1,2,3,4,5,1,2,3] == [3,4,5,1,2,3]
dropWhile (< 9) [1,2,3] == []
dropWhile (< 0) [1,2,3] == [1,2,3]
span :: (a -> Bool) -> [a] -> ([a], [a])

span, applied to a predicate p and a list xs, returns a tuple where first element is longest prefix (possibly empty) of xs of elements that satisfy p and second element is the remainder of the list:

span (< 3) [1,2,3,4,1,2,3,4] == ([1,2],[3,4,1,2,3,4])
span (< 9) [1,2,3] == ([1,2,3],[])
span (< 0) [1,2,3] == ([],[1,2,3])
span p xs is equivalent to (takeWhile p xs, dropWhile p xs)

break :: (a -> Bool) -> [a] -> ([a], [a])

break, applied to a predicate p and a list xs, returns a tuple where first element is longest prefix (possibly empty) of xs of elements that do not satisfy p and second element is the remainder of the list:

break (> 3) [1,2,3,4,1,2,3,4] == ([1,2,3],[4,1,2,3,4])
break (< 9) [1,2,3] == ([],[1,2,3])
break (> 9) [1,2,3] == ([1,2,3],[])
break p is equivalent to span (not . p).

Searching lists
notElem :: (Foldable t, Eq a) => a -> t a -> Bool infix 4

notElem is the negation of elem.

lookup :: Eq a => a -> [(a, b)] -> Maybe b

lookup key assocs looks up a key in an association list.

Zipping and unzipping lists
zip :: [a] -> [b] -> [(a, b)]

zip takes two lists and returns a list of corresponding pairs. If one input list is short, excess elements of the longer list are discarded.

zip is right-lazy:

zip [] _|_ = []
zip3 :: [a] -> [b] -> [c] -> [(a, b, c)]

zip3 takes three lists and returns a list of triples, analogous to zip.

zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]

zipWith generalises zip by zipping with the function given as the first argument, instead of a tupling function. For example, zipWith (+) is applied to two lists to produce the list of corresponding sums.

zipWith is right-lazy:

zipWith f [] _|_ = []
zipWith3 :: (a -> b -> c -> d) -> [a] -> [b] -> [c] -> [d]

The zipWith3 function takes a function which combines three elements, as well as three lists and returns a list of their point-wise combination, analogous to zipWith.

unzip :: [(a, b)] -> ([a], [b])

unzip transforms a list of pairs into a list of first components and a list of second components.

unzip3 :: [(a, b, c)] -> ([a], [b], [c])

The unzip3 function takes a list of triples and returns three lists, analogous to unzip.
