export const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Rules = Record<string, { required?: string; pattern?: [RegExp, string] }>;

/** 규칙에 맞지 않는 필드만 { 필드: 메시지 }로 돌려준다. */
export function validate(values: Record<string, string>, rules: Rules): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = (values[field] ?? "").trim();
    if (!value) {
      if (rule.required) errors[field] = rule.required;
      continue;
    }
    if (rule.pattern && !rule.pattern[0].test(value)) errors[field] = rule.pattern[1];
  }
  return errors;
}
