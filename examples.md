# cURL Examples for Email Service

## Basic Usage

### 1. Health Check

```bash
curl -X GET http://localhost:3000/health
```

### 2. Send Bulk Emails

Create a sample CSV file `recipients.csv`:

```csv
email,name,company
john.doe@example.com,John Doe,Acme Corporation
jane.smith@example.com,Jane Smith,Tech Solutions Inc
bob.wilson@example.com,Bob Wilson,Innovation Labs
```

Send emails with template:

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@recipients.csv" \
  -F "subject=Welcome to Our Platform!" \
  -F "template=<h1>Hello {{name}},</h1><p>Welcome to {{company}}! We're excited to have you on board.</p><p>Best regards,<br>The Team</p>"
```

## Advanced Examples

### 3. Personalized Marketing Campaign

Create `marketing_list.csv`:

```csv
email,first_name,last_name,product
alice@example.com,Alice,Johnson,Premium Plan
bob@example.com,Bob,Smith,Standard Plan
carol@example.com,Carol,Davis,Enterprise Plan
```

Send marketing emails:

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@marketing_list.csv" \
  -F "subject=Special Offer on {{product}}" \
  -F "template=<h2>Hi {{first_name}} {{last_name}},</h2><p>We have a special offer for you on our {{product}}!</p><p>Click here to learn more and claim your discount.</p><p>Cheers,<br>Sales Team</p>"
```

### 4. Event Invitation

Create `guests.csv`:

```csv
email,name,event_name,event_date
sarah@example.com,Sarah Johnson,Annual Conference,2024-03-15
mike@example.com,Mike Wilson,Product Launch,2024-03-20
lisa@example.com,Lisa Brown,Tech Meetup,2024-03-25
```

Send invitations:

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@guests.csv" \
  -F "subject=You're Invited: {{event_name}}" \
  -F "template=<div style='font-family: Arial, sans-serif;'><h1>Dear {{name}},</h1><p>You're cordially invited to our <strong>{{event_name}}</strong> on <strong>{{event_date}}</strong>.</p><p>We'd love to see you there!</p><p>RSVP by clicking the link below.</p><p>Best regards,<br>Event Team</p></div>"
```

### 5. Newsletter with Rich HTML

Create `subscribers.csv`:

```csv
email,name,interests
user1@example.com,John Doe,Technology
user2@example.com,Jane Smith,Business
user3@example.com,Bob Wilson,Design
```

Send newsletter:

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@subscribers.csv" \
  -F "subject=Weekly Newsletter - {{interests}} Edition" \
  -F "template=<html><body style='font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;'><div style='max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'><h1 style='color: #333; text-align: center;'>Hello {{name}},</h1><p style='color: #666; line-height: 1.6;'>Here's your weekly {{interests}} newsletter with the latest updates and insights!</p><div style='background-color: #007bff; color: white; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'><h3>Featured Content</h3><p>Check out this week's top articles and resources.</p></div><p style='color: #666;'>Thank you for being a valued subscriber!</p><p style='text-align: center; margin-top: 30px;'><a href='#' style='background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Read Full Newsletter</a></p></div></body></html>"
```

## Railway Deployment Examples

Replace `http://localhost:3000` with your Railway URL:

```bash
curl -X POST https://your-app-name.railway.app/send-bulk \
  -F "file=@recipients.csv" \
  -F "subject=Welcome!" \
  -F "template=<h1>Hello {{name}},</h1><p>Welcome to our service!</p>"
```

## Error Handling Examples

### Test Invalid CSV

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@invalid.csv" \
  -F "subject=Test" \
  -F "template=Hello {{name}}"
```

### Test Missing Fields

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@recipients.csv" \
  -F "subject=Test"
# Missing template field
```

## Batch Processing

For large CSV files, the service automatically handles rate limiting. You can monitor progress through the response:

```bash
curl -X POST http://localhost:3000/send-bulk \
  -F "file=@large_list.csv" \
  -F "subject=Bulk Campaign" \
  -F "template=<p>Hello {{name}},</p><p>This is part of our bulk campaign.</p>"
```

Expected response for large lists:

```json
{
  "success": true,
  "totalProcessed": 1000,
  "success": 995,
  "failed": 5,
  "errors": [
    {"email": "invalid@email", "error": "Invalid email format"},
    {"email": "bounce@example.com", "error": "SMTP connection failed"}
  ],
  "rateLimit": "2 emails/second"
}
```

## Tips

1. **Test with small lists first** before sending to large audiences
2. **Use the health check endpoint** to verify SMTP configuration
3. **Monitor the response** for failed emails and errors
4. **Keep templates under 25KB** for best performance
5. **Use meaningful variable names** in your CSV for better template readability
