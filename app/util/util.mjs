import _ from 'lodash'

export function sum (a, b) {
  return a + b
}

let lodash = _.runInContext()
export let lodashMixin = _(['pull', 'pullAll', 'pullAllBy', 'pullAllWith', 'pullAt', 'remove'])
  .map(fnName => {
    let fn = lodash[fnName]
    return [
      fnName,
      function (v, ...args) {
        let ret = fn(v, ...args)
        if (v instanceof Array) v.push()
        return ret
      }]
  })
  .fromPairs()
  .value()
