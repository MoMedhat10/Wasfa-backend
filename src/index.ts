import express  from "express"
import connectDB from "./config/db";
import dotenv from "dotenv";
import { errorHandler, notFound } from "./middlewares/error";
import authRoute from "@routes/auth.route"

dotenv.config();

const app = express();
const PORT  =   process.env.PORT || 3000;

connectDB();


app.use(express.json());


app.use("/api/auth" , authRoute)


app.use(notFound)
app.use(errorHandler)



app.listen(PORT , () => {
    console.log(`Server is running at http://localhost:${PORT} on ${process.env.NODE_ENV} mode`);
});


