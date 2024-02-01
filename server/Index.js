import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.get("/",(req,res)=>{
    res.status(200).json({message:"Ok"});
})

app.listen(process.env.PORT, () => {
  console.log(`Listening to the port ${process.env.PORT}`);
});
