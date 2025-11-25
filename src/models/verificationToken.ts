import mongoose, { Document, Schema, Model, Types } from "mongoose";



interface IVerificationToken extends Document {
    userId: Types.ObjectId;
    token: string;
}




const VerificationTokenSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);



const VerificationToken: Model<IVerificationToken> =
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;