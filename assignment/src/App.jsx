import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import LoginPage from './features/auth/LoginPage'
import DestinationsPage from './features/destinations/DestinationsPage'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

function HomeRedirect() {
	const { isAuthenticated } = useAuth()

	return <Navigate replace to={isAuthenticated ? '/destinations' : '/login'} />
}

export default function App() {
	return (
		<Routes>
			<Route element={<HomeRedirect />} path="/" />
			<Route element={<PublicOnlyRoute />}>
				<Route element={<LoginPage />} path="/login" />
			</Route>
			<Route element={<ProtectedRoute />}>
				<Route element={<AppLayout />}>
					<Route element={<DestinationsPage />} path="/destinations" />
				</Route>
			</Route>
			<Route element={<Navigate replace to="/" />} path="*" />
		</Routes>
	)
}
