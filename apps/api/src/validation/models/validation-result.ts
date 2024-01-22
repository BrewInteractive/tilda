export class ValidationResult {
  success: boolean;
  errors?: { path: string; message: string }[];
}
