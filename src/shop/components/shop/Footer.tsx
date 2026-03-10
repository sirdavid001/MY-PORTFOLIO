export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">SirDavid Gadgets</h3>
            <p className="text-gray-400 text-sm">
              Premium gadgets and electronics at competitive prices. Your trusted source for the latest technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/shop" className="hover:text-white transition">All Products</a></li>
              <li><a href="/track-order" className="hover:text-white transition">Track Order</a></li>
              <li><a href="/cart" className="hover:text-white transition">Shopping Cart</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/faqs" className="hover:text-white transition">FAQs</a></li>
              <li><a href="/shipping-policy" className="hover:text-white transition">Shipping Policy</a></li>
              <li><a href="/refund-policy" className="hover:text-white transition">Refund Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/terms-and-conditions" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          © 2026 SirDavid Gadgets. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
