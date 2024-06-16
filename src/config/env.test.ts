import { env } from './env';

describe('array contain', () => {
  it('should read settings from env', () => {
    process.env.MQTT_URL = 'some-url';
    const settings = {
      mqtt: {
        url: 'mqtt://localhost:1883',
        username: 'admin',
        password: 'admin',
      },
    };
    expect(env(settings).mqtt.url).toBe('some-url');
  });
});
