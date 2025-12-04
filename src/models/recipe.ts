import { Document, Schema, model } from "mongoose";
import { z } from "zod";

type LevelType = "Easy" | "Intermediate" | "Hard"

interface IRecipe extends Document {
    name: string;
    image: {
        url: string,
        public_id: string
    }
    description: string;
    ingredients: string[];
    instructions: string[];
    rating: number,
    cookTime: number,
    servings: number,
    level: LevelType,
    premium: boolean,   
}



const RecipeMongooseSchema = new Schema<IRecipe>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 20,
        },
        image: {
            url: { type: String, required: true },
            public_id: { type: String, required: true },
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 100,
        },
        ingredients: { type: [String], required: true },
        instructions: { type: [String], required: true },
        rating: { type: Number, required: true },
        cookTime: { type: Number, required: true },
        servings: { type: Number, required: true },
        level: {
            type: String,
            enum: ["Easy", "Intermediate", "Hard"],
            required: true,
            default: "Easy",
        },
        premium: { type: Boolean, required: true, default: false },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);



RecipeMongooseSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "recipeId",
});


const Recipe = model<IRecipe>("Recipe", RecipeMongooseSchema);



const RecipeZodSchema = z.object({
    name: z.string()
        .min(2, "Username must be at least 2 characters long")
        .max(20, "Username cannot exceed 20 characters")
        .trim(),

    description: z.string()
        .min(5, "Description must be at least 5 characters long")
        .max(100, "Description cannot exceed 100 characters")
        .trim(),

    ingredients: z.array(z.string())
        .min(1, "Ingredients must contain at least one ingredient")
        .max(5, "Ingredients cannot exceed 5 ingredients"),

    instructions: z.array(z.string())
        .min(1, "Instructions must contain at least one instruction")
        .max(5, "Instructions cannot exceed 5 instructions"),

    
    rating: z.number()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),

    //!
    cookTime: z.number()
        .min(1, "Cook time must be at least 1 minute")
        .max(60, "Cook time cannot exceed 60 minutes"),

    servings: z.number()
        .min(1, "Servings must be at least 1")
        .max(10, "Servings cannot exceed 10"),

    level: z.enum(["Easy", "Intermediate", "Hard"])
        .default("Easy"),


});


const optionalRecipeSchema = RecipeZodSchema.partial();

export const validateRecipe = (data: unknown) => {
    return RecipeZodSchema.safeParse(data);
}

export const validateOptionalRecipe = (data: unknown) => {
    return optionalRecipeSchema.safeParse(data);
}



export default Recipe