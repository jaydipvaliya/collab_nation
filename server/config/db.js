import mongoose from 'mongoose';

const connectDB = async () => {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Add it to server/.env before starting the API.');
  }

  try {
    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(MONGODB_URI);

    console.log(`MongoDB connected on ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

