const Patient = require('../models/Patient');

/**
 * POST /api/patients
 * Receptionist / Doctor / Admin: register a new patient.
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      name, age, gender, contact, bloodGroup,
      allergies, medicalHistory, linkedUser,
    } = req.body;

    const patient = await Patient.create({
      name, age, gender, contact: contact || {},
      bloodGroup: bloodGroup || '',
      allergies: allergies || [],
      medicalHistory: medicalHistory || [],
      linkedUser: linkedUser || null,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: 'Patient registered.', patient });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients
 * Role-aware list:
 * - Admin: all patients
 * - Doctor/Receptionist: patients they created or all (based on role)
 * - Patient: only their own linked record
 */
const getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { isActive: true };

    if (req.user.role === 'patient') {
      filter.linkedUser = req.user._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await Patient.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Patient.countDocuments(filter);
    return res.json({ success: true, total, page: Number(page), patients });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients/:id
 * Full patient detail with medical history.
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('medicalHistory.treatedBy', 'name specialization');

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    // Security: patients can only view their own linked record
    if (req.user.role === 'patient' && patient.linkedUser?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/patients/:id
 * Update patient details, add to medical history.
 */
const updatePatient = async (req, res, next) => {
  try {
    const allowed = ['name', 'age', 'gender', 'contact', 'bloodGroup', 'allergies', 'linkedUser'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Append to medical history if provided
    if (req.body.addHistory) {
      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        {
          $set: updates,
          $push: { medicalHistory: { ...req.body.addHistory, treatedBy: req.user._id } },
        },
        { new: true, runValidators: true }
      );
      if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
      return res.json({ success: true, message: 'Patient updated.', patient });
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    return res.json({ success: true, message: 'Patient updated.', patient });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/patients/:id  (soft delete)
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    return res.json({ success: true, message: 'Patient record deactivated.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPatient, getAllPatients, getPatientById, updatePatient, deletePatient };
