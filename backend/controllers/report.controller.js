import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import Order from '../models/order.model.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Reference: https://github.com/foliojs/pdfkit/blob/master/docs/getting_started.md
// Reference: https://www.npmjs.com/package/exceljs/v/1.8.0

export async function generateReport(req, res) {
    try {
        const { type, format, filters, options } = req.body;
    
        // Build query 
        let query = {};
        
        if (filters.orderStatus) {
          query.status = filters.orderStatus;
        }
        
        if (filters.paymentStatus) {
          query.paymentStatus = filters.paymentStatus;
        }
        
        if (filters.dateFrom || filters.dateTo) {
          query.createdAt = {};
          if (filters.dateFrom) {
            query.createdAt.$gte = new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            // Set time to end of day for dateTo
            const endDate = new Date(filters.dateTo);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt.$lte = endDate;
          }
        }
    
        // Fetch data
        let data;
        try {
          switch (type) {
            case 'orders':
              data = await fetchOrdersData(query);
              break;
            case 'revenue':
              data = await fetchRevenueData(query);
              break;
            case 'products':
              data = await fetchProductSalesData(query);
              break;
            default:
              return res.status(400).json({ message: 'Invalid report type' });
          }
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          return res.status(500).json({ message: 'Error fetching data for report' });
        }
    
        // Generate report
        try {
          switch (format) {
            case 'pdf':
              return generatePDFReport(data, type, options, res);
            case 'excel':
              return generateExcelReport(data, type, options, res);
            default:
              return res.status(400).json({ message: 'Invalid report format' });
          }
        } catch (formatError) {
          console.error('Error formatting report:', formatError);
          return res.status(500).json({ message: 'Error formatting report' });
        }
        
    } catch (error) {
        console.error('Error generating report:', error.message, error.stack);
        res.status(500).json({ message: 'Server error generating report' });
    }
}

// Fetch Orders Data
async function fetchOrdersData(query) {
  try {
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .lean();
    
    // Process orders for report
    return orders.map(order => ({
      id: order._id,
      date: new Date(order.createdAt).toLocaleDateString(),
      customer: order.user?.name || 'Unknown',
      email: order.user?.email || 'N/A',
      items: order.products.length,
      total: order.totalAmount.toFixed(2),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod || 'N/A',
      deliveryCity: order.deliveryDetails?.city || 'N/A'
    }));
  } catch (error) {
    console.error('Error in fetchOrdersData:', error);
    throw error;
  }
}

// Fetch Revenue Data
async function fetchRevenueData(query) {
  try {
    const orders = await Order.find({
      ...query,
      status: { $nin: ['Cancelled'] }, // - cancelled orders
      paymentStatus: 'Paid' // + only paid orders
    }).lean();

    // Group by date and calculate revenue
    const revenueByDate = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          date,
          orderCount: 0,
          revenue: 0,
          averageOrderValue: 0
        };
      }
      revenueByDate[date].orderCount += 1;
      revenueByDate[date].revenue += order.totalAmount || 0;
    });

    // Calculate average order value
    Object.values(revenueByDate).forEach(day => {
      day.averageOrderValue = day.orderCount > 0 ? day.revenue / day.orderCount : 0;
      // Format numbers for display
      day.revenue = day.revenue.toFixed(2);
      day.averageOrderValue = day.averageOrderValue.toFixed(2);
    });

    return Object.values(revenueByDate).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error in fetchRevenueData:', error);
    throw error;
  }
}

// Fetch Product Sales Data
async function fetchProductSalesData(query) {
  try {
    const orders = await Order.find({
      ...query,
      status: { $nin: ['Cancelled'] } // - cancelled orders
    }).populate('products.product', 'name price').lean();

    // Group by product and calculate sales
    const productSales = {};
    orders.forEach(order => {
      if (!order.products || !Array.isArray(order.products)) return;
      
      order.products.forEach(item => {
        if (!item || !item.product) return;
        
        const productId = item.product._id?.toString() || 'unknown';
        const productName = item.product.name || 'Unknown Product';
        
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: productName,
            unitPrice: item.product.price || 0,
            quantitySold: 0,
            totalRevenue: 0
          };
        }
        
        const quantity = parseInt(item.quantity) || 0;
        productSales[productId].quantitySold += quantity;
        productSales[productId].totalRevenue += (item.product.price * quantity) || 0;
      });
    });

    // Format numbers 
    Object.values(productSales).forEach(product => {
      product.unitPrice = product.unitPrice.toFixed(2);
      product.totalRevenue = product.totalRevenue.toFixed(2);
    });

    return Object.values(productSales).sort((a, b) => b.quantitySold - a.quantitySold);
  } catch (error) {
    console.error('Error in fetchProductSalesData:', error);
    throw error;
  }
}

