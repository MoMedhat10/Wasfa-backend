import Subscription from "models/subscription";
import User from "models/user";


export const getUserPlan = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const subscription = await Subscription.findById(user.subscription);
    if (!subscription) {
        return "FREE";
    }

    if (subscription?.status === "active") {
        if (subscription.stripePriceId === process.env.STRIPE_BASIC_PLAN_PRICE_ID) {
            return "BASIC";
        }
        else if (subscription.stripePriceId === process.env.STRIPE_PRO_PLAN_PRICE_ID) {
            return "PRO";
        }
    }

    return "FREE";
}