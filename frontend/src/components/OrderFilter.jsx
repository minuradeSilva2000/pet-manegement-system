import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const OrderFilter = ({ onFilterApply }) => {
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showReportOptions, setShowReportOptions] = useState(false);
    const [reportType, setReportType] = useState('orders');
    const [reportFormat, setReportFormat] = useState('pdf');
    const [includeLogo, setIncludeLogo] = useState(true);
    const [customMessage, setCustomMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const orderStatuses = [
        'Pending', 
        'Processing', 
        'Shipped', 
        'Delivered', 
        'Cancelled'
    ];

    const paymentStatuses = [
        'Paid', 
        'Pending', 
        'Failed'
    ];

    const reportTypes = [
        'orders',
        'revenue',
        'products'
    ];

    const reportFormats = [
        'pdf',
        'csv',
        'excel'
    ];

    const handleApplyFilter = () => {
        const filters = {
            orderStatus,
            paymentStatus,
            dateFrom,
            dateTo
        };
        onFilterApply(filters);
    };

    const handleResetFilter = () => {
        setOrderStatus('');
        setPaymentStatus('');
        setDateFrom('');
        setDateTo('');
        onFilterApply(null);
    };

    const toggleReportOptions = () => {
        setShowReportOptions(!showReportOptions);
    };

    const handleGenerateReport = async () => {
        // Validate date inputs if provided
        if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
            toast.warning('Please select both start and end dates for the report');
            return;
        }

        setIsGenerating(true);
        
        try {
            // Create report request payload
            const reportRequest = {
                type: reportType,
                format: reportFormat,
                filters: {
                    orderStatus: orderStatus || null,
                    paymentStatus: paymentStatus || null,
                    dateFrom: dateFrom || null,
                    dateTo: dateTo || null
                },
                options: {
                    includeLogo,
                    customMessage: customMessage || null
                }
            };
            
            console.log('Sending report request:', reportRequest);
            
            // API call to generate report
            const response = await axios.post('/api/reports/generate', reportRequest, {
                responseType: 'blob' 
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Set filename based on report type and date
            const date = new Date().toISOString().split('T')[0];
            const extension = reportFormat === 'excel' ? 'xlsx' : reportFormat;
            link.setAttribute('download', `${reportType}-report-${date}.${extension}`);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
        } catch (error) {
            console.error("Error generating report:", error);
            if (error.response) {
                console.error("Server responded with:", error.response.status);
                toast.error(`Server error: ${error.response.status}. Please check server logs.`);
            } else if (error.request) {
                console.error("No response received:", error.request);
                toast.error('No response from server. Check network connection.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Filters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Order Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                    </label>
                    <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        className="w-full border border-pink-300 rounded px-2 py-1"
                    >
                        <option value="">All Statuses</option>
                        {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                    </label>
                    <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full border border-pink-300 rounded px-2 py-1"
                    >
                        <option value="">All Payment Statuses</option>
                        {paymentStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date From Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full border border-pink-300 rounded px-2 py-1"
                    />
                </div>

                {/* Date To Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full border border-pink-300 rounded px-2 py-1"
                    />
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-4">
                <button
                    onClick={toggleReportOptions}
                    className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition"
                >
                    {showReportOptions ? 'Hide Report Options' : 'Generate Report'}
                </button>
                
                <div className="flex space-x-2">
                    <button
                        onClick={handleResetFilter}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApplyFilter}
                        className="bg-rose-300 text-white px-4 py-2 rounded hover:bg-rose-400 transition"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
            
            {/* Report Options */}
            {showReportOptions && (
                <div className="mt-4 p-4 border border-rose-200 rounded-lg bg-rose-50">
                    <h3 className="text-md font-semibold mb-3 text-rose-700">Report Options</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full border border-rose-300 rounded px-2 py-1"
                            >
                                <option value="orders">Orders Summary</option>
                                <option value="revenue">Revenue Analysis</option>
                                <option value="products">Product Sales</option>
                            </select>
                        </div>
                
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Format
                            </label>
                            <select
                                value={reportFormat}
                                onChange={(e) => setReportFormat(e.target.value)}
                                className="w-full border border-rose-300 rounded px-2 py-1"
                            >
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                            </select>
                        </div>
                      
                        <div className="flex items-center mt-6">
                            <input
                                type="checkbox"
                                id="includeLogo"
                                checked={includeLogo}
                                onChange={(e) => setIncludeLogo(e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="includeLogo" className="text-sm text-gray-700">
                                Include Company Logo
                            </label>
                        </div>
                    </div>
       
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Report Message (Optional)
                        </label>
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Add a custom message to appear on the report header..."
                            className="w-full border border-rose-300 rounded px-2 py-1 h-20"
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition flex items-center"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                'Generate Report'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderFilter;