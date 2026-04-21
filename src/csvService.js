const csv = require('csv-parser');
const fs = require('fs');

class CsvService {
  static parseCsv(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Validate that email field exists and is not empty
          if (data.email && data.email.trim()) {
            results.push(data);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static validateRecipients(recipients) {
    const errors = [];
    const validRecipients = [];

    recipients.forEach((recipient, index) => {
      if (!recipient.email) {
        errors.push(`Row ${index + 1}: Missing email field`);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient.email)) {
        errors.push(`Row ${index + 1}: Invalid email format: ${recipient.email}`);
        return;
      }

      validRecipients.push(recipient);
    });

    return {
      validRecipients,
      errors,
      total: recipients.length,
      valid: validRecipients.length,
      invalid: errors.length
    };
  }

  static getAvailableColumns(recipients) {
    if (recipients.length === 0) return [];
    
    return Object.keys(recipients[0]).filter(key => key !== 'email');
  }
}

module.exports = CsvService;
