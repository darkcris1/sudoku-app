const isObj = (obj) => obj && obj.constructor === Object

function writable(initialState) {
  let state = initialState

  function cloneState(state) {
    if (Array.isArray(state)) return [...state]
    else if (isObj(state)) return { ...state }

    return state
  }
  if (initialState instanceof Function) {
    state = initialState()
  }

  const subscriber = []

  function subscribeAllFunction() {
    subscriber.forEach((fn) => fn(cloneState(state)))
  }

  return {
    set: (newState) => {
      state = cloneState(newState)
      subscribeAllFunction()
    },
    subscribe: (callback) => {
      subscriber.push(callback)
    },
    update: (callback) => {
      state = callback(cloneState(state))
      subscribeAllFunction()
    },
    get state() {
      return state
    },
    initialState: state,
  }
}

export default writable
