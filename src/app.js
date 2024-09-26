import 'dotenv/config'
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MongoAdapter as Database } from '@builderbot/database-mongo'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { PORT, MONGO_DB_NAME, MONGO_DB_URI } from '../config/index.js'
import { typing, recording } from "../services/presence.js";
import { assistantAsk } from '../services/openAiAssistant.js'
import { checkMembership } from '../services/checkMembership.js'
import { createMessageQueue } from '../services/fast-entires.js';
import dbConnect from '../config/db.js'

const queueConfig = { gapSeconds: 2000 }; // miliseconds
const enqueueMessage = createMessageQueue(queueConfig);

dbConnect()

const mainflow = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic, state, provider }) => {
    enqueueMessage(ctx.body, async (body) => {
      const user = await checkMembership(ctx.from)
      console.log('USER ****', user)
      const { openAiThread } = user

      await typing(ctx, provider)

      const message = await assistantAsk(ctx.from, body, openAiThread)
      const chunks = message.split(/\n\n+/);

      for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim() }]);
      }
    })
  })

const main = async () => {
    const adapterFlow = createFlow([mainflow])
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database({
      dbUri: MONGO_DB_URI,
      dbName: MONGO_DB_NAME,
    })

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    // adapterProvider.server.post(
    //     '/v1/messages',
    //     handleCtx(async (bot, req, res) => {
    //         const { number, message, urlMedia } = req.body
    //         await bot.sendMessage(number, message, { media: urlMedia ?? null })
    //         return res.end('sended')
    //     })
    // )

    // adapterProvider.server.post(
    //     '/v1/register',
    //     handleCtx(async (bot, req, res) => {
    //         const { number, name } = req.body
    //         await bot.dispatch('REGISTER_FLOW', { from: number, name })
    //         return res.end('trigger')
    //     })
    // )

    // adapterProvider.server.post(
    //     '/v1/samples',
    //     handleCtx(async (bot, req, res) => {
    //         const { number, name } = req.body
    //         await bot.dispatch('SAMPLES', { from: number, name })
    //         return res.end('trigger')
    //     })
    // )

    // adapterProvider.server.post(
    //     '/v1/blacklist',
    //     handleCtx(async (bot, req, res) => {
    //         const { number, intent } = req.body
    //         if (intent === 'remove') bot.blacklist.remove(number)
    //         if (intent === 'add') bot.blacklist.add(number)

    //         res.writeHead(200, { 'Content-Type': 'application/json' })
    //         return res.end(JSON.stringify({ status: 'ok', number, intent }))
    //     })
    // )

    httpServer(+PORT)
}

main()
