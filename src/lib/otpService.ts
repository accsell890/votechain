// OTP service abstraction.
// To plug a real backend, set VITE_OTP_API_BASE in your environment.
// Endpoints expected:
//   POST {base}/send-otp      body: { phone }
//   POST {base}/verify-otp    body: { phone, otp }
// When VITE_OTP_API_BASE is not set, a local simulated provider is used
// (demo OTP: 123456). This keeps the prototype working out-of-the-box.

const API_BASE = (import.meta as any).env?.VITE_OTP_API_BASE as string | undefined;
const DEMO_OTP = "123456";

const sentAt = new Map<string, number>();
const OTP_TTL_MS = 5 * 60 * 1000;

export interface OtpResult {
  ok: boolean;
  message: string;
}

export async function sendOtp(phone: string): Promise<OtpResult> {
  if (!/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
    return { ok: false, message: "Invalid phone number" };
  }

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, message: data?.message || "Failed to send OTP" };
      return { ok: true, message: data?.message || "OTP sent successfully" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Network error" };
    }
  }

  // Simulated fallback
  await new Promise((r) => setTimeout(r, 800));
  sentAt.set(phone, Date.now());
  return { ok: true, message: `OTP sent successfully (demo: ${DEMO_OTP})` };
}

export async function verifyOtp(phone: string, otp: string): Promise<OtpResult> {
  if (!/^\d{4,8}$/.test(otp)) {
    return { ok: false, message: "Enter a valid OTP" };
  }

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, message: data?.message || "Incorrect OTP" };
      return { ok: true, message: data?.message || "OTP verified" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Network error" };
    }
  }

  // Simulated fallback
  await new Promise((r) => setTimeout(r, 700));
  const ts = sentAt.get(phone);
  if (!ts) return { ok: false, message: "Please request an OTP first" };
  if (Date.now() - ts > OTP_TTL_MS) {
    sentAt.delete(phone);
    return { ok: false, message: "OTP expired. Please resend." };
  }
  if (otp !== DEMO_OTP) return { ok: false, message: "Incorrect OTP" };
  sentAt.delete(phone);
  return { ok: true, message: "OTP verified" };
}

export const isRealOtpEnabled = () => Boolean(API_BASE);

// ============= Email OTP =============
const emailSentAt = new Map<string, number>();

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export async function sendEmailOtp(email: string): Promise<OtpResult> {
  if (!isValidEmail(email)) {
    return { ok: false, message: "Invalid email address" };
  }

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, message: data?.message || "Failed to send OTP" };
      return { ok: true, message: data?.message || "OTP sent to your email" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Network error" };
    }
  }

  await new Promise((r) => setTimeout(r, 800));
  emailSentAt.set(email.toLowerCase(), Date.now());
  return { ok: true, message: `OTP sent to your email (demo: ${DEMO_OTP})` };
}

export async function verifyEmailOtp(email: string, otp: string): Promise<OtpResult> {
  if (!isValidEmail(email)) {
    return { ok: false, message: "Invalid email address" };
  }
  if (!/^\d{4,8}$/.test(otp)) {
    return { ok: false, message: "Enter a valid OTP" };
  }

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, message: data?.message || "Incorrect OTP" };
      return { ok: true, message: data?.message || "Email verified" };
    } catch (e: any) {
      return { ok: false, message: e?.message || "Network error" };
    }
  }

  await new Promise((r) => setTimeout(r, 700));
  const key = email.toLowerCase();
  const ts = emailSentAt.get(key);
  if (!ts) return { ok: false, message: "Please request an OTP first" };
  if (Date.now() - ts > OTP_TTL_MS) {
    emailSentAt.delete(key);
    return { ok: false, message: "OTP expired. Please resend." };
  }
  if (otp !== DEMO_OTP) return { ok: false, message: "Incorrect OTP" };
  emailSentAt.delete(key);
  return { ok: true, message: "Email verified" };
}