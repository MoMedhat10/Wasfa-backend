import { stripe } from "lib/stripe";
import { Request, Response } from "express";

export const listStripePrices = async () => {
    return await stripe.prices.list({
        active: true,
    });
};



export const getPrices = async (req: Request,res: Response) => {
    const prices = await listStripePrices();
    res.json(prices);
};

