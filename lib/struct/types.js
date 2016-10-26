const { create } = require('../manipulate')

const def = t => t.props && t.props._struct || def(t.inherits)

exports.types = (t, val) => {
  if (!t.types) { t.types = {} }
  for (let key in val) {
    let prop = val[key]
    // and delete of course
    if (typeof prop === 'object' && prop.inherits) {
      t.types[key] = prop
    } else {
      t.types[key] = create(def(t), prop, void 0, t)
    }
  }
}

exports.type = (t, val) => {
  t.type = val
  console.log('when not of the same type remove it', t.key, val)
}

// no you can make you own which is shitty but fuck it
const getProp = t => t.props ? t.props.type : t.inherits && getProp(t.inherits)

// and lookup of course
const getType = (t, type, self) =>
  getProp(self) &&
  (
    t.types && t.types[type] ||
    t.inherits && getType(t.inherits, type) ||
    t.parent && getType(t.parent, type)
  )

exports.getType = getType