function createInitialState() {
  return {
    queue: [],
    timer: null,
    callback: null
  }
}

function resetTimer(state) {
  if (state.timer) {
    clearTimeout(state.timer)
  }
  return { ...state, timer: null }
}

function processQueue(state) {
  const result = state.queue.map(message => message.text).join(" ")
  console.log("Accumulated messages:", result)

  const newState = {
    ...state,
    queue: [],
    timer: null
  }

  return [result, newState]
}

function createMessageQueue(config) {
  let state = createInitialState()

  return function enqueueMessage(messageText, callback) {
    console.log("Enqueueing:", messageText)

    state = resetTimer(state)
    state.queue.push({ text: messageText, timestamp: Date.now() })
    state.callback = callback

    state.timer = setTimeout(() => {
      const [result, newState] = processQueue(state)
      state = newState
      if (state.callback) {
        state.callback(result)
        state.callback = null
      }
    }, config.gapSeconds)
  }
}

export { createMessageQueue }
