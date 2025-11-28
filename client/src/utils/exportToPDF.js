import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export summary report to PDF in A4 size with graphical representations
 * @param {Array} data - Array of objects to analyze
 * @param {Object} options - Export options
 * @param {Object} chartRefs - References to chart DOM elements
 */
export async function exportToPDF(data, options = {}, chartRefs = {}) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const {
    title = 'Lead Management Report',
    dateRange = null,
    periodType = 'all',
    filename = null
  } = options;

  // Create PDF in A4 size (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Light theme colors (matching Spark AI logo)
  const primaryColor = [102, 126, 234]; // Purple-blue
  const secondaryColor = [118, 75, 162]; // Purple
  const lightBg = [245, 247, 250]; // Light background
  const textColor = [44, 62, 80]; // Dark text
  const lightText = [90, 108, 125]; // Light text

  // Helper function to format date
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  let yPos = margin;

  // Header with gradient background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Spark AI branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Spark AI', margin, 20);

  // Report title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(title, margin, 35);

  // Date range info
  if (dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    let dateText = '';
    if (periodType === 'daily' && dateRange.start) {
      dateText = `Date: ${formatDate(dateRange.start)}`;
    } else if (periodType === 'weekly' && dateRange.start && dateRange.end) {
      dateText = `Week: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    } else if (periodType === 'monthly' && dateRange.start) {
      const monthYear = dateRange.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      dateText = `Month: ${monthYear}`;
    } else if (dateRange.start && dateRange.end) {
      dateText = `Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    }
    if (dateText) {
      doc.text(dateText, margin, 42);
    }
  }

  yPos = 55;

  // Calculate statistics
  const totalWithFitScore = data.filter(row => row['Fit Score'] !== null && row['Fit Score'] !== '').length;
  const invited = data.filter(row => 
    row['Connection Status'] === 'Ready to send' || row['Connection Status'] === 'Sent'
  ).length;
  const accepted = data.filter(row => row['Connection Status'] === 'ACCEPTED').length;
  const totalRecords = data.length;

  // Summary Section
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
  
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Performance Indicators', margin + 5, yPos + 8);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summaryY = yPos + 15;
  doc.text(`Total Leads (with Fit Score): ${totalWithFitScore}`, margin + 5, summaryY);
  doc.text(`Invited Leads: ${invited}`, margin + 5, summaryY + 5);
  doc.text(`Accepted Leads: ${accepted}`, margin + 5, summaryY + 10);
  doc.text(`Total Records: ${totalRecords}`, margin + 5, summaryY + 15);

  yPos += 35;

  // Function to add chart image to PDF
  const addChartImage = async (chartElement, width, height, label) => {
    if (!chartElement) return false;

    try {
      // Check if we need a new page
      if (yPos + height > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }

      // Add chart label
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textColor);
      doc.text(label, margin, yPos);
      yPos += 5;

      // Capture chart as image
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit within page width
      const imgWidth = Math.min(width, contentWidth);
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      // Add image to PDF
      doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 10;

      return true;
    } catch (error) {
      console.error(`Error capturing chart ${label}:`, error);
      return false;
    }
  };

  // Add charts if chartRefs are provided
  if (chartRefs.connectionStatusPie && chartRefs.connectionStatusPie.current) {
    await addChartImage(
      chartRefs.connectionStatusPie.current,
      contentWidth / 2 - 5,
      60,
      'Connection Status Distribution'
    );
  }

  if (chartRefs.connectionStatusLine && chartRefs.connectionStatusLine.current) {
    await addChartImage(
      chartRefs.connectionStatusLine.current,
      contentWidth / 2 - 5,
      60,
      'Connection Status Trends'
    );
  }

  if (chartRefs.emailStatusBar && chartRefs.emailStatusBar.current) {
    await addChartImage(
      chartRefs.emailStatusBar.current,
      contentWidth / 2 - 5,
      60,
      'Email Status Distribution'
    );
  }

  if (chartRefs.emailStatusPie && chartRefs.emailStatusPie.current) {
    await addChartImage(
      chartRefs.emailStatusPie.current,
      contentWidth / 2 - 5,
      60,
      'Email Status Breakdown'
    );
  }

  if (chartRefs.fitScoreHistogram && chartRefs.fitScoreHistogram.current) {
    await addChartImage(
      chartRefs.fitScoreHistogram.current,
      contentWidth,
      60,
      'Fit Score Distribution'
    );
  }

  if (chartRefs.topEmployers && chartRefs.topEmployers.current) {
    await addChartImage(
      chartRefs.topEmployers.current,
      contentWidth / 2 - 5,
      60,
      'Top Employers'
    );
  }

  if (chartRefs.topLocations && chartRefs.topLocations.current) {
    await addChartImage(
      chartRefs.topLocations.current,
      contentWidth / 2 - 5,
      60,
      'Top Locations'
    );
  }

  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...lightText);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      margin,
      pageHeight - 10
    );
  }

  // Generate filename
  const generateFilename = () => {
    if (filename) return filename;
    
    const formatDateForFile = (date) => {
      if (!date || isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    if (dateRange) {
      if (periodType === 'daily' && dateRange.start) {
        return `lead_report_${formatDateForFile(dateRange.start)}.pdf`;
      } else if (periodType === 'weekly' && dateRange.start && dateRange.end) {
        return `lead_report_week_${formatDateForFile(dateRange.start)}_to_${formatDateForFile(dateRange.end)}.pdf`;
      } else if (periodType === 'monthly' && dateRange.start) {
        const monthYear = dateRange.start.toISOString().slice(0, 7);
        return `lead_report_month_${monthYear}.pdf`;
      } else if (dateRange.start && dateRange.end) {
        return `lead_report_${formatDateForFile(dateRange.start)}_to_${formatDateForFile(dateRange.end)}.pdf`;
      }
    }
    
    return `lead_report_${new Date().toISOString().split('T')[0]}.pdf`;
  };

  // Save PDF
  doc.save(generateFilename());
}
