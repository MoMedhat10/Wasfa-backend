import { Schema, model, Types, Document } from "mongoose";



// write subscription interface for the model 
interface Subscription extends Document {
    user: Types.ObjectId;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}

const subscriptionSchema = new Schema<Subscription>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },

    stripePriceId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
      ],
      required: true,
    },

    currentPeriodStart: Date,
    currentPeriodEnd: Date,

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

 const Subscription = model(
  "Subscription",
  subscriptionSchema
);


export default Subscription
