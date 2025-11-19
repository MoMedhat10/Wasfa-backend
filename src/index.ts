import express , {Request , Response} from "express"




const app = express();
const PORT  = 3000;




app.use(express.json());


app.get("/" , (req : Request , res : Response) => {
    res.send("Hello World!22fsdfefcs1");
});


app.listen(PORT , () => {
    console.log(`Server is running at http://localhost:${PORT} on development mode`);
});


