import process from 'node:process';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import safe from '@shared/shared-helpers/safe';
import { ErrorName } from '@shared/shared-enums/error-names';
import controllerBuilder from '../builders/controller-builder/controller-builder';
import {
	type AppMutationEndpointName,
	type AppQueryEndpointName,
} from '../../../shared/shared-enums/endpoint-names';
import { UserModel } from '../models/user-model';
import {
	type MutationControllerHelper,
	type QueryControllerHelper,
} from '../types/controller-helper.types';

// === Get users ===

const getUsersControllerHelper: QueryControllerHelper<
	AppQueryEndpointName.getUsers
> = async (request, response) => {
	const data = await safe({
		value: UserModel.find({}).orFail(),
		async: true,
		errorMessage: 'No users found',
		errorName: ErrorName.notFound,
	});

	return { request, response, data };
};

const getUsersController = controllerBuilder.query({
	controllerHelper: getUsersControllerHelper,
});

// === Get user ===

const getUserControllerHelper: QueryControllerHelper<
	AppQueryEndpointName.getUser
> = async (request, response) => {
	const {
		user: { _id: userId },
	} = request;

	const data = await safe({
		value: UserModel.findById(userId).orFail(),
		async: true,
		errorMessage: 'No user found',
		errorName: ErrorName.notFound,
	});

	return { request, response, data };
};

const getUserController = controllerBuilder.query({
	controllerHelper: getUserControllerHelper,
});

// === Create user ===

const createUserControllerHelper: MutationControllerHelper<
	AppMutationEndpointName.createUser
> = async (request, response) => {
	const {
		body: { email, password },
	} = request;

	const hashedPassword = await safe({
		value: bcrypt.hash(password, 10),
		async: true,
		errorMessage: 'Error hashing password',
		errorName: ErrorName.internalServerError,
	});

	const user = await safe({
		value: UserModel.create({
			email,
			password: hashedPassword,
		}),
		async: true,
		errorMessage: 'Error creating user',
		errorName: ErrorName.internalServerError,
	});

	const token = await safe({
		value: jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
			expiresIn: '7d',
		}),
		async: true,
		errorMessage: 'Error signing token',
		errorName: ErrorName.internalServerError,
	});

	response.cookie('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'none',
		signed: true,
	});

	return { request, response, data: { message: 'User created successfuly' } };
};

const createUserController = controllerBuilder.mutation({
	controllerHelper: createUserControllerHelper,
});

// === Log in ===

const logInControllerHelper: MutationControllerHelper<
	AppMutationEndpointName.logIn
> = async (request, response) => {
	const {
		body: { email, password },
	} = request;

	const user = await safe({
		value: UserModel.findUserByCredentials(email, password),
		async: true,
		errorMessage: 'Invalid email or password',
		errorName: ErrorName.authentication,
	});

	await safe({
		value: bcrypt.compare(password, user.password),
		async: true,
		errorMessage: 'Invalid email or password',
		errorName: ErrorName.authentication,
		test: (isMatch) => isMatch,
	});

	const token = await safe({
		value: jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, {
			expiresIn: '7d',
		}),
		async: true,
		errorMessage: 'Error creating token',
		errorName: ErrorName.internalServerError,
	});

	response.cookie('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'none',
		signed: true,
	});

	return {
		request,
		response,
		data: {
			message: 'User logged in successfuly',
		},
	};
};

const logInController = controllerBuilder.mutation({
	controllerHelper: logInControllerHelper,
});

// === Validate Token ===

const validateTokenControllerHelper: QueryControllerHelper<
	AppQueryEndpointName.validateToken
> = async (request, response) => {
	console.log('request.user._id: ' + request.user._id);

	const user = await safe({
		value: UserModel.findById(request.user._id),
		async: true,
		errorMessage: 'Invalid user ID',
		errorName: ErrorName.notFound,
	});

	return {
		request,
		response,
		data: user,
	};
};

const validateTokenController = controllerBuilder.query({
	controllerHelper: validateTokenControllerHelper,
});

// === Log out ===

const logOutControllerHelper: MutationControllerHelper<
	AppMutationEndpointName.logOut
> = async (request, response) => {
	response.clearCookie('token');

	return {
		request,
		response,
		data: { message: 'User logged out successfuly' },
	};
};

const logOutController = controllerBuilder.mutation({
	controllerHelper: logOutControllerHelper,
});

// === Update profile info ===

const updateProfileInfoControllerHelper: MutationControllerHelper<
	AppMutationEndpointName.updateProfileInfo
> = async (request, response) => {
	const { user, body } = request;

	const data = await safe({
		value: UserModel.findByIdAndUpdate(user._id, body, {
			new: true,
			runValidators: true,
		}).orFail(),
		async: true,
		errorMessage: 'Error updating profile info',
		errorName: ErrorName.notFound,
	});

	return { request, response, data };
};

const updateProfileInfoController = controllerBuilder.mutation({
	controllerHelper: updateProfileInfoControllerHelper,
});

// === Update avatar ===

const updateAvatarControllerHelper: MutationControllerHelper<
	AppMutationEndpointName.updateAvatar
> = async (request, response) => {
	const { user, body } = request;

	const data = await safe({
		value: UserModel.findByIdAndUpdate(user._id, body, {
			new: true,
			runValidators: true,
		}).orFail(),
		async: true,
		errorMessage: 'Error updating avatar',
		errorName: ErrorName.notFound,
	});

	return { request, response, data };
};

const updateAvatarController = controllerBuilder.mutation({
	controllerHelper: updateAvatarControllerHelper,
});

export {
	getUsersController,
	getUserController,
	createUserController,
	logInController,
	logOutController,
	updateProfileInfoController,
	updateAvatarController,
	validateTokenController,
};
