import { Router } from 'express';
import boletoRouter from './boleto.routes';

const routes = Router();

routes.use('/boleto', boletoRouter);

export default routes;