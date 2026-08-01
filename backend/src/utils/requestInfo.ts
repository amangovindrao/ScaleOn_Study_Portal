import { Request } from 'express';
import { UAParser } from 'ua-parser-js';

export interface ClientInfo {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  country?: string;
  city?: string;
}

/**
 * Extract client network/device info from a request. Country/city are read
 * from CDN/proxy headers when present (e.g. Cloudflare). GeoIP lookup can be
 * layered in later without changing the interface.
 */
export function getClientInfo(req: Request): ClientInfo {
  const forwarded = (req.headers['x-forwarded-for'] as string) ?? '';
  const ipAddress = forwarded.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = (req.headers['user-agent'] as string) ?? 'unknown';

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    ipAddress,
    userAgent,
    browser: [browser.name, browser.version].filter(Boolean).join(' ') || 'unknown',
    os: [os.name, os.version].filter(Boolean).join(' ') || 'unknown',
    device: device.type ?? 'desktop',
    country: (req.headers['cf-ipcountry'] as string) || undefined,
    city: (req.headers['x-vercel-ip-city'] as string) || undefined,
  };
}
