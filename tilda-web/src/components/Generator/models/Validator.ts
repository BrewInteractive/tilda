
export interface Validator {
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
    values?: string[];
    value?: string;
}
