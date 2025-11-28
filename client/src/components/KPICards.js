import React, { useState } from 'react';
import './KPICards.css';
import LeadListModal from './LeadListModal';

function KPICards({ data }) {
  const [modalOpen, setModalOpen] = useState(null);
  const [modalLeads, setModalLeads] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  // Exclude "Pending" status leads as they are not great leads
  const totalWithFitScore = data.filter(row => 
    row['Fit Score'] !== null && 
    row['Fit Score'] !== '' && 
    row['Connection Status'] !== 'Pending'
  ).length;
  const invited = data.filter(row => 
    row['Connection Status'] === 'Ready to send' || row['Connection Status'] === 'Sent'
  ).length;
  const accepted = data.filter(row => row['Connection Status'] === 'ACCEPTED').length;
  
  // Count of pending leads (for reference)
  const pendingLeads = data.filter(row => 
    row['Connection Status'] === 'Pending' && 
    row['Fit Score'] !== null && 
    row['Fit Score'] !== ''
  ).length;

  const handleCardClick = (type) => {
    let leads = [];
    let title = '';

    switch(type) {
      case 'total':
        // Exclude "Pending" status leads as they are not great leads
        leads = data.filter(row => 
          row['Fit Score'] !== null && 
          row['Fit Score'] !== '' && 
          row['Connection Status'] !== 'Pending'
        );
        title = `Total Leads with Fit Score (${leads.length})${pendingLeads > 0 ? ` - ${pendingLeads} Pending excluded` : ''}`;
        break;
      case 'invited':
        leads = data.filter(row => 
          row['Connection Status'] === 'Ready to send' || row['Connection Status'] === 'Sent'
        );
        title = `Invited Leads (${leads.length})`;
        break;
      case 'accepted':
        leads = data.filter(row => row['Connection Status'] === 'ACCEPTED');
        title = `Accepted Leads (${leads.length})`;
        break;
      default:
        return;
    }

    setModalLeads(leads);
    setModalTitle(title);
    setModalOpen(type);
  };

  const closeModal = () => {
    setModalOpen(null);
    setModalLeads([]);
    setModalTitle('');
  };

  return (
    <>
      <div className="kpi-section">
        <h2>📈 Key Performance Indicators</h2>
        <div className="kpi-cards">
          <div 
            className="kpi-card kpi-card-total" 
            onClick={() => handleCardClick('total')}
            title="Click to view leads"
          >
            <div className="kpi-label">Total Leads (with Fit Score)</div>
            <div className="kpi-value">{totalWithFitScore}</div>
            {pendingLeads > 0 && (
              <div className="kpi-note" style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.25rem' }}>
                ({pendingLeads} Pending excluded)
              </div>
            )}
            <div className="kpi-hint">Click to view details →</div>
          </div>
          <div 
            className="kpi-card kpi-card-invited"
            onClick={() => handleCardClick('invited')}
            title="Click to view leads"
          >
            <div className="kpi-label">Invited Leads</div>
            <div className="kpi-value">{invited}</div>
            <div className="kpi-hint">Click to view details →</div>
          </div>
          <div 
            className="kpi-card kpi-card-accepted"
            onClick={() => handleCardClick('accepted')}
            title="Click to view leads"
          >
            <div className="kpi-label">Accepted Leads</div>
            <div className="kpi-value">{accepted}</div>
            <div className="kpi-hint">Click to view details →</div>
          </div>
        </div>
      </div>

      <LeadListModal
        isOpen={modalOpen !== null}
        onClose={closeModal}
        leads={modalLeads}
        title={modalTitle}
      />
    </>
  );
}

export default KPICards;
