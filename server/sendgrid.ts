import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Send welcome email to new subscribers
export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  const name = firstName || 'Valued Customer';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Artisanal Jewels Newsletter</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fafafa;
        }
        .header {
          text-align: center;
          background-color: #8B7355;
          color: white;
          padding: 30px 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          opacity: 0.9;
        }
        .button {
          display: inline-block;
          background-color: #8B7355;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💎 Artisanal Jewels</div>
        <div class="subtitle">Welcome to our exclusive newsletter</div>
      </div>
      
      <div class="content">
        <h2>Welcome, ${name}!</h2>
        <p>Thank you for subscribing to our newsletter. You're now part of our exclusive community and will be the first to know about:</p>
        
        <ul>
          <li>✨ New jewelry collections and limited editions</li>
          <li>🎉 Special promotions and member-only discounts</li>
          <li>💎 Behind-the-scenes craftsmanship stories</li>
          <li>📚 Jewelry care tips and styling guides</li>
        </ul>
        
        <p>As a welcome gift, enjoy browsing our latest featured pieces:</p>
        <a href="${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000'}/catalog" class="button">Explore Our Collection</a>
        
        <p>We're thrilled to have you with us on this journey of elegance and craftsmanship.</p>
        
        <p>Warm regards,<br>
        The Artisanal Jewels Team</p>
      </div>
      
      <div class="footer">
        <p>If you no longer wish to receive these emails, you can <a href="{{unsubscribe}}">unsubscribe here</a>.</p>
        <p>© 2024 Artisanal Jewels. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `Welcome, ${name}!

Thank you for subscribing to our newsletter. You're now part of our exclusive community and will be the first to know about:

- New jewelry collections and limited editions
- Special promotions and member-only discounts  
- Behind-the-scenes craftsmanship stories
- Jewelry care tips and styling guides

As a welcome gift, visit our catalog to explore our latest featured pieces.

We're thrilled to have you with us on this journey of elegance and craftsmanship.

Warm regards,
The Artisanal Jewels Team`;

  return sendEmail({
    to: email,
    from: 'dhruvilsavani123@gmail.com',
    subject: 'Welcome to Artisanal Jewels Newsletter! ✨',
    text,
    html
  });
}

