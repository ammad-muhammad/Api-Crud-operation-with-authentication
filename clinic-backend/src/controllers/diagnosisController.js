const DiagnosisLog = require('../models/DiagnosisLog');
const Patient = require('../models/Patient');
const {
  checkSymptoms,
  detectRiskPatterns,
  FALLBACK_MESSAGE,
} = require('../services/aiService');

/**
 * POST /api/diagnosis/symptoms
 * Doctor (Pro): AI Symptom Checker – save result as DiagnosisLog.
 */
const aiSymptomCheck = async (req, res, next) => {
  try {
    const { patientId, symptoms, age, gender, history } = req.body;

    if (!patientId || !symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'patientId and symptoms[] are required.' });
    }

    // Get AI analysis
    const aiResult = await checkSymptoms(symptoms, age || 0, gender || 'unknown', history || '');

    // Save diagnosis log
    const diagnosisLog = await DiagnosisLog.create({
      doctorId: req.user._id,
      patientId,
      symptoms,
      additionalInfo: { age, gender, history },
      aiResponse: {
        possibleConditions: aiResult.data?.possibleConditions || [],
        riskLevel: aiResult.data?.riskLevel || 'low',
        suggestedTests: aiResult.data?.suggestedTests || [],
        advice: aiResult.data?.advice || '',
        rawResponse: JSON.stringify(aiResult.data),
      },
      riskLevel: aiResult.data?.riskLevel || 'low',
      isAiFallback: aiResult.isFallback,
    });

    const populated = await diagnosisLog.populate([
      { path: 'patientId', select: 'name age gender' },
      { path: 'doctorId', select: 'name specialization' },
    ]);

    return res.status(201).json({
      success: true,
      isFallback: aiResult.isFallback,
      message: aiResult.isFallback ? FALLBACK_MESSAGE : 'AI analysis complete.',
      diagnosisLog: populated,
      aiAnalysis: aiResult.data,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/diagnosis/logs
 * Doctor: their own diagnosis history.
 * Admin: all logs.
 */
const getDiagnosisLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, patientId, riskLevel } = req.query;
    const filter = {};

    if (req.user.role === 'doctor') filter.doctorId = req.user._id;
    if (patientId) filter.patientId = patientId;
    if (riskLevel) filter.riskLevel = riskLevel;

    const logs = await DiagnosisLog.find(filter)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await DiagnosisLog.countDocuments(filter);
    return res.json({ success: true, total, page: Number(page), logs });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/diagnosis/risk-patterns/:patientId
 * Doctor (Pro): Detect risk patterns from patient's diagnosis history.
 */
const detectPatientRiskPatterns = async (req, res, next) => {
  try {
    const diagnosisLogs = await DiagnosisLog.find({ patientId: req.params.patientId })
      .sort({ createdAt: -1 })
      .limit(20);

    const result = await detectRiskPatterns(diagnosisLogs);

    return res.json({
      success: true,
      isFallback: result.isFallback,
      totalLogsAnalyzed: diagnosisLogs.length,
      patterns: result.patterns || [],
      riskTrend: result.riskTrend || 'stable',
      summary: result.summary || FALLBACK_MESSAGE,
      recommendations: result.recommendations || [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/diagnosis/logs/:id
 */
const getDiagnosisLogById = async (req, res, next) => {
  try {
    const log = await DiagnosisLog.findById(req.params.id)
      .populate('patientId', 'name age gender medicalHistory')
      .populate('doctorId', 'name specialization');

    if (!log) return res.status(404).json({ success: false, message: 'Diagnosis log not found.' });
    return res.json({ success: true, log });
  } catch (err) {
    next(err);
  }
};

module.exports = { aiSymptomCheck, getDiagnosisLogs, detectPatientRiskPatterns, getDiagnosisLogById };
