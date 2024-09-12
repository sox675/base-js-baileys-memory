import 'dotenv/config'

export const PORT = 3008
export const HOST = `http://localhost:${PORT}`
export const ASSISTANT_ID = process.env.ASSISTANT_ID ?? ''
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const MONGO_DB_URI = process.env.MONGO_DB_URI
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME