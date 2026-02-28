const User = require('../models/User');

/**
 * GET /api/users
 * Admin: list all staff (not patients).
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    else filter.role = { $in: ['admin', 'doctor', 'receptionist'] };

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    return res.json({ success: true, total, page: Number(page), users });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/doctors
 * Any authenticated user: list active doctors (for appointment booking).
 */
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name email specialization createdAt');
    return res.json({ success: true, doctors });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users
 * Admin: create doctor or receptionist.
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, specialization, subscriptionPlan } = req.body;

    if (!['doctor', 'receptionist', 'patient'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Admin can only create: doctor, receptionist, patient accounts.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    const user = await User.create({
      name, email, password, role, specialization: specialization || '',
      subscriptionPlan: subscriptionPlan || 'free',
    });

    const safe = user.toObject();
    delete safe.password;
    return res.status(201).json({ success: true, message: 'User created successfully.', user: safe });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 * Admin: update user info, role, subscription plan.
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, role, specialization, subscriptionPlan, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (specialization !== undefined) updates.specialization = specialization;
    if (subscriptionPlan !== undefined) updates.subscriptionPlan = subscriptionPlan;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User updated.', user });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Admin: soft-delete (deactivate) a user.
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'User deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id/subscription
 * Admin: change subscription plan.
 */
const updateSubscription = async (req, res, next) => {
  try {
    const { subscriptionPlan } = req.body;
    if (!['free', 'pro'].includes(subscriptionPlan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Use: free | pro' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionPlan },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: `Subscription updated to ${subscriptionPlan}.`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getDoctors, createUser, getUserById, updateUser, deleteUser, updateSubscription };
