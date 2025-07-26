import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import moment from 'moment';

/**
 * Export Service
 * Handles exporting calendar data in various formats: PDF, CSV, and Image
 */
class ExportService {
  
  /**
   * Export calendar as PDF
   * @param {HTMLElement} calendarElement - The DOM element containing the calendar
   * @param {Object} options - Export options
   */
  async exportToPDF(calendarElement, options = {}) {
    try {
      const {
        filename = `market-calendar-${moment().format('YYYY-MM-DD')}.pdf`,
        quality = 0.95,
        format = 'a4',
        orientation = 'landscape',
        margin = 10
      } = options;

      console.log('📄 Starting PDF export...');
      
      // Capture the calendar as canvas
      const canvas = await html2canvas(calendarElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Calculate PDF dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format
      });

      const pdfWidth = pdf.internal.pageSize.getWidth() - (2 * margin);
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Market Calendar Export', margin, margin + 10);
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, margin, margin + 20);
      
      // Add calendar image
      const imgData = canvas.toDataURL('image/jpeg', quality);
      pdf.addImage(imgData, 'JPEG', margin, margin + 30, pdfWidth, pdfHeight);
      
      // Save PDF
      pdf.save(filename);
      console.log('✅ PDF export completed:', filename);
      
      return {
        success: true,
        filename,
        message: 'Calendar exported as PDF successfully'
      };
      
    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Export calendar as image (PNG/JPEG)
   * @param {HTMLElement} calendarElement - The DOM element containing the calendar
   * @param {Object} options - Export options
   */
  async exportToImage(calendarElement, options = {}) {
    try {
      const {
        filename = `market-calendar-${moment().format('YYYY-MM-DD')}.png`,
        format = 'png',
        quality = 0.95,
        scale = 2,
        backgroundColor = '#ffffff'
      } = options;

      console.log('🖼️ Starting image export...');
      
      // Capture the calendar as canvas
      const canvas = await html2canvas(calendarElement, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        logging: false
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, filename);
          console.log('✅ Image export completed:', filename);
        } else {
          throw new Error('Failed to create image blob');
        }
      }, `image/${format}`, quality);
      
      return {
        success: true,
        filename,
        message: 'Calendar exported as image successfully'
      };
      
    } catch (error) {
      console.error('❌ Image export failed:', error);
      throw new Error(`Image export failed: ${error.message}`);
    }
  }

  /**
   * Export calendar data as CSV
   * @param {Array} calendarData - Array of calendar data objects
   * @param {Object} options - Export options
   */
  exportToCSV(calendarData, options = {}) {
    try {
      const {
        filename = `market-calendar-data-${moment().format('YYYY-MM-DD')}.csv`,
        includeHeaders = true,
        delimiter = ','
      } = options;

      console.log('📊 Starting CSV export...');
      
      if (!calendarData || !Array.isArray(calendarData) || calendarData.length === 0) {
        throw new Error('No calendar data available for export');
      }

      // Prepare CSV data
      const csvData = calendarData.map(item => ({
        Date: moment(item.date).format('YYYY-MM-DD'),
        Day: moment(item.date).format('dddd'),
        'Market Open': item.isMarketOpen ? 'Yes' : 'No',
        'Volatility': item.volatility || 'N/A',
        'Volume': item.volume || 'N/A',
        'Price Change': item.priceChange || 'N/A',
        'Price Change %': item.priceChangePercent || 'N/A',
        'High': item.high || 'N/A',
        'Low': item.low || 'N/A',
        'Close': item.close || 'N/A',
        'Market Events': Array.isArray(item.events) ? item.events.join('; ') : (item.events || 'None'),
        'Seasonality Score': item.seasonalityScore || 'N/A',
        'Notes': item.notes || ''
      }));

      // Generate CSV
      const csv = Papa.unparse(csvData, {
        header: includeHeaders,
        delimiter: delimiter
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename);
      
      console.log('✅ CSV export completed:', filename);
      
      return {
        success: true,
        filename,
        rowCount: csvData.length,
        message: `Calendar data exported as CSV successfully (${csvData.length} rows)`
      };
      
    } catch (error) {
      console.error('❌ CSV export failed:', error);
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }

  /**
   * Export calendar data with market analysis as enhanced CSV
   * @param {Array} calendarData - Array of calendar data objects
   * @param {Object} analysisData - Market analysis data
   * @param {Object} options - Export options
   */
  exportToEnhancedCSV(calendarData, analysisData, options = {}) {
    try {
      const {
        filename = `market-calendar-analysis-${moment().format('YYYY-MM-DD')}.csv`
      } = options;

      console.log('📈 Starting enhanced CSV export...');
      
      // Prepare enhanced data with analysis
      const enhancedData = calendarData.map(item => {
        const analysis = analysisData?.find(a => 
          moment(a.date).format('YYYY-MM-DD') === moment(item.date).format('YYYY-MM-DD')
        ) || {};

        return {
          Date: moment(item.date).format('YYYY-MM-DD'),
          Day: moment(item.date).format('dddd'),
          Week: moment(item.date).format('W'),
          Month: moment(item.date).format('MMMM'),
          Quarter: `Q${moment(item.date).quarter()}`,
          'Market Open': item.isMarketOpen ? 'Yes' : 'No',
          'Volatility': item.volatility || 'N/A',
          'Volume': item.volume || 'N/A',
          'Price': item.price || 'N/A',
          'Price Change': item.priceChange || 'N/A',
          'Price Change %': item.priceChangePercent || 'N/A',
          'High': item.high || 'N/A',
          'Low': item.low || 'N/A',
          'Close': item.close || 'N/A',
          'Moving Average (7d)': analysis.ma7 || 'N/A',
          'Moving Average (30d)': analysis.ma30 || 'N/A',
          'RSI': analysis.rsi || 'N/A',
          'MACD': analysis.macd || 'N/A',
          'Bollinger Upper': analysis.bollingerUpper || 'N/A',
          'Bollinger Lower': analysis.bollingerLower || 'N/A',
          'Support Level': analysis.support || 'N/A',
          'Resistance Level': analysis.resistance || 'N/A',
          'Market Events': Array.isArray(item.events) ? item.events.join('; ') : (item.events || 'None'),
          'Seasonality Score': item.seasonalityScore || 'N/A',
          'Trend': analysis.trend || 'N/A',
          'Sentiment': analysis.sentiment || 'N/A',
          'Risk Level': analysis.riskLevel || 'N/A',
          'Trading Signal': analysis.signal || 'N/A',
          'Notes': item.notes || ''
        };
      });

      return this.exportToCSV(enhancedData, { ...options, filename });
      
    } catch (error) {
      console.error('❌ Enhanced CSV export failed:', error);
      throw new Error(`Enhanced CSV export failed: ${error.message}`);
    }
  }

  /**
   * Generate export metadata
   * @param {string} exportType - Type of export (pdf, csv, image)
   * @param {Object} options - Export options
   */
  generateExportMetadata(exportType, options = {}) {
    return {
      exportType,
      timestamp: moment().toISOString(),
      filename: options.filename || `market-calendar-${exportType}-${moment().format('YYYY-MM-DD')}`,
      options: options,
      userAgent: navigator.userAgent,
      version: '1.0.0'
    };
  }

  /**
   * Validate export data before processing
   * @param {Array} data - Data to validate
   * @param {string} exportType - Type of export
   */
  validateExportData(data, exportType) {
    if (exportType === 'csv') {
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid or empty data for CSV export');
      }
    }
    
    if (exportType === 'pdf' || exportType === 'image') {
      if (!data || !data.nodeType) {
        throw new Error('Invalid DOM element for visual export');
      }
    }
    
    return true;
  }
}

export default new ExportService();
