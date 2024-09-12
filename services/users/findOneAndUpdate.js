import { usersModel } from '../../models/index.js';
import dayjs from 'dayjs';

const findByCellphoneAndUpdate = async ({ from, params = {}, state = {}}) => {
  // const currentDate = new Date()
  const currentDate = dayjs().format()
  const newParams = {
    lastInteraction: currentDate,
    ...params
  }

  const user = await usersModel.findOneAndUpdate(
    { cellphone: from },
    newParams
  )

  if (Object.keys(state).length !== 0) await state.update({ currentUser: user })

  return user
}

export default findByCellphoneAndUpdate