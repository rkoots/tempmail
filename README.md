# Email Service - Production Ready Node.js Bulk Email Sender

A production-ready Node.js email sending service designed for Railway deployment. Send bulk emails with CSV data and HTML templates using SMTP.

## Features

- **REST API**: Simple POST endpoint for bulk email sending
- **CSV Processing**: Parse recipient lists from CSV files
- **Template Variables**: Support for `{{variable}}` placeholders in HTML templates
- **Rate Limiting**: Configurable rate limiting (default: 2 emails/second)
- **Error Handling**: Comprehensive error reporting and validation
- **Health Check**: Endpoint to verify SMTP connection
- **Railway Ready**: Optimized for Railway deployment

## Tech Stack

- Node.js (Express)
- Nodemailer (SMTP)
- csv-parser (CSV parsing)
- Multer (file uploads)
- dotenv (environment configuration)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd email-service
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure your SMTP settings:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Server Configuration
PORT=3000

# Rate Limiting (emails per second)
RATE_LIMIT=2
```

### 3. Run Locally

```bash
npm start
```

The service will be available at `http://localhost:3000`

## Railway Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js application
3. Set environment variables in Railway dashboard:
   - `SMTP_HOST`: Your SMTP server
   - `SMTP_PORT`: SMTP port (usually 587)
   - `SMTP_USER`: Your email address
   - `SMTP_PASS`: Your email password/app password
   - `RATE_LIMIT`: Emails per second (optional, defaults to 2)

4. Deploy! Railway will build and start your service.

### 3. Railway Environment Variables

In your Railway project settings, add these environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RATE_LIMIT=2
```

## API Documentation

### POST /send-bulk

Send bulk emails to recipients from a CSV file.

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | CSV file with recipient data |
| subject | String | Yes | Email subject line |
| template | String | Yes | HTML email template with variables |

**CSV Format**:

```csv
email,name,company
john@example.com,John Doe,Acme Corp
jane@example.com,Jane Smith,Tech Inc
```

**Template Example**:

```html
<h1>Hello {{name}},</h1>
<p>Welcome to {{company}}!</p>
<p>Best regards,<br>The Team</p>
```

**Response**:

```json
{
  "success": true,
  "totalProcessed": 2,
  "success": 2,
  "failed": 0,
  "errors": [],
  "validationWarnings": [],
  "templateWarnings": [],
  "rateLimit": "2 emails/second"
}
```

### GET /health

Check service health and SMTP connection.

**Response**:

```json
{
  "status": "healthy",
  "smtp": {
    "success": true
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Usage Examples

### cURL Example

```bash
curl -X POST http://your-service-url.railway.app/send-bulk \
  -F "file=@recipients.csv" \
  -F "subject=Welcome to Our Service!" \
  -F "template=<h1>Hello {{name}},</h1><p>Thanks for joining {{company}}!</p>"
```

### Create Sample CSV

Create `recipients.csv`:

```csv
email,name,company
alice@example.com,Alice Johnson,Startup Co
bob@example.com,Bob Smith,Tech Solutions
carol@example.com,Carol Davis,Innovation Labs
```

### Send with Template

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@recipients.csv" \
  -F "subject=Personalized Welcome" \
  -F "template=<h2>Hello {{name}},</h2><p>Welcome to {{company}}! We're excited to have you aboard.</p><p>Best regards,<br>The Team</p>"
```

## Gmail SMTP Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
3. Use the app password in your `SMTP_PASS` environment variable

## Error Handling

The service provides detailed error reporting:

- **CSV Validation**: Invalid email addresses, missing required fields
- **Template Validation**: Missing variables in template
- **SMTP Errors**: Connection issues, authentication failures
- **Rate Limiting**: Automatic delays between emails

## Security Considerations

- File upload size limited to 10MB
- Only CSV files accepted
- Input validation on all fields
- Environment variables for sensitive data
- Automatic cleanup of uploaded files

## Monitoring

- Use the `/health` endpoint for monitoring
- Check logs for detailed error information
- Monitor Railway metrics for performance

## Support

For issues and questions:
1. Check the service logs
2. Verify SMTP configuration
3. Test with small CSV files first
4. Use the health check endpoint to verify connectivity

## License

MIT License
