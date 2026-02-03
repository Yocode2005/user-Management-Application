import express from "express"
const app = express()

//routes import
import userRouter from './routes/user.routes.js'



//routes declaration
app.use("/api/v1/users", userRouter) // http://localhost:8000/api/v1/users/register

export { app }