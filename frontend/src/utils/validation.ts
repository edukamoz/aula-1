// Valida email usando regex
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valida nome (minimo 3 caracteres)
export function validateName(name: string): boolean {
  return name.trim().length >= 3;
}

// Valida CEP (8 dígitos)
export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.length === 8;
}

// Valida número (não vazio)
export function validateNumber(number: string): boolean {
  return number.trim().length > 0;
}
