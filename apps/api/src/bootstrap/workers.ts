import { EmailWorker } from "../workers/mail.worker.ts";
import { SmtpProvider } from "../infrastructure/mail/providers/smtp.provider.ts";

export async function registerWorkers() {

    const smtpProvider = new SmtpProvider();

    const emailWorker = new EmailWorker(
        smtpProvider,
    );

    await emailWorker.start();

}