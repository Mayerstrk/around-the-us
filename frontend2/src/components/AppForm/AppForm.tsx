import {
	type InputHTMLAttributes,
	type SyntheticEvent,
	type ChangeEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { type RoutesPaths } from '../../utills';
import { type InputValues, type InputName } from '../../hooks/hooks-form';

interface AppFormProps {
	header: string;
	name: string;
	formType: FormType;
	values: InputValues;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: SyntheticEvent) => void;
	inputsArray: AppFormInputs;
	submitButtonText: string;
	bottomLinkText?: string;
	bottomLinkPath?: RoutesPaths;
}
interface FormInputOptions extends InputHTMLAttributes<HTMLInputElement> {
	name: InputName;
}

interface FormInputProps {
	options: FormInputOptions;
	formType: FormType;
	values: InputValues;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface SubmitButtonProps {
	buttonText: string;
	formType: FormType;
}

type FormType = 'page' | 'popup';

type AppFormInputs = FormInputOptions[];

function AppForm({
	header,
	name,
	formType,
	onSubmit,
	values,
	onChange,
	submitButtonText,
	inputsArray,
	...props
}: AppFormProps) {
	return (
		<div className="form__wrapper">
			<h1 className={`form__title form__title_type_${formType}`}>{header}</h1>
			<form
				className={`form form_type_${formType}`}
				name={name}
				onSubmit={onSubmit}
			>
				<fieldset className={`form__fieldset form__fieldset_type_${formType}`}>
					{inputsArray.map((inputOptions) => (
						<FormInput
							key={inputOptions.id}
							options={inputOptions}
							formType={formType}
							values={values}
							onChange={onChange}
						/>
					))}
				</fieldset>
				<SubmitButton buttonText={submitButtonText} formType={formType} />
			</form>
			{props.bottomLinkText && props.bottomLinkPath && (
				<Link to={props.bottomLinkPath} className="form__bottom-link">
					{props.bottomLinkText}
				</Link>
			)}
		</div>
	);
}

function FormInput({ options, formType, values, onChange }: FormInputProps) {
	return (
		<div className="form__input-container">
			<input
				type={options.type}
				id={options.id}
				name={options.name}
				className={`form__input form__input_type_${formType} ${options.className}`}
				placeholder={options.placeholder}
				required={options.required}
				minLength={options.minLength}
				maxLength={options.maxLength}
				value={values[options.name] || ''}
				onChange={onChange}
			/>
		</div>
	);
}

function SubmitButton({ buttonText, formType }: SubmitButtonProps) {
	return (
		<button
			type="submit"
			className={`form__button form__button_type_${formType}`}
		>
			{buttonText}
		</button>
	);
}

export { type AppFormInputs };
export default AppForm;
