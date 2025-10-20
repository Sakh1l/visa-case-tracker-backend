import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CaseList from './CaseList';
import UploadModal from './UploadModal';
import ShareModal from './ShareModal';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    setError('');

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch cases');

      const data = await response.json();
      setCases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleShare = (caseItem) => {
    setSelectedCase(caseItem);
    setShowShareModal(true);
  };

  const filteredCases = cases.filter(c =>
    c.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.visa_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.uscis_case_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>VisaCase Tracker</h1>
            <p className="user-email">{user?.email}</p>
          </div>

          <div className="header-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowUploadModal(true)}
            >
              Upload Cases
            </button>
            <button
              className="btn-link"
              onClick={signOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, visa type, or case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="stats">
            <div className="stat-card">
              <span className="stat-value">{cases.length}</span>
              <span className="stat-label">Total Cases</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {cases.filter(c => {
                  const expiry = new Date(c.expiry_date);
                  const now = new Date();
                  const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
                  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                }).length}
              </span>
              <span className="stat-label">Expiring Soon</span>
            </div>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <CaseList
          cases={filteredCases}
          loading={loading}
          onShare={handleShare}
          onRefresh={fetchCases}
        />
      </main>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchCases();
          }}
        />
      )}

      {showShareModal && selectedCase && (
        <ShareModal
          caseItem={selectedCase}
          onClose={() => {
            setShowShareModal(false);
            setSelectedCase(null);
          }}
        />
      )}
    </div>
  );
}
