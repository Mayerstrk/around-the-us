import process from 'node:process';
import { type Request, type Response, type NextFunction } from 'express';
import {
	CustomError,
	InternalServerError,
} from '@shared/shared-classes/shared-custom-errors'; // Update the path accordingly

const errorsHandlerMiddleware = (
	error: Error,
	_request: Request,
	response: Response,
	_next: NextFunction,
) => {
	console.error(error);

	// Check if the error is an instance of your CustomError
	if (error instanceof CustomError) {
		console.log('CustomError');
		return response.status(error.status).send({
			message: error.message,
			cause: { message: error.cause?.message, error: error.cause },
		});
	}

	console.log('Unhandled error');

	// If it's not one of the known errors, it's an internal server error
	const internalError = new InternalServerError(
		error.message || 'Unexpected error',
	);
	return response.status(internalError.status).send({
		message:
			process.env.NODE_ENV === 'development'
				? 'unhandled error - ' + internalError.message
				: internalError.message,
	});
};

export default errorsHandlerMiddleware;