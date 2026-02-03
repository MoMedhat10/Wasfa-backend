import { stripe } from "lib/stripe";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getOrCreateStripeCustomer, handleCheckoutCompleted, handleSubscriptionDeleted, handleSubscriptionUpdated } from "@services/payments.service";



export const listStripePrices = async () => {
  return await stripe.prices.list({
    active: true,
  });
};



export const getPrices = async (req: Request, res: Response) => {
  const prices = await listStripePrices();
  res.json(prices);
};



export const createCheckoutSession = asyncHandler(async (req: Request<{}, {}, { priceId: string }>, res: Response) => {
  const { priceId } = req.body;

  if (!priceId) {
    res.status(400).json({
      message: "Price ID is required",
    });
    return;
  }

  const customerId = await getOrCreateStripeCustomer(req.user?._id.toString()!);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: "subscription",
    customer: customerId,


    metadata: {
      userId: req.user?._id.toString()!,
      priceId,
    },

    subscription_data: {
      metadata: {
        userId: req.user?._id.toString()!,
      },
    },

    success_url: `${process.env.CLIENT_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_DOMAIN}/cancel`,
  });



  res.json({
    url: session.url,
  });

});



export const createPortalSession = asyncHandler(async (req: Request, res: Response) => {
  const customerId = await getOrCreateStripeCustomer(req.user?._id.toString()!);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.CLIENT_DOMAIN}/`,
  });

  res.json({
    url: session.url,
  });
});


export const webhookHandler = async (
  req: Request,
  res: Response
) => {
  console.log("Webhook Received");
  const sig = req.headers["stripe-signature"];
  console.log("Signature:", sig ? "Present" : "Missing");
  console.log("Body Type:", typeof req.body);
  console.log("Is Buffer:", Buffer.isBuffer(req.body));

  if (!sig) {
    return res.status(400).send("Missing signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error`);
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
  }

  res.json({ received: true });
};