import { headers } from "next/headers";

// Brute-force login protection thresholds.
// Ticket: block account/IP after 3-5 failed attempts (ISO 27001:2022 A.8.5,
// NIST PR.AC-7, OWASP ASVS V3.2). Values below are the defaults; adjust here
// if the security team asks for a different threshold or lockout duration.
export const MAX_ATTEMPTS_USER = 5; // failed OTP validations before locking the account
export const USER_WINDOW_MINUTES = 15; // window in which those failures are counted
export const LOCKOUT_MINUTES = 15; // how long the automatic lockout lasts

export const MAX_ATTEMPTS_IP = 15; // failed attempts from one IP before throttling it
export const IP_WINDOW_MINUTES = 15; // shared IPs (clinics, offices) need more headroom than a single account

// Secondary OTP endpoints (code send, block-status lookup) accept a raw
// id/accessId with no session to prove ownership. These can't be locked down
// to "only the owner" without a larger auth redesign, so they're throttled by
// IP instead — tight enough to stop scripted OTP-spam/enumeration, loose
// enough not to bother a real user retrying a typo.
export const MAX_CODE_REQUESTS_IP = 5;
export const CODE_REQUEST_WINDOW_MINUTES = 10;
export const MAX_STATUS_CHECKS_IP = 15;
export const STATUS_CHECK_WINDOW_MINUTES = 10;

export async function getClientIp() {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}
