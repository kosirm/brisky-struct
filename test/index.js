'use strict'
const { create, set, get, struct, compute } = require('../')
const bstamp = require('brisky-stamp')

// const a = create(struct, {
//   on: {
//     data: {
//       a: () => console.log(' yes fire'),
//       x: (x) => console.log(' its x')
//     }
//   },
//   bla: true
// })

// // 1 mil sets 60ms
// console.log('go set!')
// const s = bstamp.create()
// set(a, 'bla', s)
// bstamp.close(s)

// // so only when new - need to handle change better
// console.log(' \ndont fire parent')
// const x = bstamp.create()
// // maybe this is even nice behaveiour? -- meh no
// set(a, { bla: 'bla' }, x)
// bstamp.close(x)

// set(a, { on: { data: { a: null, b: (b) => {} } } })
// console.log('remove a', a.on.data.fn.map(val => val.toString()), a.on.data.a)

// set(a, { on: { data: { b: (haha) => { console.log(' haha') } } } })
// console.log('replace b', a.on.data.fn.map(val => val.toString()), a.on.data.a)

// const aa = create(a, {
//   on: {
//     data: {
//       c: () => console.log(' yes fire') // copy works!
//     }
//   }
// })

// console.log('GO GO GO')
// set(aa, {
//   hello: 'x'
// }, 'x')

// const aaa = create(aa, {
//   on: {
//     data: {
//       x: null,
//       c: () => console.log(' yo fire!!! NEW') // copy works!
//     }
//   }
// })

// console.log('GO GO GO 2')
// set(aaa, {
//   xxx: 'z'
// }, 'x')

// console.log(' \nreplace MORE')
// set(aaa, {
//   on: {
//     data: {
//       b: () => console.log(' yo fire!!! B!') // copy works!
//     }
//   }
// }, 'x')

// console.log('GO GO GO 3')
// set(aaa, { y: 'zxxxx' }, 'x')


console.log('lets go types')

// reusing types
// recursive types

const x = create(struct, {
  props: { type: null }
  // type: 'xxxx'
})

const blurf = {
  types: {
    blurf: { text: 'XXX' }
  }
}

const instance = create(struct, {
  inject: blurf
})

console.log('------------------')
console.log('its gone')
const x2 = create(x, { type: 'blurf' }, void 0, instance)
console.log('------------------')

// console.log(compute(get(instance, [ 'x' ])))
// console.log(instance.x.inherits)
// console.log(compute(get(instance, [ 'x', 'text' ])))
// console.log(compute(get(instance, [ 'bla', 'bla', 'text' ])))
// console.log('GURK', compute(get(instance, [ 'bla', 'bla', 'gurk', 'text' ])))
// console.log(compute(get(instance, [ 'bla', 'bla', 'x', 'y' ])))
// console.log(instance.bla.bla.x.y)
// const bla = create(struct)
// console.log('empty', compute(bla))

// api get a gaurd ofc
console.log(get(x2, 'text'))

// console.log('NOTYPE.TYPE', get(instance, [ 'bla', 'x', 'type' ]))

// const b = create(struct, {
//   props: {
//     default: {
//       title: 'yo',
//       props: { default: 'self' }
//     }
//   }
// })

// const c = create(b, {
//   hello: {
//     title: 'x'
//   },
//   yo: true
// })

// console.log(compute(get(c.hello, 'title')))
// console.log(compute(get(c.yo, 'title')))
