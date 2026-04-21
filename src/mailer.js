const nodemailer = require('nodemailer');

class Mailer {
  constructor() {
    this.transporter = null;
    this.rateLimitDelay = 1000 / (process.env.RATE_LIMIT || 2);
    this.initialize();
  }

  initialize() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (error) {
      console.error('Failed to initialize mailer:', error);
      throw error;
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.transporter) {
      throw new Error('Mailer not initialized');
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmails(recipients, subject, templateProcessor) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const recipient of recipients) {
      try {
        const html = templateProcessor(recipient);
        const result = await this.sendEmail(recipient.email, subject, html);
        
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            email: recipient.email,
            error: result.error
          });
        }

        // Rate limiting
        if (recipients.indexOf(recipient) < recipients.length - 1) {
          await this.delay(this.rateLimitDelay);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: error.message
        });
      }
    }

    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = Mailer;
