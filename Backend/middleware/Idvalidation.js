import mongoose from 'mongoose';

export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Product ID is required' });
  }
  next();
};