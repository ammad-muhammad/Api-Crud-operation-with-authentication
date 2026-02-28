const PDFDocument = require('pdfkit');

/**
 * Generates a prescription PDF buffer.
 * @param {object} data - prescription + patient + doctor info
 * @returns {Promise<Buffer>}
 */
const generatePrescriptionPDF = (data) => {
  return new Promise((resolve, reject) => {
    const { prescription, patient, doctor } = data;

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ── Header / Clinic Info ──────────────────────────────────────────────────
    doc
      .fillColor('#1a56db')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(process.env.CLINIC_NAME || 'MediCare AI Clinic', { align: 'center' });

    doc
      .fillColor('#4b5563')
      .fontSize(10)
      .font('Helvetica')
      .text(process.env.CLINIC_ADDRESS || '123 Health Street', { align: 'center' })
      .text(
        `📞 ${process.env.CLINIC_PHONE || '+1 (555) 000-1234'}  |  ✉ ${process.env.CLINIC_EMAIL || 'contact@medicareai.com'}`,
        { align: 'center' }
      );

    // Divider line
    doc
      .moveTo(60, doc.y + 10)
      .lineTo(530, doc.y + 10)
      .strokeColor('#1a56db')
      .lineWidth(2)
      .stroke();

    doc.moveDown(1.5);

    // ── Prescription Title ────────────────────────────────────────────────────
    doc
      .fillColor('#111827')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PRESCRIPTION', { align: 'center' });

    doc.moveDown(0.5);

    // ── Doctor & Patient Info ─────────────────────────────────────────────────
    const infoY = doc.y;
    doc.fontSize(10).font('Helvetica');

    // Left column – Doctor info
    doc
      .fillColor('#374151')
      .text(`Doctor: ${doctor?.name || 'N/A'}`, 60, infoY)
      .text(`Specialization: ${doctor?.specialization || 'General Physician'}`, 60)
      .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 60);

    // Right column – Patient info
    doc
      .text(`Patient: ${patient?.name || 'N/A'}`, 300, infoY)
      .text(`Age / Gender: ${patient?.age || 'N/A'} / ${patient?.gender || 'N/A'}`, 300)
      .text(`Contact: ${patient?.contact?.phone || 'N/A'}`, 300);

    doc.moveDown(2);

    // Divider
    doc
      .moveTo(60, doc.y)
      .lineTo(530, doc.y)
      .strokeColor('#d1d5db')
      .lineWidth(1)
      .stroke();
    doc.moveDown(1);

    // ── Diagnosis ─────────────────────────────────────────────────────────────
    if (prescription.diagnosis) {
      doc
        .fillColor('#1a56db')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Diagnosis:');
      doc
        .fillColor('#111827')
        .fontSize(10)
        .font('Helvetica')
        .text(prescription.diagnosis);
      doc.moveDown(1);
    }

    // ── Medicines Table ───────────────────────────────────────────────────────
    doc
      .fillColor('#1a56db')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Prescribed Medicines:');
    doc.moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const col = { med: 60, dose: 200, freq: 300, dur: 390, inst: 470 };

    doc
      .fillColor('#1f2937')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Medicine', col.med, tableTop)
      .text('Dosage', col.dose, tableTop)
      .text('Frequency', col.freq, tableTop)
      .text('Duration', col.dur, tableTop);

    doc
      .moveTo(60, doc.y + 4)
      .lineTo(530, doc.y + 4)
      .strokeColor('#9ca3af')
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.8);

    // Table rows
    (prescription.medicines || []).forEach((med, idx) => {
      const rowY = doc.y;
      const bg = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
      doc.rect(58, rowY - 3, 472, 18).fill(bg);

      doc
        .fillColor('#111827')
        .fontSize(9)
        .font('Helvetica')
        .text(med.name || '', col.med, rowY, { width: 130 })
        .text(med.dosage || '', col.dose, rowY, { width: 90 })
        .text(med.frequency || '', col.freq, rowY, { width: 85 })
        .text(med.duration || '-', col.dur, rowY, { width: 75 });

      doc.moveDown(0.6);
    });

    doc.moveDown(1);

    // ── Notes ─────────────────────────────────────────────────────────────────
    if (prescription.notes) {
      doc
        .fillColor('#1a56db')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Doctor Notes:');
      doc
        .fillColor('#374151')
        .fontSize(10)
        .font('Helvetica')
        .text(prescription.notes);
      doc.moveDown(1);
    }

    // ── AI Explanation ─────────────────────────────────────────────────────────
    if (prescription.aiExplanation && prescription.aiExplanation !== 'AI service temporarily unavailable. Core system remains functional.') {
      doc
        .fillColor('#1a56db')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('AI Health Explanation (for Patient):');
      doc
        .fillColor('#374151')
        .fontSize(10)
        .font('Helvetica')
        .text(prescription.aiExplanation, { width: 470 });
      doc.moveDown(1);
    }

    // ── Follow Up ──────────────────────────────────────────────────────────────
    if (prescription.followUpDate) {
      doc
        .fillColor('#6b7280')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`);
      doc.moveDown(1);
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc
      .moveTo(60, doc.y + 10)
      .lineTo(530, doc.y + 10)
      .strokeColor('#d1d5db')
      .lineWidth(1)
      .stroke();

    doc.moveDown(1.5);
    doc
      .fillColor('#9ca3af')
      .fontSize(8)
      .font('Helvetica')
      .text('This prescription was generated digitally by MediCare AI Clinic System.', { align: 'center' })
      .text('Please keep this document for your records.', { align: 'center' });

    // Doctor signature line
    doc
      .fillColor('#374151')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`__________________________`, 370, doc.y - 30)
      .fontSize(9)
      .font('Helvetica')
      .text(`Dr. ${doctor?.name || 'Physician'}`, 370);

    doc.end();
  });
};

module.exports = { generatePrescriptionPDF };
