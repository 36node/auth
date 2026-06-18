import { EmailTransport } from './transporter';

/** No-op transport for CI and local dev when outbound email is not needed. */
export class BlackholeTransport implements EmailTransport {
  sendEmail(): Promise<void> {
    return Promise.resolve();
  }
}
