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
import activityRoute from "@routes/activity.route"
import statsRoute from "@routes/stats.route"
import usersRoute from "@routes/users.route"
import paymentsRoute from "@routes/payments.route"



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
app.use("/api/activities", activityRoute)
app.use("/api/stats", statsRoute)
app.use("/api/users", usersRoute)
// write the link to paste in the browsers
// http://localhost:3000/api/payments/prices
app.use("/api/payments", paymentsRoute)

app.use(notFound)
app.use(errorHandler)



app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT} on ${process.env.NODE_ENV} mode`);
});