// Generate PDF Report 
function generatePDFReport(data, type, options, res) {
  // Create a document
  const doc = new PDFDocument({ margin: 50 });
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
  
  // Pipe PDF to the response
  doc.pipe(res);
  
  // Define theme colors
  const colors = {
    primary: '#F5C3C2',    
    secondary: '#E0E0E0',  
    accent: '#D3A4A4',     
    text: '#333333',       
    border: '#CCCCCC'      
  };
  
  // Add page background
  doc.rect(0, 0, doc.page.width, doc.page.height)
     .fill('#FFFFFF');
  
  // Add header background
  doc.rect(0, 0, doc.page.width, 120)
     .fill(colors.primary);
  
  // Add company logo if requested
  if (options.includeLogo) {
    const logoPath = path.join(__dirname, '../assets/logo1.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 100 });
      doc.moveDown(2);
    }
  }
  
  // Add report title
  const titles = {
    orders: 'Orders Summary Report',
    revenue: 'Revenue Analysis Report',
    products: 'Product Sales Report'
  };
  
  doc.fillColor(colors.text)
     .fontSize(24)
     .font('Courier-Bold')
     .text(titles[type] || 'Report', 50, 50, { align: 'right', width: 500 });
  
  // Add date
  doc.fontSize(12)
     .font('Courier')
     .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80, { align: 'right', width: 500 });
  
  // Add custom message 
  if (options.customMessage) {
    doc.fontSize(12)
       .font('Courier-Oblique')
       .text(options.customMessage, 50, 100, { align: 'right', width: 500 });
  }
  
  // Draw content based on report type
  switch (type) {
    case 'orders':
      addOrdersPDFContent(doc, data, colors);
      break;
    case 'revenue':
      addRevenuePDFContent(doc, data, colors);
      break;
    case 'products':
      addProductsPDFContent(doc, data, colors);
      break;
  }
  
  // Add page numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fillColor(colors.text)
       .fontSize(10)
       .text(
         `Page ${i + 1} of ${totalPages}`,
         50,
         doc.page.height - 50,
         { align: 'center', width: doc.page.width - 100 }
       );
  }
  
  // Finalize PDF file
  doc.end();
}

// Add Orders PDF Content 
function addOrdersPDFContent(doc, orders, colors) {
  // Table header
  const tableTop = 150;
  const columns = [
    { header: 'Order ID', width: 80 },
    { header: 'Date', width: 80 },
    { header: 'Customer', width: 100 },
    { header: 'Payment', width: 70 },
    { header: 'Status', width: 80 },
    { header: 'Total', width: 80 }
  ];
  
  drawStyledTableHeader(doc, columns, tableTop, colors);
  
  // Table rows
  let y = tableTop + 25;
  orders.forEach((order, i) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
      drawStyledTableHeader(doc, columns, y, colors);
      y += 25;
    }
    
    // Alternating row colors
    if (i % 2 === 0) {
      doc.rect(50, y - 5, 510, 20)
         .fill('#F9F9F9');
    }
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Courier');
       
    doc.text((order.id ? String(order.id).substring(0, 8) : 'N/A') + '...', 55, y);
    doc.text(order.date, 135, y);
    doc.text(order.customer, 215, y);
    
    // payment status
    let paymentColor = colors.text;
    if (order.paymentStatus === 'Paid') {
      paymentColor = '#007700';
    } else if (order.paymentStatus === 'Pending') {
      paymentColor = '#FF7700';
    } else if (order.paymentStatus === 'Failed') {
      paymentColor = '#CC0000';
    }
    
    doc.fillColor(paymentColor)
       .text(order.paymentStatus, 315, y)
       .fillColor(colors.text);
    
    // order status
    let statusColor = colors.text;
    if (order.status === 'Delivered') {
      statusColor = '#007700';
    } else if (order.status === 'Processing') {
      statusColor = '#0066CC';
    } else if (order.status === 'Cancelled') {
      statusColor = '#CC0000';
    } else if (order.status === 'Shipped') {
      statusColor = '#9900CC';
    }
    
    doc.fillColor(statusColor)
       .text(order.status, 385, y)
       .fillColor(colors.text)
       .text('LKR ' + order.total, 465, y);
    
    y += 20;
    
    // horizontal line 
    doc.strokeColor(colors.border)
       .lineWidth(0.5)
       .moveTo(50, y - 5)
       .lineTo(560, y - 5)
       .stroke();
  });
  
  // Summary box
  doc.rect(350, y + 10, 210, 80)
     .fill(colors.secondary);
     
  doc.fillColor(colors.text)
     .font('Courier-Bold')
     .fontSize(14)
     .text('Summary', 400, y + 20, { align: 'center' });
     
  doc.fontSize(12)
     .text(`Total Orders: ${orders.length}`, 360, y + 40);
     
  if (orders.length > 0) {
    const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2);
    doc.text(`Total Amount: LKR ${totalAmount}`, 360, y + 60);
  }
}

