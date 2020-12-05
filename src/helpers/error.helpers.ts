import { Response } from 'express';

export function handleError(err: any, res: Response): Response {
    const { statusCode, message } = err;

    return res.status(statusCode).json({
        statusCode,
        message
    })
};