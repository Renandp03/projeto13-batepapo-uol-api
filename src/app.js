import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Joi from "joi"
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






app.post("/participants", async (req,res) => {

    const participant = req.body

    const participantSchema = Joi.object({
        name:Joi.string().required()
    })

    const validation = participantSchema.validate(participant)

    if(validation.error){
    
        const errors = validation.error.details.map((d) => d.message)
        
        return res.status(422).send(errors)
    }

    try{

     

    }
    catch{
        console.log("Algo deu errado")
    }



})

app.get("/participants",(req,res) => {
    
})

app.post("/messages",(req,res) => {
    
})

app.get("/messages", async (req,res) => {

   try{
       const messages =  await db.collection("UOL").find().toArray() 

       res.send(messages)
   }
   catch{
    res.send("algo deu errado")
   }
    
})

app.post("/status",(req,res) => {

})


app.listen(PORT, () => console.log(`Rondando servidor na porta ${PORT}`))