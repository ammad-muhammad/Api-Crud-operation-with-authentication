/**
 * Subscription-based feature gating middleware.
 * Requires user to be on the "pro" plan to access the route.
 */
const requirePro = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  if (req.user.subscriptionPlan !== 'pro') {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a Pro subscription. Please upgrade your plan.',
      upgradeRequired: true,
      currentPlan: req.user.subscriptionPlan,
    });
  }

  next();
};

/**
 * Soft subscription check – attaches isPro flag, doesn't block.
 * Useful for routes that behave differently based on plan.
 */
const checkSubscription = (req, _res, next) => {
  req.isPro = req.user && req.user.subscriptionPlan === 'pro';
  next();
};

module.exports = { requirePro, checkSubscription };
