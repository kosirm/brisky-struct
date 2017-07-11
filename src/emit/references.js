import { getFn, getData } from '../get'
import subscription from './subscription'

// Fire emitters in context
// then clean the context
const fn = (t, val, stamp, c, cLevel) => {
  t._c = c
  t._cLevel = cLevel
  subscription(t, stamp)
  const emitter = getData(t)
  if (emitter) {
    const listeners = getFn(emitter)
    if (listeners) {
      let i = listeners.length
      while (i--) {
        listeners[i](val, stamp, t)
      }
    } else {
      emitter.listeners = []
    }
  }
  t._c = null
  t._cLevel = null
}

// Lookup until root of master
// to find a given ancestor
const isAncestor = (t, r, pc) => ((t === r && pc) || (
  t._p && isAncestor(t._p, r, pc + 1)
) || (
  t.inherits && isAncestor(t.inherits, r, pc)
))

// Get local root
const getRoot = (t) => {
  var root = t
  while (root._p) {
    root = root._p
  }
  return root
}

// Get local root and reversed path
const getRootPath = (t, path) => {
  var root = t
  while (root._p) {
    path.push(root.key)
    root = root._p
  }
  return root
}

// Iterate over given references list
// and fire emitters if conditions are met
const iterate = (refs, val, stamp, oRoot) => {
  var i = refs.length
  while (i--) {
    const rPath = []
    const rRoot = getRootPath(refs[i], rPath)
    const pc = isAncestor(oRoot.inherits, rRoot, 1)
    if (pc) {
      let c = oRoot
      let j = rPath.length - pc + 1
      let prev = c
      while (j--) {
        prev = c
        c = c[rPath[j]]
        if (c === void 0) {
          fn(refs[i], val, stamp, prev, j + 1)
          let localRefs = refs[i].emitters &&
            refs[i].emitters.data &&
            refs[i].emitters.data.struct
          if (localRefs) {
            iterate(localRefs, val, stamp, oRoot)
          }
          context(refs[i], val, stamp, oRoot)
          break
        }
      }
    }
  }
}

// When there's no local references
// there can be still inherited references
const context = (t, val, stamp, oRoot) => {
  if (t.inherits) {
    if (!oRoot) {
      oRoot = getRoot(t)
    }
    const contextRefs =
      t.inherits.emitters &&
      t.inherits.emitters.data &&
      t.inherits.emitters.data.struct
    if (contextRefs) {
      iterate(contextRefs, val, stamp, oRoot)
    }
    context(t.inherits, val, stamp, oRoot)
  }
}

export default context
