import { Document, Schema, model } from "mongoose";
import { z } from "zod";

interface IActivity extends Document {
    user: Schema.Types.ObjectId;
    action: string;
    details?: Record<string, any>;
    targetId?: Schema.Types.ObjectId;
    targetModel?: string;   // for optional population
}

const activitySchema = new Schema<IActivity>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        details: {
            type: Schema.Types.Mixed,
        },
        targetId: {
            type: Schema.Types.ObjectId,
        },
        targetModel: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

const Activity = model<IActivity>("Activity", activitySchema);


const activityZodSchema = z.object({
    user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ObjectId"),
    action: z.string().min(1).trim(),
    details: z.record(z.string(), z.any()).optional(),
    targetId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Target ObjectId").optional(),
    targetModel: z.string().optional(),
});

export const validateActivity = (data: unknown) => {
    return activityZodSchema.safeParse(data);
};

export default Activity;
