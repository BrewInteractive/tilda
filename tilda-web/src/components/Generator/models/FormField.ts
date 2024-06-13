import { FormConst } from "./FormConst";
import { FormValidator } from "./FormValidator";

export interface FormField {
    name: string;
    label: string;
    inputName: string;
    const: FormConst[];
    validators: FormValidator[];
}
