const Stripe = require('stripe');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Transaction = require('../models/Transaction');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Create Onboarding Link for Sellers (Express Accounts)
const createOnboardingLink = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let accountId = user.stripeAccountId;

    // Create a Stripe account if it doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      user.stripeAccountId = accountId;
      await user.save();
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile`,
      return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/payment/return`, 
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Stripe Onboarding Error:', error);
    res.status(500).json({ message: 'Failed to create onboarding link' });
  }
};

// 2. Create Checkout Session for Buyer
const createCheckoutSession = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const auction = await Auction.findById(auctionId).populate('seller');

    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Auction is already paid or processing' });
    }

    // Verify User is the Winner
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can pay for this auction' });
    }

    const amount = auction.startingBid;
    const platformFee = amount * 0.05; // 5% fee
    const sellerPayout = amount - platformFee;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(amount * 100), // convert to cents
            product_data: {
              name: auction.title,
              images: auction.imageUrls.slice(0, 1), 
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        description: `Payment for auction: ${auction.title}`,
      },
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&auction_id=${auctionId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/items/${auctionId}`,
    });

    // Save session ID to track later
    auction.paymentSessionId = session.id;
    await auction.save();

    // Create Transaction Record (Pending)
    await Transaction.create({
      auctionId: auction._id,
      buyerId: req.user.id,
      sellerId: auction.seller._id,
      amount: amount,
      platformFee: platformFee,
      sellerPayout: sellerPayout,
      stripeSessionId: session.id,
      status: 'pending'
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout Session Error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// 3. Confirm Delivery & Release Funds
const confirmDelivery = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const auction = await Auction.findById(auctionId).populate('seller');
    
    // Find associated transaction
    const transaction = await Transaction.findOne({ auctionId: auctionId });

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // Only buyer (winner) can confirm delivery
    if (auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (auction.paymentStatus !== 'payment_held') {
      return res.status(400).json({ message: 'Payment is not in held state' });
    }

    // Check if seller has a connected account
    const seller = auction.seller;
    if (!seller.stripeAccountId || !seller.stripeOnboardingComplete) {
      return res.status(400).json({ message: 'Seller is not connected to Stripe' });
    }

    // Amount to transfer (From Transaction record or calc on fly)
    // Using transaction record is safer if fees changed
    const transferAmount = transaction ? Math.round(transaction.sellerPayout * 100) : Math.round(auction.startingBid * 100 * 0.95);

    // Create a transfer to the seller
    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: 'usd',
      destination: seller.stripeAccountId,
      description: `Payout for auction: ${auction.title}`,
    });

    // Update Local Status
    auction.paymentStatus = 'completed';
    // auction.shipmentStatus = 'delivered'; // Wait, usually confirm means delivered. Yes.
    auction.shipmentStatus = 'delivered';
    await auction.save();

    // Update Transaction Status
    if (transaction) {
      transaction.status = 'released';
      await transaction.save();
    }

    res.json({ message: 'Funds released to seller', transferId: transfer.id });

  } catch (error) {
    console.error('Confirm Delivery Error:', error);
    res.status(500).json({ message: 'Failed to release funds' });
  }
};

// 4. Webhook to handle status updates
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log('Webhook event:', event.type);

  // Handle specific events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      const auction = await Auction.findOne({ paymentSessionId: session.id });
      if (auction) {
        auction.paymentStatus = 'payment_held';
        await auction.save();
      }

      // Update Transaction to 'held'
      const transaction = await Transaction.findOne({ stripeSessionId: session.id });
      if (transaction) {
        transaction.status = 'held';
        await transaction.save();
      }
      break;
    }

    case 'capability.updated': {
        const capability = event.data.object;
        if (capability.status === 'active' && capability.account) {
            const user = await User.findOne({ stripeAccountId: capability.account });
            if (user) {
                user.stripeOnboardingComplete = true;
                await user.save();
            }
        }
        break;
    }
    
    // Check for account.updated as well to be sure
    case 'account.updated': {
      const account = event.data.object;
      if (account.charges_enabled && account.payouts_enabled) {
          const user = await User.findOne({ stripeAccountId: account.id });
          if (user) {
              user.stripeOnboardingComplete = true;
              await user.save();
          }
      }
      break;
    }
  }

  res.json({ received: true });
};

module.exports = {
  createOnboardingLink,
  createCheckoutSession,
  confirmDelivery,
  handleWebhook
};
