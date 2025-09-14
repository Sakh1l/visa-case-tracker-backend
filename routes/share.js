// Express router for sharing cases via unique links and sending email
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// POST /api/share - share a case via email
router.post('/', async (req, res) => {
  const { case_id, email } = req.body;
  if (!case_id || !email) return res.status(400).json({ error: 'Missing case_id or email' });
  const link_token = uuidv4();
  const link = `${process.env.FRONTEND_URL}/view/${link_token}`;
  // Store shared link
  const { error: insertErr } = await supabase.from('shared_links').insert({
    case_id,
    email,
    link_token
  });
  if (insertErr) return res.status(500).json({ error: insertErr.message });
  // Send email via Supabase
  const { error: mailErr } = await supabase.functions.invoke('send-case-link', {
    body: { email, link }
  });
  if (mailErr) return res.status(500).json({ error: mailErr.message });
  res.json({ success: true });
});

// GET /api/share/:token - get case info for viewer link
router.get('/:token', async (req, res) => {
  const { token } = req.params;
  const { data: shared, error } = await supabase
    .from('shared_links')
    .select('case_id')
    .eq('link_token', token)
    .single();
  if (error || !shared) return res.status(404).json({ error: 'Invalid or expired link' });
  const { data: caseData, error: caseErr } = await supabase
    .from('cases')
    .select('*')
    .eq('id', shared.case_id)
    .single();
  if (caseErr || !caseData) return res.status(404).json({ error: 'Case not found' });
  res.json(caseData);
});

module.exports = router;
