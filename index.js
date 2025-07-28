import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.routes.js'
import ticketRoutes from "./routes/ticket.routes.js"
import { serve } from 'inngest/express'
import { inngest } from './inngest/client.js';
import { signup } from './inngest/functions/signup.js'
import { onTicketCreated } from './inngest/functions/on-ticket-create.js'

import dotenv from "dotenv";
dotenv.config();


const PORT = process.env.PORT || 3000
const app = express()


app.use(cors())
app.use(express.json())
app.use('api/auth', userRoutes)
app.use('api/tickets', ticketRoutes)
app.use(
    "/api/inngest", serve({
        client: inngest,
        functions: [signup, onTicketCreated]
    })
)
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected Successfully")
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((err) => console.error("MongoDB error:", err))