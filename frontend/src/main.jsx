import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId="989853536462-l2ltklq5bf2jddsbmoug3q94hs88dicr.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
)