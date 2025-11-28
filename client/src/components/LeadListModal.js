import React from 'react';
import Modal from 'react-modal';
import './LeadListModal.css';
import { formatDateDDMMYYYY } from '../utils/dateUtils';

Modal.setAppElement('#root');

function LeadListModal({ isOpen, onClose, leads, title }) {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return formatDateDDMMYYYY(dateObj);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="lead-modal"
      overlayClassName="lead-modal-overlay"
      contentLabel={title}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="modal-content">
        <div className="modal-info">
          <p>Total: {leads.length} leads</p>
        </div>
        
        <div className="leads-table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>LinkedIn</th>
                <th>Title</th>
                <th>Current Employer</th>
                <th>Location</th>
                <th>Fit Score</th>
                <th>Connection Status</th>
                <th>Date Generated</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No leads found</td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <tr key={index}>
                    <td>{lead.Name || 'N/A'}</td>
                    <td>{lead.Email || 'N/A'}</td>
                    <td>
                      {lead.LinkedIN ? (
                        <a href={lead.LinkedIN} target="_blank" rel="noopener noreferrer">
                          View Profile
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td>{lead.Title || 'N/A'}</td>
                    <td>{lead['Current Employer'] || 'N/A'}</td>
                    <td>{lead.Location || 'N/A'}</td>
                    <td>{lead['Fit Score'] !== null && lead['Fit Score'] !== '' ? lead['Fit Score'] : 'N/A'}</td>
                    <td>{lead['Connection Status'] || 'N/A'}</td>
                    <td>{formatDate(lead['Date Generated'])}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="modal-footer">
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </Modal>
  );
}

export default LeadListModal;

