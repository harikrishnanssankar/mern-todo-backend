import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import todos from './routes/todos.js'
import signup from "./routes/signup.js"
import signin from "./routes/signin.js"

const app = express()

dotenv.config()

app.use(cors())
app.use(express.json())

app.use("/api/todos", todos )
app.use("/api/signup", signup)
app.use("/api/signin", signin)

app.get("/", (req, res) => {
    res.send("Hello World!")
})


const port = process.env.PORT || 5000
const connection_string = process.env.CONNECTION_STRING

app.listen(port, () => console.log(`server running on ${port}`))

mongoose.connect(connection_string,{
    useNewUrlParser: true,
    useUnifiedTopology:true
}).then(() => console.log('MDB connection established')).catch(error => console.log("mongo connection failed", error))