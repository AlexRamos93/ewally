import { Request, Response } from 'express';
import { validateTituloDigits, validateConvenioDigits } from '../helpers/boleto.helpers'
import { handleError } from '../helpers/error.helpers';
import ErrorHandler from '../errorHandlers';

export default class BoletoController {
    public async boleto(req: Request, res: Response): Promise<Response> {
        try {
            const boletoNumber = req.params.boleto_number;

            // CHECKS IF THE BOLETO NUMBER ONLY HAS DIGITS
            if (!/^\d+$/.test(boletoNumber)) throw new ErrorHandler(400, "BOLETO NUMBER CAN ONLY BE DIGITS");

            // CHECKS THE LENGTH OF THE NUMBERS
            if (boletoNumber.length < 44) throw new ErrorHandler(400, "BOLETO NUMBER TOO SHORT");

            let result;

            // CHECKS IF IS A BOLETO CONVENIO OR TITULO
            if (boletoNumber.charAt(0) === "8") {
                result = validateConvenioDigits(boletoNumber);
            } else {
                result = validateTituloDigits(boletoNumber);
            }

            return res.status(200).json(result);
        } catch (error) {
            return handleError(error, res);
        }
    }
}