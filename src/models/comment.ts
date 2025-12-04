import  { Document, Schema, model, Types } from "mongoose";
import { z } from "zod";


interface IComment extends Document {
    recipeId: Types.ObjectId;
    userId: Types.ObjectId;
    body: string;
    username: string;
}


const Comment = model<IComment>("Comment", new Schema<IComment>({
    recipeId: {
        type: Types.ObjectId,
        required: true,
        ref: "Recipe"
    },
    userId: {
        type: Types.ObjectId,
        required: true,
        ref: "User"
    },
    body: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    username: {
        type: String,
        required: true,
        trim: true,
    }
}, { timestamps: true }));



const commentSchema = z.object({
    body: z.string()
        .min(2, "Body must be at least 2 characters long")
        .trim(),
});


export const validateComment = (data: unknown) => {
    return commentSchema.safeParse(data);
}



export default Comment