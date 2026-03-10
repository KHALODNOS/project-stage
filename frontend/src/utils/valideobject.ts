import mongoose from 'mongoose';
export const validateObjectId = (id:string| undefined) => mongoose.Types.ObjectId.isValid(id? id:"");
