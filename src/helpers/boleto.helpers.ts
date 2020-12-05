import { FIRST_DATE_BASE, SECOND_DATE_BASE } from '../constants';
import ErrorHandler from '../errorHandlers';

/**
 * 
 * CALCULATES THE EXIRATION DATE BASED ON A FACTOR (TITULOS)
 */
export function calculateExpirationDate(factor: number): String {
    // BOLETO WITHOUT EXPIRATION DATE
    if (factor === 0) return "";

    let dateBase = FIRST_DATE_BASE;
    const today = new Date();

    if (today >= new Date(SECOND_DATE_BASE)) dateBase = SECOND_DATE_BASE;

    let date = new Date(dateBase);
    date.setDate(date.getDate() + factor);

    return date.toISOString().split('T')[0];
};

/**
 * 
 * PARSES THE AMOUNT FROM ANY BOLETO
 */
export function parseAmount(amount: string): String {
    // PARSING TO INT TO REMOVE ALL UNNECESSARY ZEROS AND PUTTING BACK TO STRING FOR EASY MANIPULATION
    amount = parseInt(amount).toString();

    // BOLETO WITHOUT AMOUNT
    if (amount === "0") return "";

    const decimalPlaces = amount.slice(amount.length - 2, amount.length);
    const intAmount = amount.slice(0, amount.length - 2);

    return [intAmount, ",", decimalPlaces].join('');
}

/**
 * 
 * CALCULATES AND VALIDATES THE DV FROM THE FIELDS 1, 2 AND 3 (TITULOS)
 */
export function validateDV123(field: string): Boolean {
    const dv = parseInt(field.charAt(field.length -1));
    const digits = field.slice(0, -1).split("");
    let sum = 0;
    let multiplier = 1;

    sum = digits.reverse().map(Number).reduce((a, b): number => {
        multiplier = multiplier === 1 ? 2 : 1;
        let total = b * multiplier;

        if (total > 9) {
            let totalString = total.toString().split("");

            while (total > 9) {
                total = totalString.map(Number).reduce((a, b): number => {
                    return a + b;
                });
            }
        }

        return a + total;
    }, 0);

    let foundDV = (Math.ceil(sum / 10) * 10) - sum;

    if (foundDV === 10) foundDV = 0;

    return dv === foundDV;
}

/**
 * transform a digitable lines into a barcode (TITULOS)
 */
export function transformToBarcode(fields: Array<string>): String {
    let barcode = "";

    // BANK NUMBER
    barcode += fields[0].substring(0, 3);
    // CURRENCY CODE
    barcode += fields[0].substring(3, 4);
    // BARCODE DV
    barcode += fields[3];
    // EXPIRATION DATE FACTOR
    barcode += fields[4].substring(0, 4);
    // AMOUNT
    barcode += fields[4].substring(4, fields[4].length + 1);
    // FULL BARCODE
    barcode = `${barcode}${fields[0].substr(4).slice(0, -1)}${fields[1].slice(0, -1)}${fields[2].slice(0, -1)}`;

    return barcode;
}

/**
 * decode/separates the digits from a boleto de titulos
 */
export function decodeTituloDigits(boletoNumber: string): Array<any> {
    const field1 = boletoNumber.substring(0, 10);
    const field2 = boletoNumber.substring(10, 21);
    const field3 = boletoNumber.substring(21, 32);
    const field4 = boletoNumber.substring(32, 33);
    const field5 = boletoNumber.substring(33, boletoNumber.length + 1);

    

    return [field1, field2, field3, field4, field5];
}

/**
 * Validates the digits from a boleto de titulo
 */
export function validateTituloDigits(boletoNumber: string): any {
    // DECODE
    const fields = decodeTituloDigits(boletoNumber);

    // VALIDATES THE DV
    const dv1 = validateDV123(fields[0]);
    const dv2 = validateDV123(fields[1]);
    const dv3 = validateDV123(fields[2]);

    if (!dv1 || !dv2 || !dv3) throw new ErrorHandler(400, "INVALID DV");

    // GENERATES THE BARCODE
    const barCode = transformToBarcode(fields);

    // CALCULATES THE EXPIRATION DATE
    const expirationDate = calculateExpirationDate(parseInt(fields[4].substring(0, 4)));

    // GETS THE AMOUNT
    const amount = parseAmount(fields[4].substring(4, fields[4].length + 1));

    return { barCode, amount, expirationDate }
}

