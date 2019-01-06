export function Deferred () {
  this.promise = new Promise((resolve, reject) => Object.assign(this, {resolve, reject}))
}
