const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { priceId } = JSON.parse(event.body);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: 'https://cleanmanager-pro.netlify.app/?success=true',
    cancel_url: 'https://cleanmanager-pro.netlify.app/?cancelled=true',
  });
  return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
};
