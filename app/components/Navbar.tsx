import React from 'react'
import { Link } from 'react-router'
import { useAuth } from '~/lib/use-auth';

const Navbar = () => {
  const { isAuthenticated, signOut } = useAuth();

  return (
	<nav className='navbar'>
		<Link to="/">
			<p className="text-2xl font-bold text-gradient">RESUMIND</p>
		</Link>
		<div className="flex items-center gap-4">
			<Link to="/upload">
				<p className="primary-button w-fit">Upload Resume</p>
			</Link>
			{isAuthenticated && (
				<button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900">
					Log Out
				</button>
			)}
		</div>
	</nav>
  )
}

export default Navbar
