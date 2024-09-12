import { usersModel } from '../models/index.js';
import findByCellphoneAndUpdate from './users/findOneAndUpdate.js';

const checkMembership = async (from) => {
  const user = await findByCellphoneAndUpdate({ from })

  if (!!user) {
    return user
  } else {
    const newUser = await usersModel.create({
      cellphone: from
    })

    return newUser
  }
}

export { checkMembership }
