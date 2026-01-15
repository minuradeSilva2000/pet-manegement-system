import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import paymentService from "../services/paymentService";
import { toast } from "react-toastify";

const MakePayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-filled data from URL
  const serviceType = searchParams.get("serviceType") || "Appointment";
  const amount = Number(searchParams.get("amount")) || 5463;
  const userName = searchParams.get("userName") || "";

  const [formData, setFormData] = useState({
    // Service details
    name: userName,
    email: "",
    serviceType: serviceType,
    amount: amount,
    paymentMethod: "Credit Card",

    // Payment details
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
  });

  const [errors, setErrors] = useState({});

  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");

  // Regex for validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const amountRegex = /^(?!0(\.0{1,2})?$)\d+(\.\d{1,2})?$/;
  const cardNumberRegex = /^\d{16}$/;
  const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvvRegex = /^\d{3}$/;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};

    // Validate service details
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";
    console.log("Amount value and type:", formData.amount, typeof formData.amount);
    if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = "Invalid amount";
    }

    // Validate payment details
    if (!cardNumberRegex.test(formData.cardNumber)) {
      newErrors.cardNumber = "Invalid card number (16 digits)";
    }
    if (!cvvRegex.test(formData.cvv)) {
      newErrors.cvv = "Invalid CVV (3 digits)";
    }
    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = "Cardholder name required";
    }
    
    // Validate expiry month and year
    if (!expiryMonth || !expiryYear) {
      newErrors.expiryDate = "Expiry month and year required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        console.log("Form is valid, preparing payment data");
        const paymentData = {
          ...formData,
          expiryDate: `${expiryMonth}/${expiryYear}`,
          status: "Pending",
        };
        
        console.log("Payment data prepared:", paymentData);
        console.log("Sending payment request to backend...");
        
        const response = await paymentService.createPayment(paymentData);
        console.log("Payment response received:", response);
        
        // Handle PDF download
        if (response.pdfBuffer) {
          try {
            console.log("PDF buffer available, downloading...");
            const pdfData = atob(response.pdfBuffer);
            const pdfArray = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {
              pdfArray[i] = pdfData.charCodeAt(i);
            }
            
            const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `payment-receipt-${response.payment.paymentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
            console.log("PDF downloaded successfully");
          } catch (err) {
            console.error('PDF download error:', err);
            toast.error('Failed to download PDF receipt. You can download it later from the payment confirmation page.');
          }
        }

        // Show appropriate success message based on email status
        if (response.emailStatus === "failed") {
          toast.warning("Payment successful! However, we couldn't send the email receipt. You can download it now or request it later.");
        } else {
          toast.success("Payment successful! A receipt has been sent to your email.");
        }

        // Navigate to success page with payment data
        navigate("/customer/payment-success", { 
          state: { 
            paymentData: response,
            email: formData.email // Pass email to success page
          } 
        });
        
      } catch (error) {
        console.error("Payment error:", error);
        toast.error(error.message || "Payment failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Validation errors:", errors);
      toast.error("Please fix the errors in the form before submitting.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fef9ea] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl grid grid-cols-2 overflow-hidden">
        {/* Service Details Column */}
        <div className="bg-[#f8f4e6] p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-[#3d1e24]">Service Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                placeholder="Enter your name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                placeholder="Enter your email"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">Service Type</label>
              <input
                type="text"
                name="serviceType"
                value={formData.serviceType}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 focus:outline-none"
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>
          </div>
        </div>

        {/* Payment Details Column */}
        <div className="p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-[#3d1e24]">Payment Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3d1e24] mb-2">Expiry Month</label>
                <select
                  name="expiryMonth"
                  value={expiryMonth}
                  onChange={e => setExpiryMonth(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                >
                  <option value="">MM</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={String(i+1).padStart(2, '0')}>
                      {String(i+1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3d1e24] mb-2">Expiry Year</label>
                <select
                  name="expiryYear"
                  value={expiryYear}
                  onChange={e => setExpiryYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                >
                  <option value="">YY</option>
                  {Array.from({length: 10}, (_, i) => {
                    const year = (new Date().getFullYear() + i) % 100;
                    return (
                      <option key={year} value={String(year).padStart(2, '0')}>
                        {String(year).padStart(2, '0')}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                placeholder="123"
              />
              {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3d1e24] mb-2">Cardholder Name</label>
              <input
                type="text"
                name="cardHolderName"
                value={formData.cardHolderName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da828f]"
                placeholder="John Doe"
              />
              {errors.cardHolderName && <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#da828f] hover:bg-[#c97380]'
              } transition-colors duration-200`}
            >
              {isSubmitting ? 'Processing Payment...' : 'Pay Now'}
            </button>
            {Object.keys(errors).length > 0 && (
              <div className="text-red-600 text-center mt-2">
                Please fix the errors above before submitting.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakePayment;