import express from "express";

const PORT = process.env.PORT || 8080;

const app = express();

app.get("/", (req,res)=>{
    res.send("Hello from server");
})

app.listen(PORT, ()=>{
    console.log("server is running on port ->", PORT);
})