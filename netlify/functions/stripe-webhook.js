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

  // Send welcome email using Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && session.customer_email) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          reply_to: 'blueowlcleaninguk@gmail.com',
          to: session.customer_email,
          subject: 'Welcome to CleanManager Pro',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to CleanManager Pro</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0A1F44; margin: 0;">🦉 Welcome to CleanManager Pro!</h1>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">Thank you for subscribing to CleanManager Pro! Your account has been successfully activated and your subscription is now active.</p>
              
              <div style="background: #FAF8F3; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C9A84C;">
                <h3 style="color: #0A1F44; margin-top: 0;">What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Log in to your dashboard at <a href="https://cleanmanager-pro.netlify.app" style="color: #1A5FA8;">cleanmanager-pro.netlify.app</a></li>
                  <li>Use your email address and the PIN sent during signup</li>
                  <li>Start adding your clients, jobs, and managing your cleaning business</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">If you have any questions or need help getting started, feel free to reply to this email or contact our support team.</p>
              
              <p style="font-size: 16px; margin-bottom: 30px;">We're excited to help you grow your cleaning business!</p>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px; margin: 0;">Best regards,<br>The CleanManager Pro Team</p>
              </div>
            </body>
            </html>
          `
        })
      });
      
      if (emailResponse.ok) {
        console.log('Welcome email sent successfully to:', session.customer_email);
      } else {
        console.error('Failed to send welcome email:', await emailResponse.text());
      }
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
    }
  } else {
    console.log('RESEND_API_KEY not set or no customer email in session');
  }

  // TODO: Update your database to activate the user's subscription
  // Example:
  // - Find user by session.customer_email
  // - Set their plan to 'pro' or 'business' based on the price
  // - Mark subscription as active
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
