import mongoose from 'mongoose';
import { logger } from '../utils/logger.js'

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/ChatBox`)
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error(`Database connection if failed: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;