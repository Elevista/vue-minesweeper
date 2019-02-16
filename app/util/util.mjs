import _ from 'lodash'

export function sum (a, b) {
  return a + b
}

const lodash = _.runInContext()
export const lodashMixin = _(['pull', 'pullAll', 'pullAllBy', 'pullAllWith', 'pullAt', 'remove'])
  .map(fnName => {
    const fn = lodash[fnName]
    return [
      fnName,
      function (v, ...args) {
        const ret = fn(v, ...args)
        if (v instanceof Array) v.push()
        return ret
      }]
  })
  .fromPairs()
  .value()
