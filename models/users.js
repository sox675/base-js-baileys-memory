import mongoose from "mongoose";

const currentDate = new Date()

const UserScheme = new mongoose.Schema(
  {
    name: {
      type: String
    },
    cellphone: {
      type: String,
      unique: true
    },
    lastInteraction: {
      type: Date,
      default: currentDate
    },
    openAiThread: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default mongoose.model("users", UserScheme)