// Send registration confirmation email with offer banner
export async function sendRegistrationEmail(email: string, firstName?: string): Promise<boolean> {
  const name = firstName || 'Valued Customer';
  const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Artisanal Jewels</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fafafa;
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #8B7355 0%, #a08968 100%);
          color: white;
          padding: 40px 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .offer-banner {
          background: linear-gradient(135deg, #8B7355 0%, #a08968 100%);
          color: white;
          padding: 25px;
          text-align: center;
          border-radius: 8px;
          margin: 25px 0;
        }
        .offer-banner h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .offer-code {
          background: white;
          color: #8B7355;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 18px;
          display: inline-block;
          margin: 10px 0;
          letter-spacing: 2px;
        }
        .button {
          display: inline-block;
          background-color: #8B7355;
          color: white !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 4px;
          margin: 15px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #666;
          font-size: 14px;
          border-radius: 0 0 8px 8px;
          background-color: white;
        }
        .benefits {
          background: #f8f8f8;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💎 Artisanal Jewels</div>
        <div>Luxury Handcrafted Jewelry</div>
      </div>
      
      <div class="content">
        <h2>Welcome to Artisanal Jewels, ${name}!</h2>
        <p>Thank you for registering with us. Your account has been successfully created, and you're now part of our exclusive community of jewelry enthusiasts.</p>
        
        <div class="offer-banner">
          <h3>🎁 Welcome Gift Inside!</h3>
          <p style="margin: 10px 0;">Enjoy <strong>15% OFF</strong> your first purchase</p>
          <div class="offer-code">WELCOME15</div>
          <p style="margin: 10px 0; font-size: 14px;">Valid for 30 days</p>
        </div>
        
        <div class="benefits">
          <h3>As a registered member, you enjoy:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>✨ Exclusive access to new collections</li>
            <li>🎉 Special member-only discounts</li>
            <li>💎 Personalized jewelry recommendations</li>
            <li>📦 Priority shipping and handling</li>
            <li>🔔 Early notifications for sales events</li>
          </ul>
        </div>
        
        <p style="text-align: center;">
          <a href="${baseUrl}/catalog" class="button">Start Shopping Now</a>
        </p>
        
        <p>We're thrilled to have you with us on this journey of elegance and craftsmanship.</p>
        
        <p>Warm regards,<br>
        The Artisanal Jewels Team</p>
      </div>
      
      <div class="footer">
        <p>Questions? Contact us at dhruvilsavani123@gmail.com</p>
        <p>© 2024 Artisanal Jewels. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `Welcome to Artisanal Jewels, ${name}!

Thank you for registering with us. Your account has been successfully created, and you're now part of our exclusive community of jewelry enthusiasts.

🎁 WELCOME GIFT: Enjoy 15% OFF your first purchase
Use code: WELCOME15 (Valid for 30 days)

As a registered member, you enjoy:
- Exclusive access to new collections
- Special member-only discounts
- Personalized jewelry recommendations
- Priority shipping and handling
- Early notifications for sales events

Start shopping: ${baseUrl}/catalog

We're thrilled to have you with us on this journey of elegance and craftsmanship.

Warm regards,
The Artisanal Jewels Team

Questions? Contact us at dhruvilsavani123@gmail.com`;

  return sendEmail({
    to: email,
    from: 'dhruvilsavani123@gmail.com',
    subject: 'Welcome to Artisanal Jewels - 15% OFF Your First Order! 🎁',
    text,
    html
  });
}

// Send order confirmation email with invoice
export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: {
    orderId: number;
    customerName: string;
    items: Array<{
      title: string;
      quantity: number;
      price: string;
      total: string;
    }>;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    shippingAddress: string;
    paymentMethod: string;
    orderDate: Date;
  }
): Promise<boolean> {
  const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000';
  
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${item.total}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - #${orderDetails.orderId}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 700px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fafafa;
        }
        .header {
          text-align: center;
          background: linear-gradient(135deg, #8B7355 0%, #a08968 100%);
          color: white;
          padding: 40px 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .invoice-box {
          border: 2px solid #8B7355;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #8B7355;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #f8f8f8;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #8B7355;
        }
        .totals {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #eee;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .total-final {
          font-size: 20px;
          font-weight: bold;
          color: #8B7355;
          border-top: 2px solid #8B7355;
          padding-top: 15px;
          margin-top: 10px;
        }
        .button {
          display: inline-block;
          background-color: #8B7355;
          color: white !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 4px;
          margin: 15px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #666;
          font-size: 14px;
          background-color: white;
          border-radius: 0 0 8px 8px;
        }
        .success-badge {
          background: #22c55e;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="font-size: 28px; font-weight: bold; margin-bottom: 10px;">💎 Artisanal Jewels</div>
        <div style="font-size: 18px;">Order Confirmation</div>
      </div>
      
      <div class="content">
        <div style="text-align: center;">
          <div class="success-badge">✓ Order Confirmed</div>
          <h2>Thank you for your order, ${orderDetails.customerName}!</h2>
          <p>We've received your order and will begin processing it shortly.</p>
        </div>

        <div class="invoice-box">
          <div class="invoice-header">
            <div>
              <h3 style="margin: 0;">Invoice</h3>
              <p style="margin: 5px 0; color: #666;">Order #${orderDetails.orderId}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 5px 0; color: #666;">Date: ${orderDetails.orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${orderDetails.subtotal}</span>
            </div>
            <div class="totals-row">
              <span>Shipping:</span>
              <span>$${orderDetails.shipping}</span>
            </div>
            <div class="totals-row">
              <span>Tax:</span>
              <span>$${orderDetails.tax}</span>
            </div>
            <div class="totals-row total-final">
              <span>Total:</span>
              <span>$${orderDetails.total}</span>
            </div>
          </div>
        </div>

        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Shipping Address</h3>
          <p style="margin: 5px 0; white-space: pre-line;">${orderDetails.shippingAddress}</p>
          
          <h3 style="margin-top: 20px;">Payment Method</h3>
          <p style="margin: 5px 0;">${orderDetails.paymentMethod}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/orders" class="button">View Order Status</a>
        </div>

        <div style="background: #fff9e6; border-left: 4px solid #8B7355; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📦 What's Next?</strong></p>
          <p style="margin: 10px 0 0 0;">You'll receive a shipping confirmation email with tracking information once your order ships. If you have any questions, please don't hesitate to contact us.</p>
        </div>

        <p>Thank you for choosing Artisanal Jewels!</p>
        
        <p>Best regards,<br>
        The Artisanal Jewels Team</p>
      </div>
      
      <div class="footer">
        <p>Questions about your order? Contact us at dhruvilsavani123@gmail.com</p>
        <p>© 2024 Artisanal Jewels. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const itemsText = orderDetails.items.map(item => 
    `${item.title} x ${item.quantity} - $${item.price} each = $${item.total}`
  ).join('\n');

  const text = `Order Confirmation - Artisanal Jewels

✓ Order Confirmed

Thank you for your order, ${orderDetails.customerName}!

INVOICE
Order #${orderDetails.orderId}
Date: ${orderDetails.orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

ORDER ITEMS:
${itemsText}

Subtotal: $${orderDetails.subtotal}
Shipping: $${orderDetails.shipping}
Tax: $${orderDetails.tax}
------------------------
TOTAL: $${orderDetails.total}

SHIPPING ADDRESS:
${orderDetails.shippingAddress}

PAYMENT METHOD:
${orderDetails.paymentMethod}

📦 What's Next?
You'll receive a shipping confirmation email with tracking information once your order ships.

View order status: ${baseUrl}/orders

Thank you for choosing Artisanal Jewels!

Best regards,
The Artisanal Jewels Team

Questions? Contact us at dhruvilsavani123@gmail.com`;

  return sendEmail({
    to: email,
    from: 'dhruvilsavani123@gmail.com',
    subject: `Order Confirmation #${orderDetails.orderId} - Artisanal Jewels`,
    text,
    html
  });
}

// Send newsletter update to subscribers
export async function sendNewsletterUpdate(
  email: string, 
  firstName: string | null,
  subject: string,
  content: {
    title: string;
    message: string;
    products?: Array<{
      id: number;
      title: string;
      basePrice: string;
      images: any[];
      handle: string;
    }>;
    promotions?: Array<{
      title: string;
      description: string;
    }>;
  }
): Promise<boolean> {
  const name = firstName || 'Valued Customer';
  const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000';
  
  let productsHtml = '';
  if (content.products && content.products.length > 0) {
    productsHtml = `
      <h3>Latest Products</h3>
      <div style="display: grid; gap: 20px;">
        ${content.products.map(product => {
          const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : '';
          return `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: white;">
              ${imageUrl ? `<img src="${imageUrl}" alt="${product.title}" style="width: 100%; max-width: 200px; height: auto; border-radius: 4px;">` : ''}
              <h4 style="margin: 10px 0;">${product.title}</h4>
              <p style="font-size: 18px; color: #8B7355; font-weight: bold;">$${product.basePrice}</p>
              <a href="${baseUrl}/product/${product.handle}" style="display: inline-block; background-color: #8B7355; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px;">View Product</a>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  let promotionsHtml = '';
  if (content.promotions && content.promotions.length > 0) {
    promotionsHtml = `
      <h3>Special Offers</h3>
      ${content.promotions.map(promo => `
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <h4>${promo.title}</h4>
          <p>${promo.description}</p>
        </div>
      `).join('')}
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fafafa;
        }
        .header {
          text-align: center;
          background-color: #8B7355;
          color: white;
          padding: 30px 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background-color: #8B7355;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 4px;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💎 Artisanal Jewels</div>
        <div class="subtitle">${content.title}</div>
      </div>
      
      <div class="content">
        <h2>Hello, ${name}!</h2>
        <p>${content.message}</p>
        
        ${productsHtml}
        ${promotionsHtml}
        
        <p>Visit our store to explore our complete collection:</p>
        <a href="${baseUrl}/catalog" class="button">Browse All Products</a>
        
        <p>Thank you for being part of our community!</p>
        
        <p>Best regards,<br>
        The Artisanal Jewels Team</p>
      </div>
      
      <div class="footer">
        <p>If you no longer wish to receive these emails, you can <a href="{{unsubscribe}}">unsubscribe here</a>.</p>
        <p>© 2024 Artisanal Jewels. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `${content.title}

Hello, ${name}!

${content.message}

${content.products ? content.products.map(p => `${p.title} - $${p.basePrice}\nView: ${baseUrl}/product/${p.handle}`).join('\n\n') : ''}

${content.promotions ? content.promotions.map(p => `${p.title}: ${p.description}`).join('\n\n') : ''}

Visit our store: ${baseUrl}/catalog

Thank you for being part of our community!

Best regards,
The Artisanal Jewels Team`;

  return sendEmail({
    to: email,
    from: 'dhruvilsavani123@gmail.com',
    subject,
    text,
    html
  });
}
