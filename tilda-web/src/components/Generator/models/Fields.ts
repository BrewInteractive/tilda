import { Constant } from "./Constant";
import { Ui } from "./Ui";
import { Validator } from "./Validator";

export interface Fields {
    [key: string]: {
        inputName: string;
        ui: Ui;
        const: Constant;
        validators: Validator[];
    };
}
