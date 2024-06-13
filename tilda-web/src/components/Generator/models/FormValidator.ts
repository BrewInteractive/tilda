export interface FormValidator {
    factory: "alpha" |
    "numeric" |
    "alphanumeric" |
    "regex" |
    "length" |
    "notEmpty" |
    "enum";
    minLength?: number;
    maxLength?: number;
    onMatch?: "fail" | "pass";
    enumValues?: string[];
    regex?: string;
}
