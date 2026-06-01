import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' //  Router Engine Import Kiya
import { AuthProvider } from './context/AuthContext' // Security Hub Import Kiya
import App from './App'
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
// main.jsx
<AuthProvider>
    <BrowserRouter>
        <App />
    </BrowserRouter>
</AuthProvider>
)