def get_contact_email_template(name: str, email: str, subject: str, message: str) -> str:
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; max-width: 600px; color: #333;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-top: 0;">New Inquiry from Shnoor Platform</h2>
        <div style="margin-top: 20px;">
            <p style="margin: 8px 0;"><strong>Sender Name:</strong> {name}</p>
            <p style="margin: 8px 0;"><strong>Sender Email:</strong> {email}</p>
            <p style="margin: 8px 0;"><strong>Topic:</strong> {subject}</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin-top: 25px; border-left: 4px solid #3b82f6;">
            <p style="margin-top: 0;"><strong>Message Content:</strong></p>
            <p style="line-height: 1.6; color: #4b5563;">{message}</p>
        </div>
        <p style="font-size: 11px; color: #9ca3af; margin-top: 30px;">This inquiry was generated from the Shnoor Trade Intelligence contact form.</p>
    </div>
    """

def get_password_reset_template(full_name: str, reset_link: str) -> str:
    return f"""
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 15px; max-width: 550px; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Assistance</h2>
        <p>Greetings {full_name},</p>
        <p>We've received a request to reset your access credentials for the Shnoor Trade Intelligence platform. If you made this request, please click the button below:</p>
        <div style="margin: 35px 0; text-align: center;">
            <a href="{reset_link}" 
               style="background-color: #3b82f6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; transition: background-color 0.2s;">
               Set New Password
            </a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Note: If you did not initiate this request, you can ignore this communication. Your current password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;">
        <p style="color: #94a3b8; font-size: 11px;">Best Regards,<br>The Shnoor Security Team</p>
    </div>
    """
