// Express router for CSV/XLSX upload and data replacement
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const dayjs = require('dayjs');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Helper: parse file to case objects
function excelDateToISO(serial) {
  // Excel's epoch starts at 1899-12-30
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = serial * 24 * 60 * 60 * 1000;
  return new Date(excelEpoch.getTime() + ms).toISOString().slice(0, 10);
}

function parseCases(filePath) {
  const wb = xlsx.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
  return rows
    .filter(row => row['Employee Name'] && row['Visa Type'] && row['Expiry Date'])
    .map(row => {
      let expiryRaw = row['Expiry Date'];
      let parsedDate = null;
      if (typeof expiryRaw === 'number') {
        // Excel serial date
        parsedDate = excelDateToISO(expiryRaw);
      } else {
        // Try to parse as string
        let d = dayjs(expiryRaw, ['DD MMM YYYY', 'D MMM YYYY', 'DD MMMM YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'], true);
        if (!d.isValid()) d = dayjs(expiryRaw); // fallback
        parsedDate = d.isValid() ? d.format('YYYY-MM-DD') : null;
      }
      return {
        employee_name: row['Employee Name'],
        visa_type: row['Visa Type'],
        expiry_date: parsedDate,
        current_stage: row['Current Stage'],
        uscis_case_id: row['USCIS Case ID'],
        notes: row['Notes'],
        last_updated_at: new Date().toISOString()
      };
    })
    .filter(row => row.expiry_date); // Only keep rows with valid dates
}

// Upload endpoint: replaces all cases
router.post('/', upload.single('file'), async (req, res) => {
  console.log('Upload endpoint hit');
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    console.log('Parsing file:', req.file.path);
    const cases = parseCases(req.file.path);
    console.log('Parsed cases:', cases.length);
    // Delete all existing cases (in two steps to handle potential invalid UUIDs)
    try {
      // First try to delete rows with valid UUIDs
      const { error: delErr } = await supabase.rpc('delete_all_cases');

      if (delErr) {
        console.error('Error in RPC delete:', delErr);
        // Fallback to direct delete if RPC fails
        await supabase.from('cases').delete().gt('id', '00000000-0000-0000-0000-000000000000');
      }
      console.log('Deleted old cases');
    } catch (err) {
      console.error('Error deleting cases:', err.message);
      throw err;
    }
    // Insert new cases
    const { error: insErr } = await supabase.from('cases').insert(cases);
    if (insErr) {
      console.error('Error inserting cases:', insErr.message);
      throw insErr;
    }
    console.log('Inserted new cases');
    // Store upload metadata
    await supabase.from('uploads').insert({
      filename: req.file.originalname,
      uploaded_by: req.user?.id || null // requires auth middleware
    });
    console.log('Stored upload metadata');
    res.json({ success: true, count: cases.length });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    try {
      fs.unlinkSync(req.file.path);
      console.log('Temp file deleted');
    } catch (e) {
      console.error('Error deleting temp file:', e);
    }
  }
});

module.exports = router;
