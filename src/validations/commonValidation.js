/**
 * Shared validation helpers for Customer Frontend
 */

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  return /^(?:\+91[\-\s]?)?[6-9]\d{9}$/.test(phone.trim());
};

export const isValidIndianPin = (pin) => {
  if (!pin || typeof pin !== "string") return false;
  return /^\d{6}$/.test(pin.trim());
};

export const sanitizeString = (val) => {
  return typeof val === "string" ? val.trim() : "";
};

