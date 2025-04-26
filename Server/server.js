import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { logger } from './utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config({
    path: './.env'
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Middleware
app.use(express.static(path.join(__dirname, '../Client/public')));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
// Connect to MongoDB
connectDB()
    .then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`)
    })
    app.on('error', (err) => {
        logger.error(`Error: ${err}`)
        throw err
    })
    }).catch((err) => {
    logger.error(`Database connection is failed: ${err}`)
})

