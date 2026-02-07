import { stripe } from "lib/stripe";
import Subscription from "models/subscription";
import User from "models/user";


export const getOrCreateStripeCustomer = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      userId: user._id.toString(),
    },
  });

  user.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
};





export const handleCheckoutCompleted = async (session: any) => {
  if (!session.subscription || !session.customer) return;

  const subscription =
    await stripe.subscriptions.retrieve(
      session.subscription
    );

  const userId = subscription.metadata.userId;

  if (!userId) return;

  const sub = await Subscription.create({
    user: userId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    status: subscription.status,
    currentPeriodStart: new Date(
      subscription.start_date * 1000
    ),
    currentPeriodEnd: new Date(
      subscription.ended_at! * 1000
    ),
    cancelAtPeriodEnd:
      subscription.cancel_at_period_end,
  });

  await User.findByIdAndUpdate(userId, {
    subscription: sub._id,
  });
};


export const handleSubscriptionUpdated = async (
  subscription: any
) => {
  await Subscription.findOneAndUpdate(
    {
      stripeSubscriptionId: subscription.id,
    },
    {
      status: subscription.status,
      currentPeriodStart: new Date(
        subscription.start_date * 1000
      ),
      currentPeriodEnd: new Date(
        subscription.ended_at! * 1000
      ),
      cancelAtPeriodEnd:
        subscription.cancel_at_period_end,
    }
  );
};


export const handleSubscriptionDeleted = async (subscription: any) => {
 const sub =  await Subscription.findOneAndUpdate(
    {
      stripeSubscriptionId: subscription.id,
    },
    {
      status: "canceled",
    }

  );
   
  await User.findByIdAndUpdate(sub?.user, { favoriteRecipes: [] });
  
};
