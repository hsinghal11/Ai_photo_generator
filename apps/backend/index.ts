import express from "express";
import { prismaClient } from "db";
import { GenerateImage, GenerateImagesFromPack, TrainModel } from "common/types";

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());

app.post("/ai/training", async (req,res) =>{
    try {
        const parsedBody = TrainModel.safeParse(req.body);
        if(!parsedBody.success){
            res.status(411).json({
                message: "Invalid request body",
                error : parsedBody.error,
            })
            return;
        }

        await prismaClient.model.create({
            data:{
                name: parsedBody.data.name,
                age: parsedBody.data.age,
                bald: parsedBody.data.bald,
                type: parsedBody.data.type,
                eyeColor: parsedBody.data.eyeColor,
                ethnicity: parsedBody.data.ethinicity,
            }
        })
    } catch (err) {
        
    }
})


app.get("/", (req,res)=>{
    res.send("Hello from server");
})

app.listen(PORT, ()=>{
    console.log("server is running on port ->", PORT);
})