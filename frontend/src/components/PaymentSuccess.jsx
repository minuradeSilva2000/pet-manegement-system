import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract data from location state instead of props
  const paymentData = location.state?.paymentData || {};
  const email = location.state?.email || "";
  
  // Extract relevant data from payment response
  const {
    payment = {},
    receiptUrl,
    emailStatus,
    emailError
  } = paymentData;

  const downloadReceipt = () => {
    if (receiptUrl) {
      window.open(receiptUrl, '_blank');
    } else {
      alert('Receipt URL is not available');
    }
  };

  const handleGoHome = () => {
    navigate('/customer/');
  };

  const handleTryEmailAgain = () => {
    // Call the resend email API
    if (!payment || !payment._id) {
      alert('Payment information is missing');
      return;
    }
    
    fetch(`/api/payments/${payment._id}/resend-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'Success') {
          alert('Email sent successfully!');
          // Reload the page to show updated status
          window.location.reload();
        } else {
          alert('Could not send email: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(err => {
        alert('Error trying to resend email: ' + err.message);
      });
  };

  // Check if we have payment data
  if (!payment || Object.keys(payment).length === 0) {
    return (
      <div className="min-h-screen bg-[#fef9ea] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#3d1e24] mb-4">No Payment Data Found</h1>
          <p className="mb-6">We couldn't find your payment information. This might happen if you refresh the page or access it directly.</p>
          <button 
            onClick={handleGoHome}
            className="bg-[#da828f] hover:bg-[#c97380] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fef9ea] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#3d1e24]">Payment Successful!</h1>
          <p className="text-gray-600">Payment ID: {payment.paymentId || "N/A"}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#3d1e24] mb-4">Payment Details</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium">Service:</span>
              <span>{payment.serviceType || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium">Amount:</span>
              <span>LKR{payment.amount?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="font-medium">Date:</span>
              <span>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium">Status:</span>
              <span className="text-green-600 font-medium">{payment.status || "Completed"}</span>
            </div>
          </div>
        </div>

        {emailStatus === 'failed' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  We couldn't send you an email confirmation.
                </p>
                {emailError && <p className="text-xs text-yellow-700 mt-1">{emailError}</p>}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button 
                className="w-full bg-[#da828f] hover:bg-[#c97380] text-white font-medium py-2 rounded-lg transition-colors duration-200"
                onClick={downloadReceipt}
              >
                Download Receipt
              </button>
              <button 
                className="w-full border border-[#da828f] text-[#da828f] hover:bg-[#fef0f2] font-medium py-2 rounded-lg transition-colors duration-200"
                onClick={handleTryEmailAgain}
              >
                Try Sending Email Again
              </button>
            </div>
          </div>
        )}
        
        {emailStatus !== 'failed' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  A confirmation email has been sent to {email || payment.email || "your email address"}.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button 
                className="w-full bg-[#da828f] hover:bg-[#c97380] text-white font-medium py-2 rounded-lg transition-colors duration-200"
                onClick={downloadReceipt}
              >
                Download Receipt
              </button>
            </div>
          </div>
        )}

        <button 
          className="w-full bg-gray-100 hover:bg-gray-200 text-[#3d1e24] font-medium py-3 rounded-lg transition-colors duration-200"
          onClick={handleGoHome}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;