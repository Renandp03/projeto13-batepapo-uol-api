import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { MongoClient, ObjectId } from "mongodb"

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;

const app = express()
app.use(express.json())
app.use(cors())


const PORT = 5000



try{
    await mongoClient.connect()
    db = mongoClient.db()
    console.log("Deu tudo certo")
}
catch{(err) => console.log(err)}






app.post("/participants",(req,res) => {

})

app.get("/participants",(req,res) => {
    
})

app.post("/messages",(req,res) => {
    
})

app.get("/messages",(req,res) => {

    db.collection("UOL").find().toArray().then((m) => {
        return res.send(m)
    })
    
})

app.post("/status",(req,res) => {

})


app.listen(PORT, () => console.log(`Rondando servidor na porta ${PORT}`))