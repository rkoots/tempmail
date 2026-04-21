require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Mailer = require('./mailer');
const CsvService = require('./csvService');
const TemplateService = require('./templateService');
const Templates = require('./templates');
const https = require('https');
const { URL } = require('url');

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

// Load testing endpoint
app.get('/loadtest', async (req, res) => {
  try {
    const { 
      testurl = 'https://ainewsworld.ai/', 
      parallel = 5, 
      duration = 10,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term
    } = req.query;

    // Validate parameters
    const parallelNum = parseInt(parallel) || 5;
    const durationNum = parseInt(duration) || 10;
    
    if (parallelNum < 1 || parallelNum > 50) {
      return res.status(400).json({
        success: false,
        error: 'Parallel requests must be between 1 and 50'
      });
    }
    
    if (durationNum < 1 || durationNum > 300) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 1 and 300 seconds'
      });
    }

    // Build URL with UTM parameters
    const url = new URL(testurl);
    if (utm_source) url.searchParams.set('utm_source', utm_source);
    if (utm_medium) url.searchParams.set('utm_medium', utm_medium);
    if (utm_campaign) url.searchParams.set('utm_campaign', utm_campaign);
    if (utm_content) url.searchParams.set('utm_content', utm_content);
    if (utm_term) url.searchParams.set('utm_term', utm_term);

    const targetUrl = url.toString();
    
    console.log(`Starting load test: ${parallelNum} parallel requests for ${durationNum} seconds to ${targetUrl}`);

    // Load testing results
    const results = {
      success: true,
      testUrl: targetUrl,
      parallelRequests: parallelNum,
      duration: durationNum,
      startTime: new Date().toISOString(),
      endTime: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      errors: []
    };

    const startTime = Date.now();
    const endTime = startTime + (durationNum * 1000);
    const responseTimes = [];

    // Function to make a single request
    const makeRequest = async () => {
      const requestStart = Date.now();
      try {
        const response = await new Promise((resolve, reject) => {
          const req = https.get(targetUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                responseTime: Date.now() - requestStart
              });
            });
          });
          
          req.on('error', reject);
          req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
          });
        });

        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        
        if (response.statusCode >= 200 && response.statusCode < 400) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
          results.errors.push({
            error: `HTTP ${response.statusCode}`,
            responseTime
          });
        }
        
        results.totalRequests++;
        
        // Update min/max response times
        results.minResponseTime = Math.min(results.minResponseTime, responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
        
      } catch (error) {
        results.totalRequests++;
        results.failedRequests++;
        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        results.errors.push({
          error: error.message,
          responseTime
        });
        results.minResponseTime = Math.min(results.minResponseTime, responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, responseTime);
      }
    };

    // Run parallel requests continuously for the duration
    const runLoadTest = async () => {
      while (Date.now() < endTime) {
        const promises = [];
        
        // Create parallel requests
        for (let i = 0; i < parallelNum; i++) {
          promises.push(makeRequest());
        }
        
        // Wait for all parallel requests to complete
        await Promise.all(promises);
        
        // Small delay to prevent overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    };

    // Start the load test
    await runLoadTest();
    
    // Calculate final statistics
    results.endTime = new Date().toISOString();
    results.actualDuration = (Date.now() - startTime) / 1000;
    
    if (responseTimes.length > 0) {
      results.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }
    
    if (results.minResponseTime === Infinity) {
      results.minResponseTime = 0;
    }

    // Calculate requests per second
    results.requestsPerSecond = (results.totalRequests / results.actualDuration).toFixed(2);
    
    console.log(`Load test completed: ${results.totalRequests} requests in ${results.actualDuration}s`);

    res.json(results);

  } catch (error) {
    console.error('Error in loadtest endpoint:', error);
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
