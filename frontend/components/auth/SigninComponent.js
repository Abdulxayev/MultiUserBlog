import { useState, useEffect } from 'react';
import { signin, authenticate, isAuth } from '../../actions/auth';
import Router from 'next/router';
import Link from 'next/link';
import LoginGoogle from './LoginGoogle';

const SigninComponent = () => {
	const [values, setValues] = useState({
		email: 'kalilinuxacer@gmail.com',
		password: 'sayhello',
		error: '',
		loading: false,
		message: '',
		showForm: true
	});
	const {
		email,
		password,
		error,
		loading,
		messagem
		showForm
	} = values;
	useEffect(() => {
		isAuth() && Router.push(`/`);
	}, []);

	const handleSubmit = e => {
		e.preventDefault();
		setValues({
			...values,
			loading: true,
			error: false
		});
		const user = { email, password };

		signin(user).then(data => {
			if (data.error) {
				setValues({
					...values,
					error: data.error,
					loading: false 
				});
			} else {
				authenticate(data, () => {
					if (isAuth() && isAuth().role === 1) {
						Router.push(`/admin`);
					} else {
						Router.push(`/user`);
					}
				});
			}
		});
	};

	const handleChange = name => e => {
		setValues({
			...values, 
			error: false,
			[name]: e.target.value 
		});
	};
	const showLoading = () => (
		loading ? <div className="alert alert-info">Loading...</div> : ''
		);
	const showError = () => (error ? <div className="alert alert-dange"> {error}</div> : '');
	const showMessage = () => (message ? <div className="alert alert-info">{message}</div> : '');

	const signinForm = () => {
		return (
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<input 
						value={email}
						onChange={handleChange('email')}
						type="email"
						className="form-control"
						placeholder="Type here your Email"
					/>
				</div>

				<div className="form-group">
					<input
						value={password}
						onChange={handleChange('password')}
						type="password"
						className="form-control"
						placeholder="Type your password"
					/>
				</div>
				<div>
					<button className="btn btn-primary">Sign In</button>
				</div>
			</form>
			);
	};
	return (
		<React.Fragment>
			{showError()}
			{showLoading()}
			{showMessage()}
			<LoginGoogle />
			{showForm && signinFOrm()}
			<br />
			<Link href="/auth/password/forgot">
				<a className="btn btn-outline-danger btn-sm">Forgot Password! Help Me PLZ</a>
			</Link>
		</React.Fragment>
		);
};

export default SigninComponent;
