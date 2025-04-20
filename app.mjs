import express from "express";
import cors from "cors";
import postRouter from "./routes/postRouter.mjs";
import morgan from "morgan";
import { connectDb } from "./utils/db.mjs";
 
const app = express();
const port = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
 
app.use("/posts", postRouter);
 
app.listen(port, async() => {
    try{
        await connectDb();
        console.log(`🚀 Server is running at ${port}`);
    } catch(err) {
        console.error('❌ Failed to connect to the database:', err);
    }
});