// Add Revenue PDF Content
function addRevenuePDFContent(doc, data, colors) {
  // Table header
  const tableTop = 150;
  const columns = [
    { header: 'Date', width: 100 },
    { header: 'Order Count', width: 100 },
    { header: 'Revenue', width: 120 },
    { header: 'Avg Order Value', width: 130 }
  ];
  
  drawStyledTableHeader(doc, columns, tableTop, colors);
  
  // Table rows
  let y = tableTop + 25;
  data.forEach((day, i) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
      drawStyledTableHeader(doc, columns, y, colors);
      y += 25;
    }
    
    // Alternating row colors
    if (i % 2 === 0) {
      doc.rect(50, y - 5, 450, 20)
         .fill('#F9F9F9');
    }
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Courier')
       .text(day.date, 55, y)
       .text(day.orderCount.toString(), 155, y)
       .text('LKR ' + day.revenue, 255, y)
       .text('LKR ' + day.averageOrderValue, 375, y);
    
    y += 20;
    
    // horizontal line after each row
    doc.strokeColor(colors.border)
       .lineWidth(0.5)
       .moveTo(50, y - 5)
       .lineTo(500, y - 5)
       .stroke();
  });
  
}

// Add Products PDF Content
function addProductsPDFContent(doc, products, colors) {
  // Table header
  const tableTop = 150;
  const columns = [
    { header: 'Product Name', width: 170 },
    { header: 'Unit Price', width: 100 },
    { header: 'Quantity Sold', width: 100 },
    { header: 'Total Revenue', width: 120 }
  ];
  
  drawStyledTableHeader(doc, columns, tableTop, colors);
  
  // Table rows
  let y = tableTop + 25;
  products.forEach((product, i) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
      drawStyledTableHeader(doc, columns, y, colors);
      y += 25;
    }
    
    // Alternating row colors
    if (i % 2 === 0) {
      doc.rect(50, y - 5, 510, 20)
         .fill('#F9F9F9');
    }
    
    doc.fillColor(colors.text)
       .fontSize(10)
       .font('Courier')
       .text(product.name, 55, y, { width: 165 })
       .text('LKR ' + product.unitPrice, 220, y)
       .text(product.quantitySold.toString(), 320, y)
       .text('LKR ' + product.totalRevenue, 420, y);
    
    y += 20;
    
    // horizontal line after each row
    doc.strokeColor(colors.border)
       .lineWidth(0.5)
       .moveTo(50, y - 5)
       .lineTo(560, y - 5)
       .stroke();
  });
  
  // Summary box 
  const margin = 50;
  const boxY   = y + 10;
  const boxW   = doc.page.width - margin * 2;
  const boxH   = 90;

  doc.rect(margin, boxY, boxW, boxH)
    .fill(colors.primary);

  doc.fillColor(colors.text)
    .font('Courier-Bold')
    .fontSize(14)
    .text('PRODUCT SALES SUMMARY', margin, boxY + 15, {
      width: boxW,
      align: 'center'
    });

  if (products.length > 0) {
    const totalRevenue  = products
      .reduce((sum, p) => sum + parseFloat(p.totalRevenue), 0)
      .toFixed(2);
    const totalQuantity = products
      .reduce((sum, p) => sum + p.quantitySold, 0);

    doc.font('Courier')
      .fontSize(12)
      .fillColor(colors.text)
      .text(`Total Products: ${products.length}`, margin + 20, boxY + 45)
      .text(`Total Units Sold: ${totalQuantity}`, margin + 20, boxY + 60)
      .text(`Total Revenue: LKR ${totalRevenue}`, margin + 20, boxY + 75);
  }

}

