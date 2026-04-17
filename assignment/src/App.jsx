import './App.css'

export default function App() {
	return (
		<main className="app-shell">
			<section className="status-card">
				<p className="eyebrow">Authentication Architecture</p>
				<h1>Axios interceptor with queued 401 refresh flow is ready.</h1>
				<p>
					Configure <strong>VITE_API_DOMAIN</strong>, then import the shared client from
					<code> src/api/authClient.js</code> for protected API requests.
				</p>
			</section>
		</main>
	)
}
