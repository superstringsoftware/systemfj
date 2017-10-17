## Ok, one practical task that should test the limits of what's possible with this system:

Implement SAME generic List interface with 3 different underlying representations:

- Classic functional list (Cell a (List a) | Nil)
- Boxed JS Array, but need to check all elements are ONE type!!!
- Efficient numeric / byte vectors based on JS Typed Arrays

This will right away test Type Families / Type Classes in one combo (so we can simplify Haskell conventions here by using just one terminology) -
we need to have different internal data representations, different functions based on the type, and SAME function names, so interface.
Let's follow Haskell loosely:

https://hackage.haskell.org/package/base-4.10.0.0/docs/Prelude.html#g:13