function drawStyledTableHeader(doc, columns, y, colors) {
  // Draw header background
  doc.rect(50, y - 5, 510, 25)
     .fill(colors.accent);
  
  doc.fillColor('#FFFFFF')
     .fontSize(12)
     .font('Courier-Bold');
  
  let x = 55;
  columns.forEach(column => {
    doc.text(column.header, x, y);
    x += column.width;
  });
  
  doc.strokeColor(colors.border)
     .lineWidth(1)
     .moveTo(50, y + 20)
     .lineTo(560, y + 20)
     .stroke();
}

// Generate Excel Report
async function generateExcelReport(data, type, options, res) {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1));
  
  // Define columns 
  switch (type) {
    case 'orders':
      worksheet.columns = [
        { header: 'Order ID', key: 'id', width: 20 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Items', key: 'items', width: 8 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Payment Status', key: 'paymentStatus', width: 15 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Delivery City', key: 'deliveryCity', width: 15 }
      ];
      break;
    case 'revenue':
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Order Count', key: 'orderCount', width: 12 },
        { header: 'Revenue', key: 'revenue', width: 12 },
        { header: 'Average Order Value', key: 'averageOrderValue', width: 18 }
      ];
      break;
    case 'products':
      worksheet.columns = [
        { header: 'Product Name', key: 'name', width: 30 },
        { header: 'Unit Price', key: 'unitPrice', width: 12 },
        { header: 'Quantity Sold', key: 'quantitySold', width: 15 },
        { header: 'Total Revenue', key: 'totalRevenue', width: 15 }
      ];
      break;
    default:
      return res.status(400).json({ message: 'Invalid report type for Excel' });
  }
  
  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Add custom message
  if (options.customMessage) {
    const titleRow = worksheet.addRow([options.customMessage]);
    titleRow.font = { italic: true };
    worksheet.addRow([]);  // Empty
  }
  
  // Add data
  worksheet.addRows(data);
  
  // Format columns
  if (type === 'orders') {
    worksheet.getColumn('total').numFmt = '#,##0.00';
  } else if (type === 'revenue') {
    worksheet.getColumn('revenue').numFmt = '#,##0.00';
    worksheet.getColumn('averageOrderValue').numFmt = '"LKR"#,##0.00';
  } else if (type === 'products') {
    worksheet.getColumn('unitPrice').numFmt = '#,##0.00';
    worksheet.getColumn('totalRevenue').numFmt = '#,##0.00';
  }
  
  // Add summary 
  worksheet.addRow([]);  // Empty row
  
  if (type === 'orders' && data.length > 0) {
    const totalAmount = data.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2);
    worksheet.addRow(['Total Orders:', data.length]);
    worksheet.addRow(['Total Amount:', `LKR${totalAmount}`]);
  } else if (type === 'revenue' && data.length > 0) {
    const totalRevenue = data.reduce((sum, day) => sum + parseFloat(day.revenue), 0).toFixed(2);
    const totalOrders = data.reduce((sum, day) => sum + day.orderCount, 0);
    worksheet.addRow(['Total Revenue:', `LKR${totalRevenue}`]);
    worksheet.addRow(['Total Orders:', totalOrders]);
    worksheet.addRow(['Overall Avg Order Value:', `LKR${(totalRevenue / totalOrders).toFixed(2)}`]);
  } else if (type === 'products' && data.length > 0) {
    const totalRevenue = data.reduce((sum, product) => sum + parseFloat(product.totalRevenue), 0).toFixed(2);
    const totalQuantity = data.reduce((sum, product) => sum + product.quantitySold, 0);
    worksheet.addRow(['Total Products:', data.length]);
    worksheet.addRow(['Total Units Sold:', totalQuantity]);
    worksheet.addRow(['Total Revenue:', `LKR${totalRevenue}`]);
  }
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
  
  // Write to response
  await workbook.xlsx.write(res);
}
