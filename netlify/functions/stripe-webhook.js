const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Webhook signature secret from Stripe dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    // Verify and construct the event using the raw body and signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // Handle different event types
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error(`Error processing webhook event: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};

/**
 * Handle checkout.session.completed event
 * Triggered when a customer completes checkout
 */
async function handleCheckoutSessionCompleted(session) {
  console.log(`Checkout session completed: ${session.id}`);
  console.log(`Customer: ${session.customer}`);
  console.log(`Subscription: ${session.subscription}`);

  // TODO: Update your database to activate the user's subscription
  // Example:
  // - Find user by session.customer_email
  // - Set their plan to 'pro' or 'business' based on the price
  // - Mark subscription as active
  // - Send confirmation email
}

/**
 * Handle invoice.payment_failed event
 * Triggered when a subscription payment fails
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log(`Payment failed for invoice: ${invoice.id}`);
  console.log(`Customer: ${invoice.customer}`);
  console.log(`Amount: ${invoice.amount_due}`);

  // TODO: Handle failed payment
  // Example:
  // - Send email to customer about failed payment
  // - Retry after N days
  // - Update account status if retry fails
  // - Offer to update payment method
}

/**
 * Handle customer.subscription.deleted event
 * Triggered when a subscription is cancelled/deleted
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`Subscription deleted: ${subscription.id}`);
  console.log(`Customer: ${subscription.customer}`);
  console.log(`Status: ${subscription.status}`);

  // TODO: Handle subscription cancellation
  // Example:
  // - Find user by subscription.customer_email
  // - Downgrade their plan back to 'free'
  // - Revoke paid features
  // - Send cancellation confirmation email
  // - Offer retention/win-back incentives
}
