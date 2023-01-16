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
        name:Joi.string().required().min(1)
    })

    const validation = participantSchema.validate(participant)

    if(validation.error){
    
        const errors = validation.error.details.map((d) => d.message)
        
        return res.status(422).send(errors)
    }

    try{

        const  participantExists = await db.collection('participants').findOne({name: participant.name})

        if(participantExists){return res.status(409).send("O participante já existe")}

        await db.collection("participants").insertOne({name:participant.name, lastStatus: Date.now()})

        await db.collection("messages").insertOne({from:participant.name,to:"Todos", text:"entra na sala...",type: "status", time:dayjs().format().substring(11,19)})

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

    const message = {to,text,type,time,from:user}
    const messageSchema = Joi.object({
        from:Joi.string().required().min(1),
        to:Joi.string().required().min(1),
        text:Joi.string().required().min(1),
        type:Joi.string().valid("message","private_message").required(),
        time:Joi.string().required()
    })

    const validation = messageSchema.validate({...message},{ abortEarly: false })

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

    const limit = Number(req.query.limit)
    const { user } = req.headers

    if(limit <= 0 || limit !== parseInt(limit)) return res.status(422).send("limite invalido")

    function select(message,user){
        if(message.to === user || message.type === "message" || message.from === user || message.type == "status"){
            return message
        }
    }

   try{
       const messages =  await db.collection("messages").find().toArray() 
       const filterMessages = [... messages].filter((m)=> select(m,user))

       if(limit) return res.send (filterMessages.slice(filterMessages.length -limit, filterMessages.length))

       res.send(filterMessages)
   }
   catch{
    res.send("algo deu errado")
   }
    
})


app.post("/status", async (req,res) => {

    const { user } = req.headers

    try{

        const participant = await db.collection("participants").findOne({name:user})
        
        if(!participant){return res.sendStatus(404)}

        await db.collection("participants").updateOne({name:user},{$set:{lastStatus:Date.now()}})

        res.sendStatus(200)


    }
    catch(error){
        console.log(error)
    }
})


const exit = async () =>{
    const now = Date.now()

    try{
        const participants = await db.collection("participants").find().toArray()

        await participants.map(
            (p) => {
                if((now - p.lastStatus) >= 10000){ 
                    db.collection("participants").deleteOne({_id:ObjectId(p._id)})

                    db.collection("messages").insertOne({from: p.name, to: "Todos", text: "sai da sala...", type: "status", time: dayjs().format().substring(11,19)})

                    }


            }
        )
    }
    catch(error){console.log(error)}
}

setInterval(exit, 15000)

app.listen(PORT, () => console.log(`Rondando servidor na porta ${PORT}`))