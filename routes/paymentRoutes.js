const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    createOnboardingLink, 
    createCheckoutSession, 
    handleWebhook,
    confirmDelivery
} = require('../controllers/paymentController');

// Seller onboarding
router.post('/create-onboarding-link', protect, createOnboardingLink);

// Buyer checkout
router.post('/create-checkout-session', protect, createCheckoutSession);

// Confirm delivery (release funds)
router.post('/confirm-delivery', protect, confirmDelivery);

// Webhook (no protect middleware, handled by Stripe signature)
// router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

module.exports = router;
