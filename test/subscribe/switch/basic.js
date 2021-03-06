const test = require('tape')
const subsTest = require('../util')
const tree = require('../util/tree')

test('subscription - $switch - forceCompare', t => {
  const s = subsTest(t, {
    field: 'a',
    x: 100
  }, {
    field: {
      $switch: (t, subs, tree) => {
        if (t.compute() === 'a') {
          return { root: { x: { val: true } }, _: 'ha' }
        } else {
          return { root: { x: { val: true } }, _: 'bla' }
        }
      }
    }
  })
  s('initial subscription', [ { path: 'x', type: 'new' } ])
  s('initial subscription', [ { path: 'x', type: 'remove' }, { path: 'x', type: 'new' } ], { field: 'x' })
  t.end()
})

test('subscription - $switch - basic', t => {
  const s = subsTest(t, {
    collection: {
      a: {
        x: 'hello'
      },
      b: {
        c: 'bye',
        d: 'HA!'
      }
    },
    query: 'hello'
  }, {
    collection: {
      $any: {
        $switch: (t, subs, tree) => {
          return { x: { val: true } }
        },
        $switch2: {
          val: (t, subs, tree) => {
            const q = t.get('root').query.compute()
            if (q === t.get([ 'c', 'compute' ])) {
              return { c: { val: true }, d: { val: true } }
            } else if (q === 'unicorn') {
              return { root: { unicorn: { val: true } } }
            }
          },
          c: { val: true },
          root: {
            query: { val: true }
          }
        }
      }
    }
  })

  const result = s('initial subscription', [
    { path: 'collection/a/x', type: 'new' },
    { path: 'query', type: 'new' },
    { path: 'collection/b/c', type: 'new' },
    { path: 'query', type: 'new' }
  ])

  const start = tree(result.tree)

  s('update query', [
    { path: 'query', type: 'update' },
    { path: 'query', type: 'update' },
    { path: 'collection/b/c', type: 'new' },
    { path: 'collection/b/d', type: 'new' }
  ], { query: 'bye' })

  s('update query to unicorn', [
    { path: 'query', type: 'update' },
    { path: 'query', type: 'update' },
    { path: 'collection/b/c', type: 'remove' },
    { path: 'collection/b/d', type: 'remove' }
  ], { query: 'unicorn' })

  s('update unicorn', [
    { path: 'unicorn', type: 'new' },
    { path: 'unicorn', type: 'new' }
  ], { unicorn: '🦄' })

  s('update query', [
    { path: 'query', type: 'update' },
    { path: 'unicorn', type: 'remove' },
    { path: 'query', type: 'update' },
    { path: 'unicorn', type: 'remove' },
    { path: 'collection/b/c', type: 'new' },
    { path: 'collection/b/d', type: 'new' }
  ], { query: 'bye' })

  s('update query', [
    { path: 'query', type: 'update' },
    { path: 'query', type: 'update' },
    { path: 'collection/b/c', type: 'remove' },
    { path: 'collection/b/d', type: 'remove' }
  ], { query: 'blax' })

  t.same(start, tree(result.tree), 'equal to start tree (cleared composites')

  s('update collection/b/c', [
    { path: 'collection/b/c', type: 'update' },
    { path: 'collection/b/c', type: 'new' },
    { path: 'collection/b/d', type: 'new' }
  ], { collection: { b: { c: 'blax' } } })

  s('update collection/b/d', [
    { path: 'collection/b/d', type: 'update' }
  ], { collection: { b: { d: 'blurf' } } })

  s('remove collection/b', [
    { path: 'collection/b/c', type: 'remove' },
    { path: 'query', type: 'remove' },
    { path: 'collection/b/c', type: 'remove' },
    { path: 'collection/b/d', type: 'remove' }
  ], { collection: { b: null } })

  s('remove collection', [
   { path: 'collection/a/x', type: 'remove' },
   { path: 'query', type: 'remove' }
  ], { collection: null })

  t.same(tree(result.tree), {}, 'empty tree after removal')
  t.end()
})

test('subscription - $switch - nested', t => {
  const unicornSubs = { val: true, poops: { val: true } }
  const s = subsTest(t, {
    collection: {
      a: {
        val: 'hello',
        hello: 'hello',
        unicorn: 'not a unicorn'
      },
      b: {
        val: 'hello',
        hello: 'hello',
        unicorn: '🦄'
      },
      c: {
        val: 'hello',
        hello: 'hello',
        unicorn: 'horse'
      }
    },
    query: 'hello'
  }, {
    collection: {
      $any: {
        $switch: (t, subs, tree) => {
          if (t.val === 'unicorn') {
            return {
              hello: {
                parent: {
                  unicorn: {
                    $switch: t => {
                      if (t.val === '🦄') {
                        return unicornSubs // this is a bit shitty
                      } else if (t.val === 'horse') {
                        return {
                          root: { unicorn: { val: true } }
                        }
                      }
                    }
                  }
                }
              }
            }
          } else if (t.val === 'cat') {
            return {
              hello: {
                parent: {
                  unicorn: {
                    $switch: t => {
                      return {
                        parent: { val: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const result = s('initial subscription', [])
  const start = tree(result.tree)

  s('update collection/b', [ { path: 'collection/b/unicorn', type: 'new' } ], {
    collection: { b: 'unicorn' }
  })

  const inBetween = tree(result.tree)

  s('update collection/c', [], {
    collection: { c: 'unicorn' }
  })

  s('update unicorn', [ { path: 'unicorn', type: 'new' } ], { unicorn: '🦄' })

  s('update query', [ { path: 'unicorn', type: 'remove' } ], {
    collection: { c: 'no more unicorns' }
  })

  t.same(tree(result.tree), inBetween, 'removed root')

  s('update collection/b/unicorn/poops', [
    { path: 'collection/b/unicorn', type: 'update' },
    { path: 'collection/b/unicorn/poops', type: 'new' }
  ], {
    collection: { b: { unicorn: { poops: 'rainbows' } } }
  })

  s('change collection/b/unicorn', [
    { path: 'collection/b/unicorn', type: 'remove' },
    { path: 'collection/b/unicorn/poops', type: 'remove' }
  ], {
    collection: { b: 'cat' }
  })

  s('change collection/b/unicorn', [], {
    collection: { b: 'no more unicorns' }
  })

  t.same(tree(result.tree), start, 'restore composites')

  t.end()
})

test('subscription - $switch - driver', t => {
  var cnt = 0
  const s = subsTest(t, {
    field: 'a',
    x: 100
  }, {
    field: {
      $switch: {
        video: {
          val: 1
        },
        val: (t, subs, tree) => {
          cnt++
          // alo check PROPS -- needs to get excluded!
          if (t.compute() === 'a') {
            return { root: { x: { val: true } }, _: 'ha' }
          } else {
            return { root: { x: { val: true } }, _: 'bla' }
          }
        }
      }
    }
  })
  s('initial subscription', [])

  t.equal(cnt, 0)

  cnt = 0
  s('set video', [
   { path: 'field/video', type: 'new' },
   { path: 'x', type: 'new' }
  ], {
    field: {
      video: true
    }
  })
  t.equal(cnt, 1)

  cnt = 0
  s('update random field', [], {
    field: {
      video: {
        time: 'hello'
      }
    }
  })
  t.equal(cnt, 0)

  t.end()
})
