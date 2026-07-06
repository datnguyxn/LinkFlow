import nodemailer, { type Transporter } from "nodemailer";

import type {
    MailService,
    SendResetPasswordEmail,
    SendUrlExpirationReminder,
    SendVerificationEmail,
    SendWorkspaceInvitationEmail,
} from "../interfaces/mail.service.ts";

import { config } from "../../../config/env/index.ts";

import { verifyEmailTemplate } from "../templates/verify-email.template.ts";
import { resetPasswordTemplate } from "../templates/reset-password.template.ts";

export class SmtpProvider implements MailService {

    private readonly transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: Number(config.SMTP_PORT),
            secure: config.SMTP_SECURE === "true",

            auth: {
                user: config.SMTP_FROM,
                pass: config.SMTP_PASSWORD,
            },
        });

    }

    async sendVerificationEmail(
        data: SendVerificationEmail,
    ): Promise<void> {

        const verifyUrl =
            `${config.CLIENT_URL}/verify-email?token=${data.verifyToken}`;

        await this.transporter.sendMail({

            from: `"LinkFlow" <${config.SMTP_FROM}>`,

            to: data.email,

            subject: "Verify your email",

            html: verifyEmailTemplate({

                fullName: data.fullName,

                verifyUrl,

            }),

        });

    }

    async sendResetPasswordEmail(
        data: SendResetPasswordEmail,
    ): Promise<void> {

        const resetUrl =
            `${config.CLIENT_URL}/reset-password?token=${data.resetToken}`;

        await this.transporter.sendMail({

            from: `"LinkFlow" <${config.SMTP_FROM}>`,

            to: data.email,

            subject: "Reset your password",

            html: resetPasswordTemplate({

                fullName: data.fullName,

                resetUrl,

            }),

        });

    }

    async sendWorkspaceInvitationEmail(
        data: SendWorkspaceInvitationEmail,
    ): Promise<void> {

        console.log(data);

        // TODO

    }

    async sendUrlExpirationReminder(
        data: SendUrlExpirationReminder,
    ): Promise<void> {

        console.log(data);

        // TODO

    }

}