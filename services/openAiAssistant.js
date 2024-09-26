import OpenAI from "openai"
import {
  ASSISTANT_ID,
  OPENAI_API_KEY
} from '../config/index.js'
import findByCellphoneAndUpdate from './users/findOneAndUpdate.js'

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const getOrCreateThread = async (openAiThreadId) => {
  if (!!openAiThreadId) {
    try {
      return await openai.beta.threads.retrieve(openAiThreadId)
    } catch (error) {
      console.error('Error retrieving thread:', error)
      // Si hay un error al recuperar el thread, crearemos uno nuevo
    }
  }

  return await openai.beta.threads.create()
}

const getThreadAndUser = async (from, openAiThreadId) => {
  const thread = await getOrCreateThread(openAiThreadId)
  const params = thread.id !== openAiThreadId ? { openAiThread: thread.id } : {}
  const user = await findByCellphoneAndUpdate({ from, params })

  return { user, thread }
}

const createMessage = async (threadId, body) => {
  await openai.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: body
    }
  );
}

const additionalInstructions = (user) => {
  return `It's important you have always present this information ${user}, this way you know the name of the person and additional information`
}

const assistantAsk = async (from, body, openAiThread) => {
  const { user, thread } = await getThreadAndUser(from, openAiThread)

  await createMessage(thread.id, body)

  let stream = await openai.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: ASSISTANT_ID,
      stream: true,
      additional_instructions: additionalInstructions(user),
      truncation_strategy: {
        "type": "last_messages",
        "last_messages": 100
      }
    }
  )

  for await (const eventData of stream) {
    const { event, data: { content } } = eventData

    if (event === 'thread.message.completed') {
      console.log(content)

      return content[0].text.value
    }
  }
}

export { assistantAsk }
