import * as brevo from '@getbrevo/brevo';

interface EmailOptions {
    userEmail: string;
    subject: string;
    htmlContent: string;
    senderName?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    // Validate environment variables
    if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY environment variable is not set');
    }
    
    if (!process.env.APP_EMAIL_ADDRESS) {
        throw new Error('APP_EMAIL_ADDRESS environment variable is not set');
    }

    try {
        
        const apiInstance = new brevo.TransactionalEmailsApi();
        
        
        apiInstance.setApiKey(
            brevo.TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY
        );

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        
        sendSmtpEmail.sender = { 
            email: process.env.APP_EMAIL_ADDRESS,
            name: options.senderName || 'Your App Name'
        };
        sendSmtpEmail.to = [{ email: options.userEmail }];
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.htmlContent;

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent successfully:", response.body.messageId);
        
    } catch (error: any) {
        console.error("Brevo API error details:", {
            message: error.message,
            statusCode: error.status,
            response: error.response?.body,
            stack: error.stack
        });
        
        
        if (error.status === 401) {
            throw new Error("Authentication failed. Please check your Brevo API key.");
        } else if (error.status === 400) {
            throw new Error("Bad request. Check your email parameters.");
        } else if (error.status === 403) {
            throw new Error("Permission denied. Verify your API key permissions.");
        } else {
            throw new Error("Failed to send email: " + error.message);
        }
    }
}