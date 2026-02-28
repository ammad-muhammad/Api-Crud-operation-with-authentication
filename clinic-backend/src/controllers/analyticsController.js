const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const DiagnosisLog = require('../models/DiagnosisLog');
const { generatePredictiveInsights } = require('../services/aiService');

/**
 * GET /api/analytics/admin
 * Full system analytics for admin.
 */
const getAdminAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Basic counts
    const [totalPatients, totalDoctors, totalReceptionists, totalAppointments, totalPrescriptions] =
      await Promise.all([
        Patient.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'doctor', isActive: true }),
        User.countDocuments({ role: 'receptionist', isActive: true }),
        Appointment.countDocuments(),
        Prescription.countDocuments(),
      ]);

    // Monthly appointments (last 6 months)
    const monthlyAppointments = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Appointment status breakdown
    const appointmentStatusBreakdown = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Most common diagnoses (from DiagnosisLog)
    const commonDiagnoses = await DiagnosisLog.aggregate([
      { $unwind: '$aiResponse.possibleConditions' },
      {
        $group: {
          _id: '$aiResponse.possibleConditions',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Risk level distribution
    const riskDistribution = await DiagnosisLog.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    // New patients per month (last 6 months)
    const monthlyNewPatients = await Patient.aggregate([
      {
        $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Subscription plan distribution
    const subscriptionStats = await User.aggregate([
      { $match: { role: { $in: ['doctor', 'receptionist'] } } },
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } },
    ]);

    // Simulated revenue (Pro plan × $49/mo)
    const proCount = subscriptionStats.find((s) => s._id === 'pro')?.count || 0;
    const simulatedMonthlyRevenue = proCount * 49;

    // Top doctors by appointment count
    const topDoctors = await Appointment.aggregate([
      { $group: { _id: '$doctorId', appointmentCount: { $sum: 1 } } },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: { path: '$doctor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          appointmentCount: 1,
          'doctor.name': 1,
          'doctor.specialization': 1,
        },
      },
    ]);

    return res.json({
      success: true,
      analytics: {
        overview: {
          totalPatients,
          totalDoctors,
          totalReceptionists,
          totalAppointments,
          totalPrescriptions,
          simulatedMonthlyRevenue,
          proSubscribers: proCount,
        },
        monthlyAppointments,
        monthlyNewPatients,
        appointmentStatusBreakdown,
        commonDiagnoses,
        riskDistribution,
        subscriptionStats,
        topDoctors,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/doctor
 * Doctor's personal analytics.
 */
const getDoctorAnalytics = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const now = new Date();

    // Today's appointments
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [todayAppointments, totalPrescriptions, totalDiagnoses] = await Promise.all([
      Appointment.countDocuments({
        doctorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      }),
      Prescription.countDocuments({ doctorId }),
      DiagnosisLog.countDocuments({ doctorId }),
    ]);

    // Monthly appointments (last 6 months)
    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          doctorId,
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Appointment status breakdown for this doctor
    const statusBreakdown = await Appointment.aggregate([
      { $match: { doctorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // My common diagnoses
    const myCommonDiagnoses = await DiagnosisLog.aggregate([
      { $match: { doctorId } },
      { $unwind: '$aiResponse.possibleConditions' },
      { $group: { _id: '$aiResponse.possibleConditions', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Recent high-risk diagnoses
    const recentHighRisk = await DiagnosisLog.find({
      doctorId,
      riskLevel: { $in: ['high', 'critical'] },
    })
      .populate('patientId', 'name age')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      analytics: {
        overview: { todayAppointments, totalPrescriptions, totalDiagnoses },
        monthlyStats,
        statusBreakdown,
        myCommonDiagnoses,
        recentHighRisk,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/predictive
 * Admin / Doctor (Pro): AI-powered predictive analytics.
 */
const getPredictiveAnalytics = async (req, res, next) => {
  try {
    const now = new Date();

    const [totalPatients, totalAppointments, monthlyData, riskData] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $match: { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      DiagnosisLog.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
      ]),
    ]);

    const analyticsData = { totalPatients, totalAppointments, monthlyData, riskData };
    const aiResult = await generatePredictiveInsights(analyticsData);

    return res.json({
      success: true,
      isFallback: aiResult.isFallback,
      analyticsData,
      predictiveInsights: aiResult.insights,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/patient
 */
const getPatientAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const PatientRecord = require('../models/Patient');
    const patient = await PatientRecord.findOne({ linkedUser: userId });

    if (!patient) {
      return res.json({
        success: true,
        analytics: {
          upcomingAppointments: 0,
          activePrescriptions: 0,
          totalVisits: 0
        }
      });
    }

    const [upcomingAppointments, activePrescriptions, totalVisits] = await Promise.all([
      Appointment.countDocuments({ patientId: patient._id, date: { $gte: new Date() }, status: { $ne: 'cancelled' } }),
      Prescription.countDocuments({ userId: req.user._id }), // Adjust based on how prescriptions are linked
      Appointment.countDocuments({ patientId: patient._id, status: 'completed' })
    ]);

    return res.json({
      success: true,
      analytics: {
        upcomingAppointments,
        activePrescriptions,
        totalVisits
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/receptionist
 */
const getReceptionistAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [todayAppointments, newPatients, totalAppointments] = await Promise.all([
      Appointment.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'cancelled' } }),
      Patient.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Appointment.countDocuments({ status: 'pending' })
    ]);

    return res.json({
      success: true,
      analytics: {
        todayAppointments,
        newPatients,
        totalAppointments
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getAdminAnalytics, 
  getDoctorAnalytics, 
  getPredictiveAnalytics,
  getPatientAnalytics,
  getReceptionistAnalytics
};
