export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function safeCallbackUrl(value: FormDataEntryValue | string | null | undefined): string {
  const url = String(value ?? "/");
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return "/";
}

export function validateRegisterInput(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): string | null {
  if (input.name.length < 2 || input.name.length > 40) {
    return "Имя должно быть от 2 до 40 символов";
  }
  if (!isValidEmail(input.email)) {
    return "Введите корректный email";
  }
  if (input.password.length < 5 || input.password.length > 72) {
    return "Пароль должен быть от 5 до 72 символов";
  }
  if (input.password !== input.confirmPassword) {
    return "Пароли не совпадают";
  }
  return null;
}
