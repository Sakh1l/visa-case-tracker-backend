// Express router for visa cases
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Get all cases (for HR dashboard)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('expiry_date', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get a single case (for viewer link)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return res.status(404).json({ error: 'Case not found' });
  res.json(data);
});

// Update a case (HR only)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  updates.last_updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// Delete a case (HR only)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
