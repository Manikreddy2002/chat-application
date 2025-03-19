import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userroute from "./routes/userroute.js";

dotenv.config({});


const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000; 



app.use("/api/vi/user",userroute);

app.listen(PORT, ()=>{
    connectDB();
    console.log(`Server listen at port ${PORT}`);
})
 