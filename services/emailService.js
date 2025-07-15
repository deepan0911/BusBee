require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email service error:", error.message);
  } else {
    console.log("✅ Email service is ready");
  }
});

// Helper function to find Chrome executable
const findChromeExecutable = () => {
  const cacheDir = '/opt/render/.cache/puppeteer/chrome';
  
  try {
    if (fs.existsSync(cacheDir)) {
      const versions = fs.readdirSync(cacheDir);
      if (versions.length > 0) {
        // Sort versions to get the latest one
        const latestVersion = versions.sort().reverse()[0];
        const chromePath = path.join(cacheDir, latestVersion, 'chrome');
        if (fs.existsSync(chromePath)) {
          console.log(`✅ Found Chrome at: ${chromePath}`);
          return chromePath;
        }
      }
    }
  } catch (error) {
    console.log('Chrome path detection failed:', error.message);
  }
  
  return null; // Let Puppeteer auto-detect
};

const generateBookingPDF = async (bookingDetails, filePath) => {
  let browser;
  try {
    const chromeExecutable = findChromeExecutable();
    
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    };

    // Only set executablePath if we found Chrome
    if (chromeExecutable) {
      launchOptions.executablePath = chromeExecutable;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    const htmlContent = `
      <html>
      <head>
        <style>
          @page {
            margin: 30px 40px;
          }
          body {
            font-family: 'Arial', sans-serif;
            font-size: 14px;
            color: #333;
            margin: 0;
            padding-bottom: 100px;
            box-sizing: border-box;
          }
          h2 {
            color: #007BFF;
            margin-bottom: 5px;
          }
          h3 {
            margin-top: 30px;
            margin-bottom: 10px;
          }
          p {
            margin: 4px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }

          .section {
            margin-bottom: 20px;
          }

          .footer {
            position: fixed;
            bottom: 30px;
            left: 40px;
            right: 40px;
            font-size: 12px;
            color: #555;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }

          ul {
            margin: 5px 0 0 18px;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="section">
          <h2>Booking Confirmation</h2><hr>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Route:</strong> ${bookingDetails.route.from} → ${bookingDetails.route.to}</p>
          <p><strong>Departure Time:</strong> ${bookingDetails.departureTime}</p>
          <p><strong>Journey Date:</strong> ${new Date(bookingDetails.journeyDate).toLocaleDateString()}</p>
          <p><strong>Bus Name:</strong> ${bookingDetails.operatorName}</p>
          <p><strong>Bus Number:</strong> ${bookingDetails.busNumber}</p>
          <p><strong>Total Amount:</strong> ₹${bookingDetails.totalAmount.toFixed(2)}</p>
        </div>

        <div class="section">
          <h3>Passenger Details</h3>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Seat</th>
              </tr>
            </thead>
            <tbody>
              ${bookingDetails.passengers.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.name}</td>
                  <td>${p.age}</td>
                  <td>${p.gender}</td>
                  <td>${p.seatNumber}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <strong>Important Guidelines:</strong>
          <ul>
            <li>Please arrive at least 15 minutes before departure.</li>
            <li>Smoking and alcohol are strictly prohibited during the journey.</li>
            <li>Carry a valid ID proof and your ticket for verification.</li>
          </ul>
        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({ 
      path: filePath, 
      format: 'A4', 
      printBackground: true,
      timeout: 30000 // 30 second timeout
    });
    
    console.log(`✅ PDF generated successfully: ${filePath}`);
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const pdfFilePath = path.join(__dirname, `Booking_${bookingDetails.bookingId}.pdf`);
  
  try {
    await generateBookingPDF(bookingDetails, pdfFilePath);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Booking Confirmation - Bus Ticket",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #007BFF;">✅ Your Bus Booking is Confirmed!</h2>
          <p>Dear Customer,</p>
          <p>Thank you for booking with us. Below are your booking details:</p>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0;">Booking Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Booking ID:</strong></td><td>${bookingDetails.bookingId}</td></tr>
              <tr><td><strong>Operator:</strong></td><td>${bookingDetails.operatorName}</td></tr>
              <tr><td><strong>Bus Number:</strong></td><td>${bookingDetails.busNumber}</td></tr>
              <tr><td><strong>Route:</strong></td><td>${bookingDetails.route.from} → ${bookingDetails.route.to}</td></tr>
              <tr><td><strong>Journey Date:</strong></td><td>${new Date(bookingDetails.journeyDate).toLocaleDateString()}</td></tr>
              <tr><td><strong>Departure Time:</strong></td><td>${bookingDetails.departureTime}</td></tr>
              <tr><td><strong>Seats:</strong></td><td>${bookingDetails.seats.join(", ")}</td></tr>
              <tr><td><strong>Total Amount:</strong></td><td>₹${bookingDetails.totalAmount.toFixed(2)}</td></tr>
            </table>
          </div>

          <div style="margin-top: 30px;">
            <h4>Passenger Details</h4>
            <ul style="padding-left: 20px;">
              ${bookingDetails.passengers.map(passenger => `
                <li>${passenger.name} (${passenger.age}/${passenger.gender}) - Seat ${passenger.seatNumber}</li>
              `).join('')}
            </ul>
          </div>

          <p style="margin-top: 30px; color: #555;">
            Please ensure to reach the boarding point at least <strong>15 minutes</strong> prior to departure.
          </p>

          <p style="color: #555;">We wish you a pleasant journey!</p>
          <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
        </div>
      `,
      attachments: [
        {
          filename: `Booking_${bookingDetails.bookingId}.pdf`,
          path: pdfFilePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Booking confirmation email sent with PDF to:", userEmail);
    
  } catch (error) {
    console.error("❌ Error sending email with PDF:", error.message);
    
    // Fallback: Send email without PDF attachment
    try {
      const fallbackMailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Booking Confirmation - Bus Ticket",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #007BFF;">✅ Your Bus Booking is Confirmed!</h2>
            <p>Dear Customer,</p>
            <p>Thank you for booking with us. Below are your booking details:</p>

            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin-top: 0;">Booking Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td><strong>Booking ID:</strong></td><td>${bookingDetails.bookingId}</td></tr>
                <tr><td><strong>Operator:</strong></td><td>${bookingDetails.operatorName}</td></tr>
                <tr><td><strong>Bus Number:</strong></td><td>${bookingDetails.busNumber}</td></tr>
                <tr><td><strong>Route:</strong></td><td>${bookingDetails.route.from} → ${bookingDetails.route.to}</td></tr>
                <tr><td><strong>Journey Date:</strong></td><td>${new Date(bookingDetails.journeyDate).toLocaleDateString()}</td></tr>
                <tr><td><strong>Departure Time:</strong></td><td>${bookingDetails.departureTime}</td></tr>
                <tr><td><strong>Seats:</strong></td><td>${bookingDetails.seats.join(", ")}</td></tr>
                <tr><td><strong>Total Amount:</strong></td><td>₹${bookingDetails.totalAmount.toFixed(2)}</td></tr>
              </table>
            </div>

            <div style="margin-top: 30px;">
              <h4>Passenger Details</h4>
              <ul style="padding-left: 20px;">
                ${bookingDetails.passengers.map(passenger => `
                  <li>${passenger.name} (${passenger.age}/${passenger.gender}) - Seat ${passenger.seatNumber}</li>
                `).join('')}
              </ul>
            </div>

            <p style="margin-top: 30px; color: #555;">
              Please ensure to reach the boarding point at least <strong>15 minutes</strong> prior to departure.
            </p>

            <p style="color: #555;">We wish you a pleasant journey!</p>
            <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
            <p style="color: #ff9800; font-size: 12px;">Note: PDF attachment could not be generated. Please save this email for your records.</p>
          </div>
        `,
      };
      
      await transporter.sendMail(fallbackMailOptions);
      console.log("✅ Fallback email sent successfully (without PDF) to:", userEmail);
      
    } catch (fallbackError) {
      console.error("❌ Fallback email also failed:", fallbackError.message);
      throw fallbackError;
    }
  } finally {
    // Clean up PDF file if it exists
    if (fs.existsSync(pdfFilePath)) {
      fs.unlink(pdfFilePath, (err) => {
        if (err) console.warn("⚠️ Failed to delete temp PDF:", err.message);
      });
    }
  }
};

const sendCancellationEmail = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "❌ Booking Cancelled - Refund Initiated",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #d32f2f;">Your Booking Has Been Cancelled</h2>
        <p>Dear Customer,</p>
        <p>We confirm the cancellation of your bus ticket. Please find the details below:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h3 style="margin-top: 0;">Cancellation Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Booking ID:</strong></td><td>${bookingDetails.bookingId}</td></tr>
            <tr><td><strong>Cancellation Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
            <tr><td><strong>Original Amount:</strong></td><td>₹${(bookingDetails.refundAmount / 0.9).toFixed(2)}</td></tr>
            <tr><td><strong>Cancellation Charges (10%):</strong></td><td>₹${((bookingDetails.refundAmount / 0.9) * 0.1).toFixed(2)}</td></tr>
            <tr><td><strong>Refund Amount:</strong></td><td>₹${bookingDetails.refundAmount.toFixed(2)}</td></tr>
          </table>
          <p style="margin-top: 10px;">Your refund will be processed within <strong>5-7 business days</strong>.</p>
        </div>
        <p style="color: #555; margin-top: 30px;">We apologize for any inconvenience. For support, please contact our helpdesk.</p>
        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Cancellation email sent successfully to:", userEmail);
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error.message);
    throw error;
  }
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationEmail,
};
