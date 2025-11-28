

type User = {
    username: string,
    id: string
}


export const generateVerificationEmailTemplate = (user: User, verificationToken: string) => {
    const link = `${process.env.CLIENT_DOMAIN}/users/${user.id}/verify/${verificationToken}`;
    const template = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f97316; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">🍳 Wasfa</h1>
                    </div>
                    <div style="padding: 30px; background-color: #f9f9f9;">
                        <h2 style="color: #333;">Welcome to Wasfa, ${user.username}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Thank you for joining our cooking community! To complete your registration and start exploring amazing recipes, please verify your email address.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${link}" 
                               style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                Verify Email Address
                            </a>
                        </div>
                        <p style="color: #666; font-size: 14px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="${link}" style="color: #f97316;">${link}</a>
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            This verification link will expire in 24 hours.
                        </p>
                    </div>
                    <div style="background-color: #333; padding: 20px; text-align: center;">
                        <p style="color: #999; margin: 0; font-size: 12px;">
                            © 2025 Wasfa. All rights reserved.
                        </p>
                    </div>
                </div>
            `
            return template;
}