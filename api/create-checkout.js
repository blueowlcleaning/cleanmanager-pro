import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = req.body;
    console.log('Raw request body:', rawBody);

    let parsedBody;
    if (rawBody) {
      if (typeof rawBody === 'string') {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch (err) {
          console.warn('Failed to parse raw string body with JSON.parse:', err.message);
        }
      } else if (typeof rawBody === 'object') {
        try {
          parsedBody = JSON.parse(JSON.stringify(rawBody));
        } catch (err) {
          console.warn('Failed to parse stringified object body with JSON.parse:', err.message);
          parsedBody = rawBody;
        }
      }
    }

    if (!parsedBody) {
      parsedBody = rawBody ?? JSON.parse(await new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (err) {
            reject(err);
          }
        });

        req.on('error', reject);
      }));
    }

    const { priceId } = parsedBody;

    console.log('Received priceId:', priceId);
    console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 'undefined');

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
      success_url: 'https://cleanmanager-pro.vercel.app/?success=true',
      cancel_url: 'https://cleanmanager-pro.vercel.app/?cancelled=true',
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}

