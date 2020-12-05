import { Router, Request, NextFunction } from 'express';
import BoletoController from '../controllers/BoletoController';

const boletoRouter = Router();
const boletoController = new BoletoController;

boletoRouter.get('/:boleto_number', boletoController.boleto);

export default boletoRouter;