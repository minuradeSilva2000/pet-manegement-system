import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx'
import { ToastContainer } from "react-toastify";
import { ConfirmDialogProvider } from './components/ConfirmDialog.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfirmDialogProvider>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-center" />
      </BrowserRouter>
    </ConfirmDialogProvider>
  </StrictMode>,
)
