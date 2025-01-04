import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../utils/api-error';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message
        });
    }

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};
