import { useLocation, useNavigate } from 'react-router';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function PolicyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathToTitle: Record<string, string> = {
    '/terms-and-conditions': 'Terms and Conditions',
    '/refund-policy': 'Refund Policy',
    '/privacy-policy': 'Privacy Policy',
    '/faqs': 'Frequently Asked Questions',
    '/shipping-policy': 'Shipping Policy',
  };

  const pathToContent: Record<string, JSX.Element> = {
    '/terms-and-conditions': (
      <div className="prose max-w-none">
        <h2>1. Introduction</h2>
        <p>Welcome to Sirdavid Gadgets. By accessing and using our website, you agree to comply with these terms and conditions.</p>
        
        <h2>2. Use of Service</h2>
        <p>You must be at least 18 years old to make a purchase on our website. You are responsible for maintaining the confidentiality of your account information.</p>
        
        <h2>3. Products and Pricing</h2>
        <p>All product descriptions, prices, and availability are subject to change without notice. We strive to display accurate information, but errors may occur.</p>
        
        <h2>4. Orders and Payment</h2>
        <p>All orders are subject to acceptance and availability. Payment must be received before order processing begins.</p>
        
        <h2>5. Intellectual Property</h2>
        <p>All content on this website is the property of Sirdavid Gadgets and protected by intellectual property laws.</p>
        
        <h2>6. Limitation of Liability</h2>
        <p>Sirdavid Gadgets shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        
        <h2>7. Governing Law</h2>
        <p>These terms shall be governed by and construed in accordance with applicable laws.</p>
      </div>
    ),
    
    '/refund-policy': (
      <div className="prose max-w-none">
        <h2>Return Eligibility</h2>
        <p>Items may be returned within 14 days of receipt if they are unused, in original packaging, and in the same condition as received.</p>
        
        <h2>Non-Returnable Items</h2>
        <ul>
          <li>Opened software or digital products</li>
          <li>Items marked as final sale</li>
          <li>Personalized or custom-made items</li>
        </ul>
        
        <h2>Return Process</h2>
        <p>To initiate a return, please contact our customer service team with your order number and reason for return. We will provide you with return instructions.</p>
        
        <h2>Refund Processing</h2>
        <p>Once we receive and inspect your return, we will process your refund within 5-10 business days. Refunds will be issued to the original payment method.</p>
        
        <h2>Shipping Costs</h2>
        <p>Return shipping costs are the responsibility of the customer unless the item is defective or we made an error.</p>
        
        <h2>Exchanges</h2>
        <p>If you need to exchange an item, please contact us to arrange the exchange.</p>
      </div>
    ),
    
    '/privacy-policy': (
      <div className="prose max-w-none">
        <h2>Information We Collect</h2>
        <p>We collect information you provide directly to us, including name, email, phone number, shipping address, and payment information.</p>
        
        <h2>How We Use Your Information</h2>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and updates</li>
          <li>Respond to customer service requests</li>
          <li>Improve our products and services</li>
          <li>Send promotional communications (with your consent)</li>
        </ul>
        
        <h2>Information Sharing</h2>
        <p>We do not sell or rent your personal information to third parties. We may share information with service providers who assist us in operating our business.</p>
        
        <h2>Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
        
        <h2>Cookies</h2>
        <p>We use cookies to enhance your browsing experience and analyze website traffic. You can control cookie settings in your browser.</p>
        
        <h2>Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
        
        <h2>Changes to Privacy Policy</h2>
        <p>We may update this policy from time to time. We will notify you of significant changes.</p>
      </div>
    ),
    
    '/faqs': (
      <div className="prose max-w-none">
        <h2>How do I place an order?</h2>
        <p>Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping information and complete payment to place your order.</p>
        
        <h2>What payment methods do you accept?</h2>
        <p>We accept payments through Paystack, which supports credit cards, debit cards, and bank transfers in multiple currencies.</p>
        
        <h2>How can I track my order?</h2>
        <p>After placing an order, you'll receive an email with your order reference and tracking number. Use the "Track Order" feature on our website to check your order status.</p>
        
        <h2>How long does shipping take?</h2>
        <p>Shipping times vary by location. Typically, orders are processed within 1-2 business days and delivered within 3-7 business days.</p>
        
        <h2>Do you ship internationally?</h2>
        <p>Yes, we ship to multiple countries. Shipping costs and delivery times vary by destination.</p>
        
        <h2>What is your warranty policy?</h2>
        <p>All products come with a manufacturer's warranty. Warranty terms vary by product. Contact us for specific warranty information.</p>
        
        <h2>How do I contact customer support?</h2>
        <p>You can reach our customer support team through the contact information provided on our website.</p>
        
        <h2>Are the products genuine?</h2>
        <p>Yes, all our products are 100% genuine and sourced directly from authorized distributors.</p>
        
        <h2>Can I cancel or modify my order?</h2>
        <p>Orders can be cancelled or modified within 24 hours of placement. Contact us immediately if you need to make changes.</p>
        
        <h2>What if I receive a defective product?</h2>
        <p>If you receive a defective product, contact us within 7 days of receipt. We will arrange for a replacement or refund.</p>
      </div>
    ),
    
    '/shipping-policy': (
      <div className="prose max-w-none">
        <h2>Shipping Methods</h2>
        <p>We offer standard and express shipping options. Shipping costs are calculated at checkout based on your location and order weight.</p>
        
        <h2>Processing Time</h2>
        <p>Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order has shipped.</p>
        
        <h2>Delivery Time</h2>
        <ul>
          <li>Standard Shipping: 3-7 business days</li>
          <li>Express Shipping: 1-3 business days</li>
        </ul>
        
        <h2>Shipping Costs</h2>
        <p>Shipping costs vary based on destination, order weight, and shipping method selected. Free shipping may be available on orders above a certain threshold.</p>
        
        <h2>International Shipping</h2>
        <p>We ship to select international destinations. International orders may be subject to customs duties and taxes, which are the responsibility of the recipient.</p>
        
        <h2>Order Tracking</h2>
        <p>A tracking number will be provided once your order ships. You can track your order using our "Track Order" feature.</p>
        
        <h2>Lost or Damaged Packages</h2>
        <p>If your package is lost or arrives damaged, please contact us within 7 days of the expected delivery date.</p>
        
        <h2>Address Changes</h2>
        <p>Address changes can only be made before the order ships. Contact us immediately if you need to update your shipping address.</p>
      </div>
    ),
  };

  const title = pathToTitle[location.pathname] || 'Policy';
  const content = pathToContent[location.pathname] || <p>Content not found</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sirdavid Gadgets</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate('/shop')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        
        <Card>
          <CardContent className="prose prose-gray max-w-none p-8">
            {content}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
