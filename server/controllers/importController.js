const { parse } = require('csv-parse/sync');
const fs = require('fs');
const JobApplication = require('../models/JobApplication');

// ─── Valid values for enum fields ─────────────────────────────────────────────
const VALID_STATUSES  = ['Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const VALID_SOURCES   = ['LinkedIn', 'Indeed', 'Naukri', 'Company Website', 'Referral', 'GitHub Jobs', 'Other'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// ─── @desc   Import applications from a CSV file
// ─── @route  POST /api/import/csv
// ─── @access Private
const importCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');

    // Remove the temp file after reading
    fs.unlinkSync(req.file.path);

    let records;
    try {
      records = parse(fileContent, {
        columns: true,           // use first row as column names
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      });
    } catch (parseErr) {
      return res.status(400).json({ message: 'Invalid CSV format: ' + parseErr.message });
    }

    if (!records.length) {
      return res.status(400).json({ message: 'CSV file is empty or has no data rows' });
    }

    const results = { imported: 0, skipped: 0, errors: [] };
    const toInsert = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because row 1 is header

      // ─── Required fields ───────────────────────────────────────────────────
      const companyName = row.companyName || row.company || row.Company || '';
      const roleTitle   = row.roleTitle   || row.role    || row.Role    || row.title || '';

      if (!companyName || !roleTitle) {
        results.skipped++;
        results.errors.push(`Row ${rowNum}: Missing companyName or roleTitle`);
        continue;
      }

      // ─── Sanitize enum fields ──────────────────────────────────────────────
      const rawStatus   = row.status   || row.Status   || 'Saved';
      const rawSource   = row.source   || row.Source   || 'Other';
      const rawPriority = row.priority || row.Priority || 'Medium';

      const status   = VALID_STATUSES.includes(rawStatus)     ? rawStatus   : 'Saved';
      const source   = VALID_SOURCES.includes(rawSource)      ? rawSource   : 'Other';
      const priority = VALID_PRIORITIES.includes(rawPriority) ? rawPriority : 'Medium';

      // ─── Sanitize date fields ──────────────────────────────────────────────
      const appliedDate   = row.appliedDate   ? new Date(row.appliedDate)   : null;
      const interviewDate = row.interviewDate ? new Date(row.interviewDate) : null;

      toInsert.push({
        user:        req.user._id,
        companyName: companyName.trim(),
        roleTitle:   roleTitle.trim(),
        location:    (row.location   || '').trim(),
        jobUrl:      (row.jobUrl     || row.url || '').trim(),
        salaryNote:  (row.salaryNote || row.salary || '').trim(),
        notes:       (row.notes      || '').trim(),
        status,
        source,
        priority,
        appliedDate:   !isNaN(appliedDate)   ? appliedDate   : null,
        interviewDate: !isNaN(interviewDate) ? interviewDate : null,
      });
    }

    // ─── Bulk insert ───────────────────────────────────────────────────────────
    if (toInsert.length > 0) {
      await JobApplication.insertMany(toInsert, { ordered: false });
      results.imported = toInsert.length;
    }

    res.status(201).json({
      message: `Import complete: ${results.imported} imported, ${results.skipped} skipped`,
      ...results,
    });
  } catch (err) {
    console.error('CSV import error:', err);
    res.status(500).json({ message: 'Server error during import' });
  }
};

// ─── @desc   Download a sample CSV template
// ─── @route  GET /api/import/template
// ─── @access Private
const downloadTemplate = (req, res) => {
  const headers = 'companyName,roleTitle,location,jobUrl,source,status,priority,appliedDate,interviewDate,salaryNote,notes';
  const sample1 = 'Google,Software Engineer,Bangalore,https://careers.google.com,LinkedIn,Applied,High,2025-01-15,,₹28 LPA,Referral from senior';
  const sample2 = 'Microsoft,SDE-1,Hyderabad,https://careers.microsoft.com,Company Website,OA,High,2025-01-18,,₹24 LPA,OA scheduled';
  const sample3 = 'Amazon,Backend Intern,Remote,,LinkedIn,Saved,Medium,,,₹8k/month,';
  const csv = [headers, sample1, sample2, sample3].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=jobtracker_template.csv');
  res.send(csv);
};

module.exports = { importCSV, downloadTemplate };
