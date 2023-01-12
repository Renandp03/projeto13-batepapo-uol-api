import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient } from "mongodb"

dotenv.config()

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017")
let db;

const app = express()
app.use(express.json())
app.use(cors())


const PORT = 5000




mongoClient.connect()
.then(() => {
    db = mongoClient.db("UOL")
    console.log("Deu tudo certo")
    
})
.catch((err)=>{
    console.log("Deu erro")
})




app.post("/participants",(req,res) => {

})

app.get("/participants",(req,res) => {
    
})

app.post("/messages",(req,res) => {
    
})

app.get("/messages",(req,res) => {
    db.collection("UOL").find().toArray().then((messages) => {
        console.log(messages)
    })
    
})

app.post("/status",(req,res) => {

})