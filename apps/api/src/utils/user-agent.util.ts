import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  browser: string;
  browserVersion: string | null;
  os: string;
  osVersion: string | null;
  device: string;
}

export function parseUserAgent(userAgent?: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name ?? 'Unknown';
  const browserVersion = result.browser.version ?? null;

  const os = result.os.name ?? 'Unknown';
  const osVersion = result.os.version ?? null;

  let device = 'Desktop';

  if (result.device.model) {
    device = result.device.model;
  } else if (result.device.type === 'mobile') {
    device = 'Mobile';
  } else if (result.device.type === 'tablet') {
    device = 'Tablet';
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
  };
}
