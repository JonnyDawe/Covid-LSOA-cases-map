function handleError(fn) {
  return function (...params) {
    return fn(...params).catch(function (err) {
      console.error('oops', err)
    })
  }
}

export { handleError as handleError }
