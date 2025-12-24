import dotenv from "dotenv";
dotenv.config();
import express from "express"
import connectDB from "./config/db";
import { errorHandler, notFound } from "./middlewares/error";
import cookieParser from "cookie-parser"
import cors from "cors"
import { logger } from "@middlewares/logger"


// routes
import authRoute from "@routes/auth.route"
import passwordRoute from "@routes/password.route"
import recipeRoute from "@routes/recipe.route"
import commentRoute from "@routes/comment.route"
import profileRoute from "@routes/profile.route"



const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// CORS policy
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

app.use(logger);
app.use("/api/auth", authRoute)
app.use("/api/password", passwordRoute)
app.use("/api/recipes", recipeRoute)
app.use("/api/comments", commentRoute)
app.use("/api/profile", profileRoute)


app.use(notFound)
app.use(errorHandler)



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT} on ${process.env.NODE_ENV} mode`);
});


