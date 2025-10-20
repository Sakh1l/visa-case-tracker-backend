import dayjs from 'dayjs';

export default function CaseList({ cases, loading, onShare, onRefresh }) {
  const getExpiryStatus = (expiryDate) => {
    const expiry = dayjs(expiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiry.diff(now, 'day');

    if (daysUntilExpiry < 0) return { label: 'Expired', className: 'status-expired' };
    if (daysUntilExpiry <= 30) return { label: `${daysUntilExpiry}d left`, className: 'status-warning' };
    if (daysUntilExpiry <= 90) return { label: `${daysUntilExpiry}d left`, className: 'status-caution' };
    return { label: `${daysUntilExpiry}d left`, className: 'status-ok' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading cases...</p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h2>No cases found</h2>
        <p>Upload a spreadsheet to get started</p>
      </div>
    );
  }

  return (
    <div className="case-list">
      <div className="table-container">
        <table className="case-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Visa Type</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Current Stage</th>
              <th>USCIS Case ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((caseItem) => {
              const status = getExpiryStatus(caseItem.expiry_date);
              return (
                <tr key={caseItem.id}>
                  <td className="cell-name">{caseItem.employee_name}</td>
                  <td className="cell-visa">{caseItem.visa_type}</td>
                  <td className="cell-date">
                    {dayjs(caseItem.expiry_date).format('MMM D, YYYY')}
                  </td>
                  <td>
                    <span className={`status-badge ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="cell-stage">{caseItem.current_stage || '—'}</td>
                  <td className="cell-case-id">{caseItem.uscis_case_id || '—'}</td>
                  <td className="cell-actions">
                    <button
                      className="btn-icon"
                      onClick={() => onShare(caseItem)}
                      title="Share with employee"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
