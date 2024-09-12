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
  return `It's important you have always present this information ${user}, this way you know the name of the student, the english level, etc`
}

const assistantAsk = async (from, body, openAiThread) => {
  const { user, thread } = await getThreadAndUser(from, openAiThread)

  await createMessage(thread.id, body)

  let run = await openai.beta.threads.runs.createAndPoll(
    thread.id,
    {
      assistant_id: ASSISTANT_ID,
      // additional_instructions: additionalInstructions(user),
      truncation_strategy: {
        "type": "last_messages",
        "last_messages": 100
      }
    }
  );

  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
      run.thread_id
    );

    const allMessages = messages.data.reverse()
    const lastMessage = allMessages.at(-1)

    return lastMessage.content[0].text.value
  } else {
    console.log(run.status);
  }
}

export { assistantAsk }
