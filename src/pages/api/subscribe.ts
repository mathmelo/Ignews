import { query as q } from "faunadb"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { fauna } from "../../services/faunadb"
import { stripe } from "../../services/stripe"

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id: string
  }
}

const stripeSession = async (request: NextApiRequest, response: NextApiResponse) => {
  if(request.method === 'POST') {
    const session = await getSession({ req: request });

    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email
      })

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id;
    }


    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: process.env.PRICE_ID, quantity: 1 }	
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    });

    return response.status(200).json({ sessionId: checkoutSession.id });
  } else {
    response.setHeader('ALLOW', 'POST');
    response.status(404).end('Method not allowed');
  }
}

export default stripeSession;