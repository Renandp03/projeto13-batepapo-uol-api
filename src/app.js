import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Joi from "joi"
import dayjs from "dayjs"
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

        const  participantExist = await db.collection('participants').findOne({name: participant.name})

        if(participantExist){return res.status(409).send("O participante já existe")}

        await db.collection("participants").insertOne({name:participant.name, lastStatus: Date.now()})

        res.sendStatus(201)

    }
    catch{
        console.log("Algo deu errado")
    }



})

app.get("/participants", async (req,res) => {

   

    try{
        const participants = await db.collection("participants").find().toArray()

        res.send(participants)
    }
    catch(error){res.status(400).send("algo deu errado")}
    
})

app.post("/messages", async (req,res) => {

    const { to, text, type } = req.body
    const { user } = req.headers
    const time = dayjs().format().substring(11,19)



    const participant = await db.collection("participants").findOne({name:user})

    if(!participant){return res.status(422).send("participante não existe")}

    const message = {from:user,to,text,type,time}
    const messageSchema = Joi.object({
        from:Joi.string().required(),
        to:Joi.string().required(),
        text:Joi.string().required(),
        type:Joi.allow("private_message").allow("message"),
        time:Joi.string().required()
    })

    const validation = messageSchema.validate(message,{ abortEarly: false })

    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message)

        return res.status(422).send(errors)
    }

    try{
        await db.collection("messages").insertOne(message)
        res.status(201).send("ok")

    }
    catch(error){
        res.send(error)
    }

    
})

app.get("/messages", async (req,res) => {

   try{
       const messages =  await db.collection("messages").find().toArray() 

       res.send(messages)
   }
   catch{
    res.send("algo deu errado")
   }
    
})

app.post("/status",(req,res) => {

})


app.listen(PORT, () => console.log(`Rondando servidor na porta ${PORT}`))