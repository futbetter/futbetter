import crypto from "crypto";

export interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
}

const ALLOWED_KEYS = ["auth_date", "first_name", "id", "last_name", "photo_url", "username"] as const;

/**
 * Verifies the payload sent back by the Telegram Login Widget.
 * https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(data: Record<string, unknown>): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("[telegram] TELEGRAM_BOT_TOKEN is not configured");
    return false;
  }

  const hash = data.hash as string | undefined;
  if (!hash) {
    console.error("[telegram] No hash provided in telegram auth payload");
    return false;
  }

  // Telegram specs: only non-empty, allowed fields, sorted alphabetically
  const checkString = (ALLOWED_KEYS as readonly string[])
    .filter((k) => {
      const val = data[k];
      return val !== undefined && val !== null && String(val).trim().length > 0;
    })
    .sort()
    .map((k) => `${k}=${data[k]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (computedHash !== hash) {
    console.error("[telegram] Hash mismatch", { computedHash, hash, checkString });
    return false;
  }

  // auth_date must be recent (within 1 day) to prevent replay attacks
  const authDate = parseInt(String(data.auth_date), 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(authDate) || now - authDate > 86400) {
    console.error("[telegram] auth_date is stale or invalid", { authDate, now });
    return false;
  }

  return true;
}
