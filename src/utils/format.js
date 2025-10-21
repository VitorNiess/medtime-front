export const onlyDigits = (v = "") => (v || "").replace(/\D+/g, "");

// 000.000.000-00
export function maskCPF(digits) {
  const d = onlyDigits(digits).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
}

// (00) 00000-0000
export function maskPhoneBR(digits) {
  const d = onlyDigits(digits).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
}

export const EMAIL_REGEX_BASIC = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function isEmailBasic(v = "") {
  return EMAIL_REGEX_BASIC.test(v.trim());
}

export function between(n, min, max) {
  return typeof n === "number" && n >= min && n <= max;
}