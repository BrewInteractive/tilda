import { FormHook } from "./FormHook";

export interface FormHooks {
    pre: FormHook[];
    post: FormHook[];
}
