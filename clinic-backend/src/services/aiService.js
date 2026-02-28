const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (e) {
  console.warn('⚠ Gemini client could not be initialized. AI features will use fallback mode.');
}

const FALLBACK_MESSAGE = 'AI service temporarily unavailable. Core system remains functional.';

/**
 * Generic Gemini call wrapper with graceful fallback.
 */
const callGemini = async (prompt) => {
  if (!genAI || !process.env.GEMINI_API_KEY) {
    throw new Error(FALLBACK_MESSAGE);
  }
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * AI Feature 1 – Smart Symptom Checker
 * @param {string[]} symptoms - List of symptoms
 * @param {number} age
 * @param {string} gender
 * @param {string} history - Past medical history
 */
const checkSymptoms = async (symptoms, age, gender, history = '') => {
  try {
    const prompt = `
You are an expert medical AI assistant helping doctors with preliminary diagnosis support.
Patient Information:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms.join(', ')}
- Medical History: ${history || 'None provided'}

Provide a structured medical analysis in the following JSON format only (no markdown):
{
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "riskLevel": "low|medium|high|critical",
  "suggestedTests": ["test1", "test2"],
  "suggestedMedicines": [
    { "name": "medicine name", "dosage": "dosage", "reason": "why suggested" }
  ],
  "advice": "Brief clinical advice for the doctor",
  "urgency": "Brief note on urgency level"
}

Important: This is for doctor reference only, not direct patient advice. Be medically accurate.`;

    const rawText = await callGemini(prompt);

    // Try to parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        isFallback: false,
        data: {
          possibleConditions: parsed.possibleConditions || [],
          riskLevel: parsed.riskLevel || 'low',
          suggestedTests: parsed.suggestedTests || [],
          suggestedMedicines: parsed.suggestedMedicines || [],
          advice: parsed.advice || '',
          urgency: parsed.urgency || '',
        },
      };
    }

    // If not JSON, return as plain text
    return {
      success: true,
      isFallback: false,
      data: {
        possibleConditions: [],
        riskLevel: 'low',
        suggestedTests: [],
        suggestedMedicines: [],
        advice: rawText,
        urgency: '',
      },
    };
  } catch (err) {
    console.error('AI Symptom Checker Error:', err.message);
    return {
      success: false,
      isFallback: true,
      message: FALLBACK_MESSAGE,
      data: {
        possibleConditions: [],
        riskLevel: 'low',
        suggestedTests: [],
        advice: FALLBACK_MESSAGE,
        urgency: '',
      },
    };
  }
};

/**
 * AI Feature 2 – Prescription Explanation (patient-friendly)
 * @param {object[]} medicines - Array of medicine objects
 * @param {string} notes - Doctor notes
 * @param {string} diagnosis
 * @param {boolean} urduMode - Generate Urdu explanation if true
 */
const explainPrescription = async (medicines, notes = '', diagnosis = '', urduMode = false) => {
  try {
    const medicineList = medicines.map(
      (m) => `${m.name} - ${m.dosage}, ${m.frequency}${m.duration ? ', for ' + m.duration : ''}`
    ).join('\n');

    const language = urduMode ? 'Urdu' : 'simple English';

    const prompt = `
You are a medical AI that explains prescriptions to patients in simple, non-technical language.
Diagnosis: ${diagnosis || 'Not specified'}
Medicines prescribed:
${medicineList}
Doctor's notes: ${notes || 'None'}

Provide a patient-friendly explanation in ${language} covering:
1. What each medicine does (simple terms)
2. How to take them correctly
3. Lifestyle advice during treatment
4. Preventive advice to avoid recurrence
5. Warning signs to watch for

Keep tone warm, reassuring, and easy to understand for a non-medical person.`;

    const explanation = await callGemini(prompt);
    return { success: true, isFallback: false, explanation };
  } catch (err) {
    console.error('AI Prescription Explanation Error:', err.message);
    return { success: false, isFallback: true, explanation: FALLBACK_MESSAGE };
  }
};

/**
 * AI Feature 3 – Risk Pattern Detection
 * @param {object[]} diagnosisLogs - Array of past diagnosis logs
 */
const detectRiskPatterns = async (diagnosisLogs) => {
  try {
    if (!diagnosisLogs || diagnosisLogs.length === 0) {
      return { success: true, isFallback: false, patterns: [], summary: 'No diagnosis history available.' };
    }

    const logsText = diagnosisLogs.map((log, i) =>
      `Visit ${i + 1} (${new Date(log.createdAt).toLocaleDateString()}): Symptoms: ${log.symptoms.join(', ')}, Risk: ${log.riskLevel}`
    ).join('\n');

    const prompt = `
You are a medical AI analyzing a patient's diagnosis history for risk patterns.
Diagnosis History:
${logsText}

Analyze and identify:
1. Repeated infections or recurring conditions
2. Escalating risk levels
3. High-risk symptom combinations
4. Chronic condition indicators

Respond in JSON format only:
{
  "patterns": ["pattern1", "pattern2"],
  "riskTrend": "improving|stable|worsening",
  "summary": "Brief clinical summary",
  "recommendations": ["rec1", "rec2"]
}`;

    const rawText = await callGemini(prompt);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { success: true, isFallback: false, ...parsed };
    }

    return { success: true, isFallback: false, summary: rawText, patterns: [] };
  } catch (err) {
    console.error('AI Risk Pattern Error:', err.message);
    return { success: false, isFallback: true, patterns: [], summary: FALLBACK_MESSAGE };
  }
};

/**
 * AI Feature 4 – Predictive Analytics
 * @param {object} analyticsData - aggregated stats
 */
const generatePredictiveInsights = async (analyticsData) => {
  try {
    const prompt = `
You are a healthcare analytics AI. Based on the following clinic data, generate predictive insights:

Data: ${JSON.stringify(analyticsData, null, 2)}

Provide insights in JSON format:
{
  "forecast": "Brief patient load forecast for next month",
  "mostCommonDisease": "Based on patterns",
  "recommendations": ["operational recommendation1", "rec2"],
  "alertFlags": ["any concerning trends"]
}`;

    const rawText = await callGemini(prompt);
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { success: true, isFallback: false, insights: JSON.parse(jsonMatch[0]) };
    }
    return { success: true, isFallback: false, insights: { forecast: rawText } };
  } catch (err) {
    console.error('AI Predictive Analytics Error:', err.message);
    return { success: false, isFallback: true, insights: { forecast: FALLBACK_MESSAGE } };
  }
};

module.exports = {
  checkSymptoms,
  explainPrescription,
  detectRiskPatterns,
  generatePredictiveInsights,
  FALLBACK_MESSAGE,
};