/**
 * decode/separates the digits from a boleto de convenio
 */
export function decodeConvenioDigits(boletoNumber: string): Array<string> {
    const dac = boletoNumber.substring(3, 4);
    const field1 = boletoNumber.substring(0, 12);
    const field2 = boletoNumber.substring(12, 24);
    const field3 = boletoNumber.substring(24, 36);
    const field4 = boletoNumber.substring(36, boletoNumber.length + 1);

    
    return [ dac, field1, field2, field3, field4 ];
}

/**
 * CALCULATES AND VALIDATES THE DAC USING MODULO 10 RULES (CONVENIO)
 */
export function validateDAC10(field: string, dac: string): boolean {
    const digits = field.split("");

    let sum = 0;
    let multiplier = 1;

    sum = digits.reverse().map(Number).reduce((a, b): number => {
        multiplier = multiplier === 1 ? 2 : 1;
        let total = b * multiplier;

        if (total > 9) {
            let totalString = total.toString().split("");
            
            total = totalString.map(Number).reduce((a, b): number => {
                return a + b;
            });
        }

        return a + total;
    }, 0);

    let foundDAC = 10 - (sum % 10);

    return parseInt(dac) === foundDAC;
}

/**
 * CALCULATES AND VALIDATES THE DAC USING MODULO 11 RULES (CONVENIO)
 */
export function validateDAC11(field: string, dac: string): boolean {
    const digits = field.split("");

    let sum = 0;
    let multiplier = 2;

    sum = digits.reverse().map(Number).reduce((a, b): number => {
        multiplier = multiplier === 10 ? 2 : multiplier;
        let total = b * multiplier;

        multiplier++;

        return a + total;
    }, 0);

    let foundDAC = sum % 11;

    if (foundDAC === 1) foundDAC = 0;

    return parseInt(dac) === foundDAC;
}

/**
 * Validates the digits from a boleto de convenio
 */
export function validateConvenioDigits(boletoNumber: string): any {
    // DECODE
    const [ dac, field1, field2, field3, field4 ] = decodeConvenioDigits(boletoNumber);

    // GETS THE EFFECT VALUE
    const effectValue = parseInt(field1.substring(2, 3));

    // VALIDATES THE DAC
    let isDacGeneralValid;
    let isDacField1Valid;
    let isDacField2Valid;
    let isDacField3Valid;
    let isDacField4Valid;

    if (effectValue === 6 || effectValue === 7) {
        isDacGeneralValid = validateDAC10(`${field1.slice(0,3)+field1.slice(4).slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`, dac);
        isDacField1Valid = validateDAC10(`${field1.slice(0, -1)}`, field1.charAt(field1.length -1));
        isDacField2Valid = validateDAC10(`${field2.slice(0, -1)}`, field2.charAt(field2.length -1));
        isDacField3Valid = validateDAC10(`${field3.slice(0, -1)}`, field3.charAt(field3.length -1));
        isDacField4Valid = validateDAC10(`${field4.slice(0, -1)}`, field4.charAt(field4.length -1));
    } else if (effectValue === 8 || effectValue === 9) {
        isDacGeneralValid = validateDAC11(`${field1.slice(0,3)+field1.slice(4).slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`, dac);
        isDacField1Valid = validateDAC11(`${field1.slice(0, -1)}`, field1.charAt(field1.length -1));
        isDacField2Valid = validateDAC11(`${field2.slice(0, -1)}`, field2.charAt(field2.length -1));
        isDacField3Valid = validateDAC11(`${field3.slice(0, -1)}`, field3.charAt(field3.length -1));
        isDacField4Valid = validateDAC11(`${field4.slice(0, -1)}`, field4.charAt(field4.length -1));
    }

    if (!isDacGeneralValid || !isDacField1Valid || !isDacField2Valid || !isDacField3Valid || !isDacField4Valid) {
        throw new ErrorHandler(400, "INVALID DAC");
    }

    // GENERATES THE BARCODE
    const barCode = `${field1.slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`;

    // GETS THE AMOUNT
    const amount = parseAmount(barCode.slice(4, 15));

    // EXPIRATION DATE
    // NÃO CONSEGUI ENCONTRAR NA DOCUMENTAÇÃO
    const expirationDate = ""

    return { barCode, amount, expirationDate };
}