import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

export const meta = () => {
	return [
		{title: 'Resumind - Auth'},
		{name: 'description', content: 'Authenticate to access your resumes and feedback'}
	];
}

const auth = () => {

  const { isLoading, auth } = usePuterStore();
  const location = useLocation();

  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
		if (auth.isAuthenticated) {
			// Redirect to home if already authenticated
			navigate(next, { replace: true });
		}
	}, [auth.isAuthenticated, navigate, next]);

  return (
	<main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center bg-no-repeat min-h-screen flex items-center justify-center">
		<div className='gradient-border shadow-lg'>
			<section className='flex flex-col gap-8 bg-white rounded-2xl p-10'>
				<div className='flex flex-col items-center gap-2 text-center'>
					<h1>Welcome</h1>
					<h2>Log in to continue your job journey</h2>
				</div>
				<div>
					{isLoading ? (
						<button className='auth-button animate-pulse' onClick={auth.signOut}>
							<p>Signin you in...</p>
						</button>
					) : (
						<>	
							{auth.isAuthenticated ? (
								<button className='auth-button' onClick={auth.signOut}>
									<p>Log Out</p>
								</button>
							) 
								:
							(
								<button className='auth-button' onClick={auth.signIn}>
									<p>Log In</p>
								</button>
							)}
						</>
					)}
				</div>
			</section>
		</div>
	</main>
  )
}

export default auth