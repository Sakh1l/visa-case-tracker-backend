import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ShareModal({ caseItem, onClose }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseItem.id,
          email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to share case');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Case</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="modal-body">
            <div className="success-message">
              ✓ Case shared successfully! The employee will receive an email with a secure link.
            </div>
          </div>
        ) : (
          <form onSubmit={handleShare} className="modal-body">
            <div className="share-case-info">
              <h3>{caseItem.employee_name}</h3>
              <p>{caseItem.visa_type}</p>
            </div>

            <div className="form-group">
              <label htmlFor="share-email">Employee Email</label>
              <input
                id="share-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
                required
                disabled={sending}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={sending || !email}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
