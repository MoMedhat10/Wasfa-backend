import express  from "express"
import connectDB from "./config/db";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middlewares/error";
import cookieParser from "cookie-parser"
import cors from "cors"
import { logger } from "@middlewares/logger"
import authRoute from "@routes/auth.route"
import passwordRoute from "@routes/password.route"

dotenv.config();

const app = express();
const PORT  =   process.env.PORT || 3000;

connectDB();

// CORS policy
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use(express.json());
app.use(cookieParser());

app.use(logger);
app.use("/api/auth" , authRoute)
app.use("/api/password" , passwordRoute)

app.use(notFound)
app.use(errorHandler)



app.listen(PORT , () => {
    console.log(`Server is running at http://localhost:${PORT} on ${process.env.NODE_ENV} mode`);
});


