import { ServerClient } from 'postmark';

import { EmailTransport, SendEmailOptions } from './transporter';

export type PostmarkTransportOptions = {
  serverToken: string;
  useHttps?: boolean;
  requestHost?: string;
  timeout?: number;
};

export class PostmarkTransport implements EmailTransport {
  private client: ServerClient;

  constructor(opts: PostmarkTransportOptions) {
    const { serverToken, ...other } = opts;
    this.client = new ServerClient(serverToken, other);
  }

  sendEmail(options: SendEmailOptions): Promise<any> {
    const body = options.useHtml
      ? {
          HtmlBody: options.content,
        }
      : {
          TextBody: options.content,
        };

    return this.client.sendEmail({
      From: options.from,
      To: options.to,
      Subject: options.subject,
      ...body,
    });
  }
}
