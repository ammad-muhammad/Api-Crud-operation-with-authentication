const Appointment = require('../models/Appointment');

/**
 * POST /api/appointments
 * Receptionist / Doctor / Patient: book appointment.
 */
const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason } = req.body;

    if (!patientId || !doctorId || !date) {
      return res.status(400).json({ success: false, message: 'patientId, doctorId, and date are required.' });
    }

    const appointment = await Appointment.create({
      patientId, doctorId, date: new Date(date),
      timeSlot: timeSlot || '',
      reason: reason || '',
      bookedBy: req.user._id,
      status: 'pending',
    });

    const populated = await appointment.populate([
      { path: 'patientId', select: 'name age gender' },
      { path: 'doctorId', select: 'name specialization' },
    ]);

    return res.status(201).json({ success: true, message: 'Appointment booked.', appointment: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments
 * Role-aware filtering:
 * - Admin: all appointments
 * - Doctor: their appointments
 * - Receptionist: all appointments
 * - Patient: appointments for their linked patient records
 */
const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, date } = req.query;
    const filter = {};

    if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    } else if (req.user.role === 'patient') {
      // Find the patient record linked to this user account
      const Patient = require('../models/Patient');
      const patient = await Patient.findOne({ linkedUser: req.user._id });
      if (patient) {
        filter.patientId = patient._id;
      } else {
        // If no linked patient record, return empty set
        return res.json({ success: true, total: 0, page: Number(page), appointments: [] });
      }
    }

    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId', 'name specialization')
      .populate('bookedBy', 'name role')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);
    return res.json({ success: true, total, page: Number(page), appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name age gender contact bloodGroup medicalHistory')
      .populate('doctorId', 'name specialization');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    return res.json({ success: true, appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/appointments/:id
 * Update status, notes, timeSlot.
 */
const updateAppointment = async (req, res, next) => {
  try {
    const { status, notes, timeSlot, date } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (timeSlot) updates.timeSlot = timeSlot;
    if (date) updates.date = new Date(date);

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true,
    }).populate('patientId', 'name age').populate('doctorId', 'name specialization');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    return res.json({ success: true, message: 'Appointment updated.', appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/appointments/:id – cancel
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    return res.json({ success: true, message: 'Appointment cancelled.', appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/today – today's schedule for doctor/receptionist
 */
const getTodayAppointments = async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filter = {
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' },
    };
    if (req.user.role === 'doctor') filter.doctorId = req.user._id;

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact')
      .populate('doctorId', 'name specialization')
      .sort({ timeSlot: 1 });

    return res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointment, cancelAppointment, getTodayAppointments,
};
