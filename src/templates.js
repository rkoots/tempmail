class TemplateService {
  static getRandomSubject() {
    const subjects = [
      "Your Money in 5 Minutes: Smarter Moves for 2026",
      "Stop Losing Money Silently (Do This Instead)",
      "The $1,000 Mistake Most Americans Still Make",
      "Rates Are Changing. Are You?",
      "This Week: Save More, Spend Smarter, Avoid Scams",
      "You're Probably Losing Money Here (Fix It in 10 Minutes)",
      "Before You Spend Another Dollar, Read This",
      "This One Habit Is Costing You Thousands Every Year",
      "Most Americans Miss This Simple Money Move",
      "Your Future Self Is Begging You to Open This",
      "The Quiet Way Your Money Is Shrinking",
      "Are You Making This Common Financial Mistake?",
      "Do This Once. Save Money All Year.",
      "The 5-Minute Fix That Improves Your Finances Instantly",
      "What Smart Money People Are Doing Differently Right Now",
      "You Don't Need More Income. You Need This.",
      "This Week's Money Reset (Don't Skip It)",
      "Your Bank Won't Tell You This. We Will.",
      "Stop Overpaying. Start Keeping More.",
      "The Easiest Way to Feel Less Broke This Month",
      "One Decision Today = More Money Tomorrow",
      "This Tiny Leak Is Draining Your Wallet",
      "Think You're Good With Money? Check This",
      "You're Closer to Financial Stress Than You Think",
      "The Smartest Thing You Can Do With Your Money Today"
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  static getTemplates() {
    return {
      t1: {
        name: "Welcome Email",
        subject: "Welcome to Our Service!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; color: #333; margin-bottom: 30px; }
              .button { background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome {{name}}!</h1>
                <p>We're excited to have you join our community.</p>
              </div>
              <p>Thank you for signing up! Your account has been successfully created and you're ready to get started.</p>
              <div style="text-align: center;">
                <a href="#" class="button">Get Started</a>
              </div>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <div class="footer">
                <p>Best regards,<br>The Team</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      t2: {
        name: "Finance Newsletter",
        subject: "Your Money, Simplified â Smart Moves for This Week",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Finance Newsletter</title>
            <style>
              body { font-family: Georgia, serif; background-color: #f8f9fa; margin: 0; padding: 20px; line-height: 1.6; }
              .newsletter { max-width: 700px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); color: white; padding: 50px 40px; text-align: center; }
              .header h1 { font-size: 36px; margin-bottom: 10px; font-weight: 300; }
              .header .subtitle { font-size: 18px; opacity: 0.9; margin-bottom: 0; }
              .content { padding: 40px; }
              .intro { font-size: 18px; color: #2c3e50; margin-bottom: 40px; line-height: 1.7; border-left: 4px solid #3498db; padding-left: 20px; font-style: italic; }
              .section { margin-bottom: 35px; padding-bottom: 35px; border-bottom: 1px solid #ecf0f1; }
              .section:last-child { border-bottom: none; }
              .section-title { color: #2c3e50; font-size: 24px; margin-bottom: 15px; font-weight: 600; }
              .section-content { color: #555; line-height: 1.7; }
              .highlight { background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
              .action-box { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
              .action-box h4 { margin-bottom: 10px; font-size: 18px; }
              .stats { background-color: #ecf0f1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
              .stats-number { font-size: 36px; font-weight: bold; color: #e74c3c; margin-bottom: 5px; }
              .footer { background-color: #2c3e50; color: white; padding: 30px 40px; text-align: center; }
              .footer p { margin: 5px 0; opacity: 0.8; }
              .emoji { font-size: 20px; margin-right: 8px; }
              .cta { background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="newsletter">
              <div class="header">
                <h1><a href="https://rkoots.github.io/finance/" style="color: white; text-decoration: none;">Your Money, Simplified</a></h1>
                <p class="subtitle">{{month}} Edition | {{company}} Finance</p>
                <p style="margin-top: 15px;">
                  <a href="https://rkoots.github.io/finance/" style="color: white; background-color: rgba(255,255,255,0.2); padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">Visit Finance Hub â¢</a>
                </p>
              </div>
              <div class="content">
                <div class="intro">
                  You don't need another complicated financial strategy. You need a few decisions that actually move the needle.
                  <br><br>
                  Here's what matters right now.
                </div>

                <div class="section">
                  <h3 class="section-title"><span class="emoji">ð¯</span> <a href="https://rkoots.github.io/finance/" style="color: #2c3e50; text-decoration: none;">What's Changing in 2026 (And Why You Should Care)</a></h3>
                  <div class="section-content">
                    Interest rates are expected to gradually decline, which means:
                    <ul style="margin: 15px 0; padding-left: 20px;">
                      <li>Savings account returns may drop</li>
                      <li>Loan refinancing could become attractive</li>
                      <li>Inflation is still hanging around, just enough to quietly eat your purchasing power</li>
                      <li>AI is now embedded in financial tools, helping track spending and detect fraud faster</li>
                    </ul>
                    <div class="highlight">
                      <strong><a href="https://rkoots.github.io/finance/" style="color: inherit; text-decoration: none;">Translation:</a></strong> doing nothing is now an active financial mistake.
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                      <a href="https://rkoots.github.io/finance/" class="cta">Get 2026 Financial Strategy</a>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h3 class="section-title"><span class="emoji">ð¡</span> <a href="https://rkoots.github.io/finance/" style="color: #2c3e50; text-decoration: none;">Smart Move #1: Lock In High Returns While They Exist</a></h3>
                  <div class="section-content">
                    Savings rates won't stay high forever.
                    
                    <div class="action-box">
                      <h4><a href="https://rkoots.github.io/finance/" style="color: white; text-decoration: none;">Action:</a></h4>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Consider fixed-rate options (CDs, bonds)</li>
                        <li>Don't leave excess cash idle</li>
                      </ul>
                      Small optimization here = free money. Literally.
                      <div style="text-align: center; margin-top: 15px;">
                        <a href="https://rkoots.github.io/finance/" class="cta">Find Best Savings Rates</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h3 class="section-title"><span class="emoji">ð³</span> <a href="https://rkoots.github.io/finance/" style="color: #2c3e50; text-decoration: none;">Smart Move #2: Kill Silent Expenses</a></h3>
                  <div class="section-content">
                    Subscriptions, unused apps, random charges.
                    <br><br>
                    People underestimate this. They shouldn't.
                    
                    <div class="action-box">
                      <h4><a href="https://rkoots.github.io/finance/" style="color: white; text-decoration: none;">Action:</a></h4>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Audit last 3 months of transactions</li>
                        <li>Cancel anything you didn't use twice</li>
                      </ul>
                      Even $50/month = $600/year. That's not trivial unless you enjoy donating to Netflix.
                      <div style="text-align: center; margin-top: 15px;">
                        <a href="https://rkoots.github.io/finance/" class="cta">Start Expense Audit</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h3 class="section-title"><span class="emoji">ð¨</span> <a href="https://rkoots.github.io/finance/" style="color: #2c3e50; text-decoration: none;">Smart Move #3: Fraud Is Getting Smarter</a></h3>
                  <div class="section-content">
                    Americans lost $15.9 billion to scams in 2025, and it's rising fast.
                    <br><br>
                    Scams now use:
                    <ul style="margin: 15px 0; padding-left: 20px;">
                      <li>AI voice cloning</li>
                      <li>Personalized messages</li>
                      <li>Real-looking financial alerts</li>
                    </ul>
                    
                    <div class="stats">
                      <div class="stats-number">$15.9B</div>
                      <div>Lost to scams in 2025</div>
                    </div>
                    <div style="text-align: center; margin: 15px 0;">
                      <a href="https://rkoots.github.io/finance/" class="cta">Learn Fraud Protection</a>
                    </div>
                    
                    <div class="action-box">
                      <h4><a href="https://rkoots.github.io/finance/" style="color: white; text-decoration: none;">Action:</a></h4>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Enable 2FA everywhere</li>
                        <li>Never act on urgency messages</li>
                        <li>Verify before clicking anything</li>
                      </ul>
                      Paranoia is now a financial skill.
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h3 class="section-title"><span class="emoji">ð°</span> <a href="https://rkoots.github.io/finance/" style="color: #2c3e50; text-decoration: none;">Smart Move #4: Try "Revenge Saving"</a></h3>
                  <div class="section-content">
                    Yes, that's a real thing now.
                    <br><br>
                    People are cutting unnecessary spending and aggressively saving to regain control of their finances.
                    
                    <div class="action-box">
                      <h4><a href="https://rkoots.github.io/finance/" style="color: white; text-decoration: none;">Action:</a></h4>
                      <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Set a 30-day savings challenge</li>
                        <li>Automate transfers right after paycheck</li>
                      </ul>
                      It works because it removes decision fatigue. Humans are terrible at daily discipline.
                      <div style="text-align: center; margin-top: 15px;">
                        <a href="https://rkoots.github.io/finance/" class="cta">Start Savings Challenge</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="https://rkoots.github.io/finance/" class="cta">Read Full Finance Guide</a>
                  <p style="margin-top: 10px; color: #666; font-size: 14px;">Get more smart money moves every week</p>
                </div>
              </div>
              <div class="footer">
                <p><strong><a href="https://rkoots.github.io/finance/" style="color: white; text-decoration: none;">{{company}} Finance</a></strong></p>
                <p>Making smart money decisions simple</p>
                <div style="margin: 20px 0;">
                  <a href="https://rkoots.github.io/finance/" class="cta">Join Our Finance Community</a>
                </div>
                <p style="font-size: 12px; margin-top: 15px;">Sent to {{name}} | {{date}}</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      t3: {
        name: "Marketing Campaign",
        subject: "Special Offer for {{name}}!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Special Offer</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #fff3cd; margin: 0; padding: 20px; }
              .offer-container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 15px; overflow: hidden; box-shadow: 0 5px 25px rgba(0,0,0,0.2); }
              .header { text-align: center; color: white; padding: 40px 30px; }
              .header h1 { font-size: 36px; margin-bottom: 10px; }
              .content { background-color: white; padding: 40px 30px; }
              .offer-box { background-color: #fff3cd; border: 2px dashed #ffc107; padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; }
              .offer-box h2 { color: #856404; margin-bottom: 15px; }
              .offer-box .price { font-size: 48px; color: #dc3545; font-weight: bold; }
              .features { margin: 30px 0; }
              .features ul { list-style: none; padding: 0; }
              .features li { padding: 10px 0; border-bottom: 1px solid #eee; }
              .features li:before { content: "â"; color: #28a745; font-weight: bold; margin-right: 10px; }
              .cta-section { text-align: center; margin: 30px 0; }
              .cta-button { background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-size: 18px; font-weight: bold; display: inline-block; }
              .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; }
              .timer { background-color: #dc3545; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="offer-container">
              <div class="header">
                <h1>Exclusive Offer!</h1>
                <p>Limited time deal just for you, {{name}}!</p>
              </div>
              <div class="timer">
                â° Offer expires in 24 hours!
              </div>
              <div class="content">
                <div class="offer-box">
                  <h2>Premium Plan - {{company}}</h2>
                  <div class="price">$9.99/month</div>
                  <p>Save 50% for the first 3 months!</p>
                </div>
                <div class="features">
                  <ul>
                    <li>Unlimited access to all features</li>
                    <li>Priority customer support</li>
                    <li>Advanced analytics dashboard</li>
                    <li>Custom integrations</li>
                    <li>Monthly exclusive content</li>
                  </ul>
                </div>
                <div class="cta-section">
                  <a href="#" class="cta-button">Claim Your 50% Discount!</a>
                  <p style="margin-top: 15px; color: #666;">No credit card required</p>
                </div>
              </div>
              <div class="footer">
                <p>This special offer is exclusively for {{name}} from {{company}}</p>
                <p>Questions? Reply to this email or contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      t4: {
        name: "Event Invitation",
        subject: "You're Invited: {{event}}!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Event Invitation</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #e8f5e8; margin: 0; padding: 20px; }
              .invitation { max-width: 650px; margin: 0 auto; background-color: white; border-radius: 15px; overflow: hidden; box-shadow: 0 3px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #11998e, #38ef7d); color: white; padding: 50px 30px; text-align: center; position: relative; }
              .header::before { content: "ð"; font-size: 60px; position: absolute; top: 20px; left: 30px; opacity: 0.3; }
              .header::after { content: "ð"; font-size: 60px; position: absolute; bottom: 20px; right: 30px; opacity: 0.3; }
              .event-details { background-color: #f8f9fa; padding: 30px; text-align: center; }
              .event-details h2 { color: #11998e; margin-bottom: 20px; }
              .detail-item { display: inline-block; margin: 10px 20px; padding: 15px; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
              .detail-item strong { color: #333; display: block; margin-bottom: 5px; }
              .content { padding: 40px 30px; }
              .rsvp-section { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; }
              .rsvp-button { background-color: white; color: #667eea; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 15px 0; }
              .footer { background-color: #f8f9fa; padding: 25px 30px; text-align: center; color: #666; }
              .calendar-icon { font-size: 24px; margin-right: 10px; }
            </style>
          </head>
          <body>
            <div class="invitation">
              <div class="header">
                <h1>You're Invited!</h1>
                <p>Dear {{name}}, we'd love to see you there!</p>
              </div>
              <div class="event-details">
                <h2>{{event}}</h2>
                <div class="detail-item">
                  <strong><span class="calendar-icon">ð</span>Date</strong>
                  {{date}}
                </div>
                <div class="detail-item">
                  <strong><span class="calendar-icon">â°</span>Time</strong>
                  {{time}}
                </div>
                <div class="detail-item">
                  <strong><span class="calendar-icon">ð</span>Location</strong>
                  {{location}}
                </div>
              </div>
              <div class="content">
                <p>Join us for an unforgettable {{event}} hosted by {{company}}! This is a fantastic opportunity to connect, learn, and celebrate with our amazing community.</p>
                
                <h3>What to Expect:</h3>
                <ul>
                  <li>Networking opportunities with industry professionals</li>
                  <li>Insightful presentations and workshops</li>
                  <li>Delicious refreshments and entertainment</li>
                  <li>Exclusive giveaways and prizes</li>
                </ul>

                <div class="rsvp-section">
                  <h3>RSVP by {{rsvp_date}}</h3>
                  <p>Your spot is reserved, but please confirm your attendance!</p>
                  <a href="#" class="rsvp-button">Confirm Attendance</a>
                </div>
              </div>
              <div class="footer">
                <p>We're excited to welcome you to {{event}}!</p>
                <p>Warm regards,<br>The {{company}} Team</p>
                <p style="font-size: 12px; margin-top: 15px;">Can't make it? Let us know by replying to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      t5: {
        name: "Simple Notification",
        subject: "Notification: {{subject}}",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notification</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
              .notification { max-width: 500px; margin: 0 auto; background-color: white; border-left: 5px solid #007bff; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { background-color: #007bff; color: white; padding: 20px 25px; }
              .content { padding: 25px; }
              .message { color: #333; line-height: 1.6; margin-bottom: 20px; }
              .footer { background-color: #f8f9fa; padding: 15px 25px; color: #666; font-size: 14px; border-top: 1px solid #eee; }
              .priority { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
              .priority.high { background-color: #dc3545; color: white; }
              .priority.medium { background-color: #ffc107; color: #333; }
              .priority.low { background-color: #28a745; color: white; }
            </style>
          </head>
          <body>
            <div class="notification">
              <div class="header">
                <h2>Notification</h2>
                <p>{{company}} - {{department}}</p>
              </div>
              <div class="content">
                <span class="priority {{priority}}">{{priority}} priority</span>
                <div class="message">
                  <p>Hi {{name}},</p>
                  <p>{{message}}</p>
                  <p>{{details}}</p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="{{action_url}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px;">{{action_text}}</a>
                </div>
              </div>
              <div class="footer">
                <p>Sent on {{date}} | {{company}} Team</p>
              </div>
            </div>
          </body>
          </html>
        `
      }
    };
  }

  static getTemplate(templateId) {
    const templates = this.getTemplates();
    return templates[templateId];
  }

  static processTemplate(templateId, variables = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let processedHtml = template.html;
    let processedSubject = template.subject;

    // For finance newsletter (t2), generate random subject
    if (templateId === 't2') {
      processedSubject = this.getRandomSubject();
    }

    // Replace variables in both HTML and subject
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = variables[key] || '';
      processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), value);
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      subject: processedSubject,
      html: processedHtml
    };
  }

  static listTemplates() {
    const templates = this.getTemplates();
    return Object.keys(templates).map(id => ({
      id,
      name: templates[id].name,
      subject: templates[id].subject
    }));
  }
}

module.exports = TemplateService;
