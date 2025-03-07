import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import profileRouter from './routes/profileRoutes.js'

dotenv.config();
connectDB()

const app = express()
const port = process.env.PORT || 9000

app.use(bodyParser.json());
app.use(cors())


app.use('/api/', authRoutes)
app.use('/api', userRoutes)
app.use('/api/profile', profileRouter)

app.listen(port ,() => {
    console.log(`Server is up and running at http://localhost:${port}`);
})
