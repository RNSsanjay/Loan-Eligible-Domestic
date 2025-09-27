from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from typing import Dict, Any
import os
from jinja2 import Template

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.base_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    async def send_user_creation_notification(
        self, 
        user_email: str, 
        user_name: str, 
        user_role: str, 
        temporary_password: str,
        created_by_name: str
    ) -> bool:
        """Send simple email notification for new user creation"""
        
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Account Created - Domestic Loan Management</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fffe; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2.5rem; text-align: center; }
                .logo { font-size: 1.8rem; font-weight: bold; margin-bottom: 0.5rem; }
                .content { padding: 2rem; }
                .card { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
                .footer { background: #f3f4f6; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem; }
                .credentials { background: #ecfdf5; border-left: 4px solid #10b981; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px; }
                .login-button { display: inline-block; padding: 14px 28px; margin: 1.5rem 0; border-radius: 8px; background: #10b981; color: white; text-decoration: none; font-weight: 600; text-align: center; transition: all 0.2s; }
                .login-button:hover { background: #059669; transform: translateY(-2px); }
                .welcome-banner { background: linear-gradient(45deg, #d1fae5, #a7f3d0); padding: 1.5rem; border-radius: 12px; text-align: center; margin: 1.5rem 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏦 Domestic Loan Management</div>
                    <div style="font-size: 1.1rem;">Welcome to the Team!</div>
                </div>
                
                <div class="content">
                    <div class="welcome-banner">
                        <h2 style="color: #059669; margin: 0 0 0.5rem 0;">Hello {{ user_name }}!</h2>
                        <p style="margin: 0; color: #065f46; font-size: 1.1rem;">Your account has been successfully created</p>
                    </div>
                    
                    <p style="font-size: 1.1rem; line-height: 1.6;">Welcome to the Domestic Loan Management system! Your account has been created by <strong style="color: #10b981;">{{ created_by_name }}</strong> and is now ready to use.</p>
                    
                    <div class="card">
                        <h3 style="color: #10b981; margin-top: 0; display: flex; align-items: center;">
                            <span style="margin-right: 0.5rem;">👤</span> Account Details
                        </h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #d1fae5;">
                                <td style="padding: 0.75rem 0; font-weight: 600; color: #065f46;">Email:</td>
                                <td style="padding: 0.75rem 0; color: #374151;">{{ user_email }}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #d1fae5;">
                                <td style="padding: 0.75rem 0; font-weight: 600; color: #065f46;">Role:</td>
                                <td style="padding: 0.75rem 0; color: #374151;">{{ user_role|title }}</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.75rem 0; font-weight: 600; color: #065f46;">Status:</td>
                                <td style="padding: 0.75rem 0; color: #10b981; font-weight: 600;">✅ Active</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="credentials">
                        <h4 style="color: #059669; margin-top: 0; display: flex; align-items: center;">
                            <span style="margin-right: 0.5rem;">🔐</span> Your Login Credentials
                        </h4>
                        <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #bbf7d0;">
                            <p style="margin: 0.5rem 0;"><strong>Email:</strong> <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">{{ user_email }}</code></p>
                            <p style="margin: 0.5rem 0;"><strong>Temporary Password:</strong> <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px;">{{ temporary_password }}</code></p>
                        </div>
                        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 1rem; margin-top: 1rem;">
                            <p style="margin: 0; color: #92400e; font-size: 0.9rem;"><strong>⚠️ Important:</strong> You will be asked to change this password on your first login for security purposes.</p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="{{ login_url }}" class="login-button">🚀 Access Your Account</a>
                    </div>
                    
                    <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
                        <h4 style="color: #1e40af; margin-top: 0;">🎉 Getting Started</h4>
                        <p style="margin: 0.5rem 0; color: #1e3a8a;">Your account is now active and ready to use. Log in to start managing domestic loan applications and exploring the system features.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 0.5rem 0;"><strong>© 2025 Domestic Loan Management System</strong></p>
                    <p style="margin: 0.5rem 0;">All rights reserved. This email was sent automatically.</p>
                    <p style="margin: 0.5rem 0; font-size: 0.8rem;">If you have any questions, please contact your system administrator.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            user_name=user_name,
            user_email=user_email,
            user_role=user_role,
            temporary_password=temporary_password,
            created_by_name=created_by_name,
            login_url=f"{self.base_url}/login"
        )
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"Account Created - Domestic Loan Management ({user_role.title()})"
            msg['From'] = self.from_email
            msg['To'] = user_email
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.from_email, user_email, text)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    async def send_password_reset_email(self, user_email: str, user_name: str, reset_token: str) -> bool:
        """Send password reset email"""
        
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Password Reset - Domestic Loan Management</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fffe; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2rem; text-align: center; }
                .logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; }
                .content { padding: 2rem; }
                .button { display: inline-block; padding: 12px 24px; margin: 1rem 0; border-radius: 8px; background: #10b981; color: white; text-decoration: none; font-weight: 500; }
                .button:hover { background: #059669; }
                .footer { background: #f3f4f6; padding: 1rem; text-align: center; color: #6b7280; font-size: 0.875rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🔐 Password Reset</div>
                    <div>Domestic Loan Management</div>
                </div>
                
                <div class="content">
                    <h2 style="color: #1f2937; margin-top: 0;">Hello {{ user_name }}!</h2>
                    
                    <p>You have requested to reset your password for your Domestic Loan Management account.</p>
                    
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="{{ reset_url }}" class="button">Reset Password</a>
                    </div>
                    
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    
                    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                </div>
                
                <div class="footer">
                    <p>© 2025 Domestic Loan Management System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            user_name=user_name,
            reset_url=f"{self.base_url}/reset-password?token={reset_token}"
        )
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Password Reset - Domestic Loan Management"
            msg['From'] = self.from_email
            msg['To'] = user_email
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            text = msg.as_string()
            server.sendmail(self.from_email, user_email, text)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Failed to send password reset email: {str(e)}")
            return False

# Singleton instance
email_service = EmailService()

# Convenience functions
async def send_user_creation_notification(
    email: str, 
    name: str, 
    password: str, 
    role: str, 
    created_by_name: str = "System Admin"
) -> bool:
    """Send email notification for new user creation"""
    try:
        # Check if email service is configured
        if not email_service.smtp_username or not email_service.smtp_password:
            print("Email service not configured - skipping email notification")
            return False
            
        return await email_service.send_user_creation_notification(
            user_email=email,
            user_name=name,
            user_role=role,
            temporary_password=password,
            created_by_name=created_by_name
        )
    except Exception as e:
        print(f"Email notification failed: {str(e)}")
        return False
