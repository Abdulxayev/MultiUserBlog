import Link from 'next/link';
import { useState, useEffect } from 'react';
import Router from 'next/router';
import { getCookie, isAuth, updateUser } from '../../actions/auth';
import { getProfile, update } from '../../actions/user';
import { API } from '../../config';

const ProfileUpdate = () => {
	const [values, setValues] = useState({
		username: '',
		name: '',
		email: '',
		about: '',
		password: '',
		error: false,
		success: false,
		loading: false,
		photo: '',
		userData: ''
	});
	const token = getCookie('token');
	const { 
		username,
		name,
		email,
		about,
		password,
		error,
		success,
		loading,
		photo,
		userData
		} = values;
	const init () => {
		getProfile(token).then(data => {
			if (data.error) {
				setValues({ ...values, error: data.error });
			} else {
				setValues({
					...values,
					username: data.username,
					name: data.name,
					email: data.email,
					about: data.about
				});
			}
		});
	};

	useEffect(() => {
		init();
	}, []);

	const handleChange = name => e => {
		const value = name === 'photo' ? e.taget.files[0] : e.target.value;
		let userFormData = new FormData();
		userFormData.set(name, value);
		setValues({ 
			...values, 
			[name]: value,
			userData: userFormData,
			error: false,
			success: false 
		});
	};
	const handleSubmit = e => {
		e.preventDefault();
		setValues({ ...values, loading: true });
		update(token, userData).then(data => {
			if (data.error) {
				setValues({ 
					...values,
					error: data.error,
					success: false,
					loading: false 
				});
			} else {
				updateUser(data, () => {
					setValues({
						...values,
						username: data.username,
						name: data.name,
						email: data.email,
						about: data.about,
						password: '',
						success: true,
						loading: false 
					});
				});
			}
		});
	};
	const profileUpdateForm = () => (
		<form onSubmit={handleSubmit}>
			<div className="form-group">
				<label className="btn btn-outline-info">
					Profile Photo
					<input onChange={handleChange('photo')} type="file" accept="image/*" hidden />
				</label>
			</div>
			<div className="form-group">
				<label className="text-muted">User Name </label>
				<input className="form-control" onChange={handleChange('username')} type="text" value={username} />
			</div>
			<div className="form-group">
				<label className="text-muted"> Name</label>
				<input className="form-control" onChange={handleChange('name')} type="text" value={name} />
			</div>
			<div className="form-group">
				<label className="text-muted">Email</label>
				<input className="form-control" onChange={handleChange('email')} type="text" value={email} />
			</div>
			<div className="form-group">
				<label className="text-muted">About</label>
				<textarea className="form-control" onChange={handleChange('about')} type="text" value={about} />
			</div>
			<div className="form-group">
				<label className="text-muted">Password</label>
				<input className="form-control" onChange={handleChange('password')} type="password" value={password} />
			</div>
			<div> 
				<button type="submit" className="btn btn-primary">
					Submit
				</button>
			</div>
		</form>
		);
		const showError = () => (
			<div className="alert alert-dange" style={{ display: error ? '' : 'none' }}> 
				{error}
			</div>
		);
		
		const showSuccess = () => (
			<div className="alert alert-success" style={{ display: success ? '' : 'none' }}>
				Profile Updated
			</div>	
		);

		const showLoading = () => (
			<div className="alert alert-info" style={{ display: loading ? '' : 'none' }}>
				Loading... WAIT PLZ
			</div>	
		);
		return (
			<React.Fragment>
				<div className="container">
					<div className="row">
						<div className="col-md-4">
							<img 
								src={`${API}/user/photo/${username}`}
								className="img img-fluid img-thumbnail mb-3"
								style={{ maxHeight: 'auto', maxWidth: '100%' }}
								alt="User Profile"
							/>
						</div>
						<div className="col-md-8 mb-5">
							{showSuccess()}
							{showError()}
							{showLoading()}
							{profileUpdateForm()}
						</div>
					</div>
				</div>
			</React.Fragment>
			);
};

export default ProfileUpdate;