﻿module common {

    export module date {

        /**
        * @desc Returns true if date is not undefined or null or min date.
        */
        export function isValidDate(value: string, validateNineteenHundred: boolean = false): boolean {
            try {
                var retVal = value != null && value.trim().length != 0 && value.trim().length >= 10 && value.substring(0, 4) != '0001';

                if (retVal && validateNineteenHundred) {
                    var a = new Date(value);
                    var b = new Date("01/01/1900");
                    retVal = a > b;
                }

                return retVal;
            } catch (ex) {
                return false;
            }
        }       
    }
}
