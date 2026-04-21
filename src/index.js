require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Mailer = require('./mailer');
const CsvService = require('./csvService');
const TemplateService = require('./templateService');
const Templates = require('./templates');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Initialize mailer
const mailer = new Mailer();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connectionStatus = await mailer.verifyConnection();
    res.json({
      status: 'healthy',
      smtp: connectionStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Main email sending endpoint
app.post('/send-bulk', upload.single('file'), async (req, res) => {
  try {
    const { subject, template } = req.body;
    const csvFile = req.file;

    // Validate inputs
    if (!csvFile) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is required'
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        error: 'Subject is required'
      });
    }

    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Template is required'
      });
    }

    // Parse CSV
    const recipients = await CsvService.parseCsv(csvFile.path);
    
    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid recipients found in CSV'
      });
    }

    // Validate recipients
    const validation = CsvService.validateRecipients(recipients);
    
    if (validation.valid === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid email addresses found',
        validationErrors: validation.errors
      });
    }

    // Validate template
    const availableColumns = CsvService.getAvailableColumns(validation.validRecipients);
    const templateValidation = TemplateService.validateTemplate(template, availableColumns);
    
    if (!templateValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Template validation failed',
        templateErrors: templateValidation.errors
      });
    }

    // Create template processor
    const templateProcessor = TemplateService.createTemplateProcessor(template);

    // Send emails
    const results = await mailer.sendBulkEmails(
      validation.validRecipients,
      subject,
      templateProcessor
    );

    // Clean up uploaded file
    fs.unlinkSync(csvFile.path);

    // Return results
    res.json({
      success: true,
      totalProcessed: validation.valid,
      success: results.success,
      failed: results.failed,
      errors: results.errors,
      validationWarnings: validation.errors,
      templateWarnings: templateValidation.warnings,
      rateLimit: `${process.env.RATE_LIMIT || 2} emails/second`
    });

  } catch (error) {
    console.error('Error in send-bulk endpoint:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List available templates
app.get('/templates', (req, res) => {
  try {
    const templates = Templates.listTemplates();
    res.json({
      success: true,
      templates,
      total: templates.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send single email with template
app.get('/sendone', async (req, res) => {
  try {
    const { email, template, ...variables } = req.query;

    // Validate required parameters
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Template parameter is required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if template exists
    const templateInfo = Templates.getTemplate(template);
    if (!templateInfo) {
      return res.status(400).json({
        success: false,
        error: `Template '${template}' not found. Available templates: ${Object.keys(Templates.getTemplates()).join(', ')}`
      });
    }

    // Process template with variables
    const processed = Templates.processTemplate(template, variables);

    // Send email
    const result = await mailer.sendEmail(email, processed.subject, processed.html);

    if (result.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        to: email,
        template: template,
        subject: processed.subject,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        to: email,
        template: template
      });
    }

  } catch (error) {
    console.error('Error in sendone endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Email service running on port ${port}`);
  console.log(`Rate limit: ${process.env.RATE_LIMIT || 2} emails/second`);
  console.log(`Health check: http://localhost:${port}/health`);
});

module.exports = app;
