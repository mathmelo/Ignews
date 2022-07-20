import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";
;

export const config = {
  api: {
    bodyParser: false,
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

async function buffer(readable: Readable) {
  const chuncks = [];

  for await (const chunck of readable) {
    chuncks.push(
      typeof chunck === 'string' ? Buffer.from(chunck) : chunck
    );
  }

  return Buffer.concat(chuncks);
}

const webhooks = async (request: NextApiRequest, response: NextApiResponse) => {
  if(request.method === 'POST') {
    const buf = await buffer(request);
    const secret = request.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return response.status(400).send(`Webhooks error: ${err.message}`);
    }

    const { type } = event;

    if(relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;

            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false
            )
        
            break;
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session;

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break;
          default:
            throw new Error('Unhandled event');
        }
      } catch (err) {
        return response.json({ error: err });
      }
    }

    return response.json({ received: true });

  } else {
    response.setHeader('ALLOW', 'POST');
    response.status(404).end('Method not allowed');
  }
};

export default webhooks;