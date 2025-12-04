import { Document, Schema, model, Types } from "mongoose";
import { z } from "zod";

export interface IComment extends Document {
  recipeId: Types.ObjectId;
  userId: Types.ObjectId;
  body: string;
  username: string;
}

const CommentSchema = new Schema<IComment>(
  {
    recipeId: {
      type: Types.ObjectId,
      required: true,
      ref: "Recipe",
    },
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * Automatically format JSON response:
 * - rename recipeId → recipe
 * - rename userId → user
 * - replace _id with id
 * - remove __v
 */
CommentSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
   
    ret.recipe = ret.recipeId;
    ret.user = ret.userId;

    delete ret.recipeId;
    delete ret.userId;
    return ret;
  },
});

const Comment = model<IComment>("Comment", CommentSchema);

const commentSchema = z.object({
  body: z.string().min(2, "Body must be at least 2 characters long").trim(),
});


const commentOptionalSchema = commentSchema.partial();

export const validateComment = (data: unknown) => {
  return commentSchema.safeParse(data);
};

export const validateOptionalComment = (data: unknown) => {
  return commentOptionalSchema.safeParse(data);
};

export default Comment;
