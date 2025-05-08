import express from "express";
import { prismaClient } from "db";
import { GenerateImage, GenerateImagesFromPack, TrainModel } from "common/types";

const PORT = process.env.PORT || 8080;

const TEMP_USER_ID = "12345"; 

const app = express();
app.use(express.json());


// Training the model
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

        const data = await prismaClient.model.create({
            data:{
                name: parsedBody.data.name,
                age: parsedBody.data.age,
                bald: parsedBody.data.bald,
                type: parsedBody.data.type,
                eyeColor: parsedBody.data.eyeColor,
                ethnicity: parsedBody.data.ethinicity,
                userId: TEMP_USER_ID,
            }
        })

        res.status(200).json({
            data: data,
        })

    } catch (error) {
        console.error("Error in /ai/training:", error);
        res.status(500).json({
          message: "Training failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// Generating the image with the model
app.post("/ai/generate", async (req,res)=>{
    try {
        const parsedBody = GenerateImage.safeParse(req.body);
    
        if(!parsedBody.success){
            res.status(411).json({
                message: "Invalid request body",
                error : parsedBody.error,
            })
            return;
        }

        const data = await prismaClient.outputImages.create({
          data: {
            modelId: parsedBody.data.modelId,
            userId: TEMP_USER_ID,
            prompt: parsedBody.data.prompt,
            imageUrl: "",
          },
        });

        res.status(200).json({
            data:data,
            dataId : data.id,
        })
    } catch (error) {
        console.error("Error in /ai/generate:", error);
        res.status(500).json({
          message: "Image generation failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// Generating the bunch of images from the pack 
app.post("/pack/generate", async (req, res) => {
    try {
        const parsedBody = GenerateImagesFromPack.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(411).json({
                message: "Invalid request body",
                error: parsedBody.error,
            });
            return;
        }

        const prompts = await prismaClient.packPrompts.findMany({
            where: {
                packId: parsedBody.data.packId,
            }
        })

        const images = await prismaClient.outputImages.createManyAndReturn({
            data: prompts.map((prompt) => ({
                modelId: parsedBody.data.modelId,
                userId: TEMP_USER_ID,
                prompt: prompt.prompt,
                imageUrl: "",
            })),
        })

        res.json({
            images: images.map((images) => images.id)
        })

    } catch (error) {
        console.error("Error in /pack/generate:", error);
        res.status(500).json({
          message: "pack generation failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});


// Getting all the current packs 
app.get("/pack/bulk", async (req,res) => {
    try {
        const packs = await prismaClient.packs.findMany({});

        res.json({
          packs,
        });
        
    } catch (error) {
        console.error("Error in /pack/bulk:", error);
        res.status(500).json({
          message: "pack generation failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});


app.get("/image/bulk", async (req, res) => {
    try {
      const imageIds = req.query.images as string[]; // /image/bulk?images=img1&images=img2
      const offset = (req.query.offset as string) ?? 0;
      const limit = (req.query.limit as string) ?? 10;

//       http://localhost:8080/image/bulk?images=img1&images=img2&offset=20&limit=50
//       imageIds [ "img1", "img2" ]
//       offset 20
//       limit 50

      console.log("imageIds", imageIds);
      console.log("offset", offset);
      console.log("limit", limit);

      const imagesData = await prismaClient.outputImages.findMany({
        where: {
          id: { in: imageIds },
          userId: TEMP_USER_ID,
        },
        skip: parseInt(offset),
        take: parseInt(limit),
      });

      res.json({
        images: imagesData,
      });
    } catch (error) {
        console.error("Error in /image/bulk:", error);
        res.status(500).json({
          message: "pack generation failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

app.get("/", (req,res)=>{
    res.send("Hello from server");
})

app.listen(PORT, ()=>{
    console.log("server is running on port ->", PORT);
})