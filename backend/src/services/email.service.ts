import { env } from '@/config/env';

/**
 * Email architecture (no templates yet — those arrive in a later prompt).
 *
 * A provider-agnostic interface so the rest of the system enqueues emails by
 * intent. The default `console` provider logs payloads; SMTP / API providers
 * can be added by implementing EmailProvider and swapping `provider` below.
 */

export type EmailKind =
  | 'WELCOME'
  | 'CREDENTIALS'
  | 'PASSWORD_RESET'
  | 'ANNOUNCEMENT'
  | 'CERTIFICATE'
  | 'REMINDER';

export interface EmailMessage {
  to: string;
  kind: EmailKind;
  subject: string;
  /** Structured data a template will later render. */
  data: Record<string, unknown>;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

/** Default provider: logs to console. Safe for dev and CI. */
class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    // eslint-disable-next-line no-console
    console.info(
      `[email:${message.kind}] -> ${message.to} | subject="${message.subject}" | data=${JSON.stringify(message.data)}`
    );
  }
}

function resolveProvider(): EmailProvider {
  switch (env.email.provider) {
    // case 'smtp': return new SmtpEmailProvider();  // wired in a later prompt
    default:
      return new ConsoleEmailProvider();
  }
}

const provider = resolveProvider();

/** Queue/send an email. Currently sends inline; can be moved to a queue later. */
export async function sendEmail(message: EmailMessage): Promise<void> {
  await provider.send(message);
}

// Intent helpers — keep call sites declarative and template-ready.
export const Emails = {
  credentials(to: string, data: { fullName: string; username: string; password: string; scaleonId: string; loginUrl: string }) {
    return sendEmail({ to, kind: 'CREDENTIALS', subject: 'Your ScaleOn account credentials', data });
  },
  welcome(to: string, data: { fullName: string; scaleonId: string }) {
    return sendEmail({ to, kind: 'WELCOME', subject: 'Welcome to ScaleOn', data });
  },
  passwordReset(to: string, data: { fullName: string; resetUrl: string; expiresInMinutes: number }) {
    return sendEmail({ to, kind: 'PASSWORD_RESET', subject: 'Reset your ScaleOn password', data });
  },
};
