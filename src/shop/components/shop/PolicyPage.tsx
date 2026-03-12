import { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import {
  HelpCircle, Truck, RefreshCcw, Scale, ShieldCheck, FileText,
  ChevronRight, Search, CheckCircle2, XCircle, Clock, MapPin,
  CreditCard, Package, AlertTriangle, Mail, ArrowRight,
  Lock, Eye, Database, Cookie, UserCheck, Globe, Zap, Star,
  RotateCcw, Ban, Info, BookOpen,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import Header from './Header';
import Footer from './Footer';

// ─── Page config ─────────────────────────────────────────────────────────────

const PAGE_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  lastUpdated: string;
}> = {
  '/faqs': {
    title: 'Frequently Asked Questions',
    subtitle: 'Find quick answers to the most common questions about orders, shipping, returns, and more.',
    icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
    lastUpdated: 'March 2026',
  },
  '/shipping-policy': {
    title: 'Shipping Policy',
    subtitle: 'Everything you need to know about how we deliver your orders safely and on time.',
    icon: <Truck className="w-6 h-6 text-blue-600" />,
    lastUpdated: 'March 2026',
  },
  '/refund-policy': {
    title: 'Refund & Returns Policy',
    subtitle: 'Strict refund conditions apply. Please review all requirements carefully before initiating a return request.',
    icon: <RefreshCcw className="w-6 h-6 text-blue-600" />,
    lastUpdated: 'March 2026',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    subtitle: 'Please read these terms carefully before using our website and services.',
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    lastUpdated: 'March 2026',
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'We take your privacy seriously. Learn how we collect, use, and protect your personal data.',
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    lastUpdated: 'March 2026',
  },
  '/legal': {
    title: 'Legal',
    subtitle: 'All our legal documents and policies in one place — clear, transparent, and accessible.',
    icon: <Scale className="w-6 h-6 text-blue-600" />,
    lastUpdated: 'March 2026',
  },
};

// ─── Page Header ──────────────────────────────────────────────────────────────

function PageHeader({ path }: { path: string }) {
  const navigate = useNavigate();
  const cfg = PAGE_CONFIG[path];
  if (!cfg) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
          <button onClick={() => navigate('/shop')} className="hover:text-blue-600 transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-medium">{cfg.title}</span>
        </nav>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white border border-blue-100 shadow-sm flex items-center justify-center">
            {cfg.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{cfg.title}</h1>
            <p className="text-gray-600 max-w-2xl">{cfg.subtitle}</p>
            <p className="text-xs text-gray-400 mt-2">Last updated: {cfg.lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Content ──────────────────────────────────────────────────────────────

const FAQ_CATEGORIES = [
  {
    id: 'orders',
    label: 'Orders & Checkout',
    icon: <Package className="w-4 h-4" />,
    items: [
      {
        q: 'How do I place an order?',
        a: "Browse our catalogue, select the product you want, and click \"Add to Cart\". When you're ready, head to your cart and click \"Checkout\". Fill in your delivery details, review your order, and complete payment via Paystack.",
      },
      {
        q: 'Can I cancel or modify my order?',
        a: "Orders can be cancelled or modified within 2 hours of placement, provided they haven't been processed for shipment yet. Contact us immediately via email or WhatsApp. Once an order has been dispatched, cancellation is no longer possible.",
      },
      {
        q: 'Will I receive an order confirmation?',
        a: "Yes. Immediately after a successful payment, you'll receive an email confirmation with your order reference number, itemized receipt, and estimated delivery window. Check your spam folder if it doesn't arrive within 5 minutes.",
      },
      {
        q: 'How do I track my order?',
        a: 'Use the "Track Order" page on our website and enter your order reference number. You can also check the tracking link sent in your shipment notification email.',
      },
      {
        q: 'Can I order in bulk for my business?',
        a: 'Absolutely. We offer business pricing for bulk orders of 5+ units. Contact us via email with your requirements for a custom quote and dedicated account support.',
      },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping & Delivery',
    icon: <Truck className="w-4 h-4" />,
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Within Lagos, standard delivery takes 1–2 business days. For other Nigerian states, delivery is typically 3–5 business days. International shipping varies by destination — usually 7–14 business days.',
      },
      {
        q: 'Do you ship nationwide across Nigeria?',
        a: 'Yes! We ship to all 36 states and the FCT. We partner with trusted courier services including GIG Logistics, DHL, and Courier Plus to ensure safe and timely delivery to every part of the country.',
      },
      {
        q: 'Is free shipping available?',
        a: 'Free standard delivery is available on orders above ₦50,000 within Lagos. For other states and international orders, shipping fees are calculated at checkout based on your location and order weight.',
      },
      {
        q: "What happens if my package is delayed?",
        a: "If your order hasn't arrived within the estimated window, check the tracking page first. If the issue persists, contact our support team with your order reference and we'll escalate with the courier immediately.",
      },
    ],
  },
  {
    id: 'returns',
    label: 'Returns & Refunds',
    icon: <RotateCcw className="w-4 h-4" />,
    items: [
      {
        q: 'What is your return window?',
        a: 'You have 72 hours (3 days) from delivery to initiate a return. Items must be completely unused, sealed in original manufacturer packaging with all tags, seals, accessories, manuals, and warranty cards intact. Any sign of use, opening, or tampering automatically disqualifies the return.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Email support@settlex.site within 72 hours of delivery with: order number, high-resolution unboxing video, detailed written explanation, copy of your government ID, proof of original payment, and three professional photos showing all sides of the unopened package. Returns require pre-approval and a non-refundable ₦5,000 processing fee.',
      },
      {
        q: 'How long does a refund take?',
        a: 'After we receive and rigorously inspect your returned item (7–14 business days), refunds are processed within 21–30 business days. A 25% restocking fee, return shipping costs, original shipping fees, and processing charges will be deducted. Bank processing adds another 14–21 business days.',
      },
      {
        q: 'What if I receive a damaged or wrong item?',
        a: 'Contact us within 24 hours of delivery with: dated timestamped unboxing video showing the courier handing you the package, photos of shipping label, photos of all six sides of the external packaging before opening, detailed photos of the alleged damage, and a signed statutory declaration. We reserve the right to deny claims if documentation is insufficient.',
      },
    ],
  },
  {
    id: 'products',
    label: 'Products & Authenticity',
    icon: <Star className="w-4 h-4" />,
    items: [
      {
        q: 'Are all your products 100% genuine?',
        a: 'Yes, without exception. All products at SirDavid Gadgets are sourced directly from authorized distributors and certified suppliers. Every item comes with the manufacturer\'s original warranty and packaging.',
      },
      {
        q: 'Do products come with a warranty?',
        a: "All products include the manufacturer's warranty — typically 12 months for most electronics. Warranty terms are stated on each product page. We also offer extended warranty options for select products.",
      },
      {
        q: 'What does "Refurbished" mean on your listings?',
        a: 'Refurbished products are pre-owned items that have been professionally inspected, repaired to full working condition, tested, and cleaned. They carry our quality guarantee at a reduced price versus brand new.',
      },
    ],
  },
  {
    id: 'payment',
    label: 'Payment & Security',
    icon: <CreditCard className="w-4 h-4" />,
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major debit/credit cards (Visa, Mastercard, Verve), bank transfers, and USSD payments — all securely processed via Paystack. We also support international cards.',
      },
      {
        q: 'Is it safe to enter my card details on your site?',
        a: 'Absolutely. We never store your card information. All payments are processed directly by Paystack, a PCI DSS Level 1 certified payment processor with military-grade encryption.',
      },
      {
        q: 'Can I pay in my local currency?',
        a: 'Our primary currency is Nigerian Naira (₦). We also display prices in USD, GBP, and EUR for reference. All transactions are settled in NGN via Paystack, which handles currency conversion for international cards.',
      },
    ],
  },
];

function FAQContent() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return FAQ_CATEGORIES.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter(cat =>
      (activeCategory === 'all' || cat.id === activeCategory) && cat.items.length > 0
    );
  }, [search, activeCategory]);

  const totalCount = FAQ_CATEGORIES.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
          placeholder="Search questions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            activeCategory === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          All ({totalCount})
        </button>
        {FAQ_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Groups */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HelpCircle className="w-10 h-10 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No results found</p>
          <p className="text-sm mt-1">Try different keywords or browse all topics</p>
        </div>
      ) : (
        filtered.map(cat => (
          <section key={cat.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600">{cat.icon}</span>
              <h2 className="font-semibold text-gray-900">{cat.label}</h2>
              <span className="text-xs text-gray-400 ml-1">({cat.items.length})</span>
            </div>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              <Accordion type="single" collapsible>
                {cat.items.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`${cat.id}-${i}`}
                    className="border-b last:border-b-0 border-gray-100"
                  >
                    <AccordionTrigger className="px-6 py-4 text-sm font-medium text-gray-800 hover:no-underline hover:bg-gray-50 transition-colors text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </section>
        ))
      )}

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Still have a question?</h3>
          <p className="text-sm text-gray-600">Our support team is available 7 days a week.</p>
        </div>
        <a href="mailto:support@settlex.site" className="flex-shrink-0">
          <Button className="gap-2">
            <Mail className="w-4 h-4" /> Email Support
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─── Shipping Content ─────────────────────────────────────────────────────────

function ShippingContent() {
  const steps = [
    { num: '01', label: 'Order Placed', desc: 'Payment confirmed, order enters our fulfilment queue.' },
    { num: '02', label: 'Processing', desc: 'Item inspected, packed, and labelled (1–2 business days).' },
    { num: '03', label: 'Dispatched', desc: 'Handed to courier partner. Tracking number sent via email.' },
    { num: '04', label: 'Delivered', desc: 'Package arrives safely at your delivery address.' },
  ];

  const methods = [
    { name: 'Lagos Standard', time: '1–2 business days', cost: 'Free on orders ≥ ₦50,000 · ₦1,500 otherwise', badge: 'Most Popular' },
    { name: 'Other States — Standard', time: '3–5 business days', cost: '₦2,500 – ₦4,000 (varies by state)', badge: null },
    { name: 'Express Nationwide', time: '1–2 business days', cost: '₦5,000 – ₦8,500', badge: 'Fastest' },
    { name: 'International', time: '7–14 business days', cost: 'Calculated at checkout by destination', badge: null },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Order journey */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-1">How Your Order Gets to You</h2>
        <p className="text-sm text-gray-500 mb-8">A step-by-step look at our fulfilment process.</p>
        <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-blue-100 hidden sm:block" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center mb-3 z-10 shadow-sm">
                <span className="text-xs font-bold text-blue-600">{s.num}</span>
              </div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{s.label}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery options */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Delivery Options</h2>
        <p className="text-sm text-gray-500 mb-6">Choose the option that suits your timeline and budget.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methods.map((m, i) => (
            <Card key={i} className={`hover:shadow-md transition-shadow duration-200 ${i === 0 ? 'ring-1 ring-blue-600' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">{m.name}</h3>
                  {m.badge && (
                    <Badge variant={i === 0 ? 'default' : 'secondary'} className="text-xs flex-shrink-0">{m.badge}</Badge>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    {m.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    {m.cost}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Info notices */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <AlertTriangle className="w-5 h-5 text-blue-600" />, title: 'Lost or Damaged Packages', body: "Contact us within 7 days of the expected delivery date. We'll file a claim with the courier and arrange a replacement or refund." },
          { icon: <MapPin className="w-5 h-5 text-blue-600" />, title: 'Address Changes', body: 'Shipping address can only be changed before dispatch. Email us immediately after placing your order if an update is needed.' },
          { icon: <Globe className="w-5 h-5 text-blue-600" />, title: 'Customs & Duties', body: 'International shipments may be subject to import duties levied by the destination country, payable by the recipient.' },
        ].map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="mb-3">{card.icon}</div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1.5">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

// ─── Refund Content ───────────────────────────────────────────────────────────

function RefundContent() {
  const steps = [
    { num: '01', title: 'Submit Documentation', desc: 'Within 72 hours of delivery, email all required documents: order number, high-resolution unboxing video, government ID, proof of payment, 3 professional photos of the unopened package from all angles, and detailed written explanation. Pay non-refundable ₦5,000 processing fee.', icon: <Mail className="w-4 h-4 text-blue-600" /> },
    { num: '02', title: 'Await Pre-Approval', desc: 'Our review team evaluates your request within 7–10 business days. We may request additional documentation including statutory declarations, notarized statements, or third-party inspection reports. Pre-approval is required before any item can be returned.', icon: <FileText className="w-4 h-4 text-blue-600" /> },
    { num: '03', title: 'Ship at Your Cost', desc: 'If approved, ship the item at your own expense using tracked, insured courier service only. Items must be returned to our designated facility within 5 days of approval. You bear all risk of loss or damage during transit. Original shipping costs are non-refundable.', icon: <Package className="w-4 h-4 text-blue-600" /> },
    { num: '04', title: 'Rigorous Inspection', desc: 'Upon receipt, items undergo a detailed 7–14 business day inspection. We check for: physical condition, tamper seals, authenticity verification, functionality testing, packaging integrity, accessory completeness, and any signs of use. Failed inspection results in item being returned to you at your cost.', icon: <Eye className="w-4 h-4 text-blue-600" /> },
    { num: '05', title: 'Partial Refund Processed', desc: 'If approved, refunds are processed within 21–30 business days minus: 25% restocking fee, return shipping, original shipping, ₦5,000 processing fee, insurance costs, and handling charges. Refunds to your bank may take an additional 14–21 business days.', icon: <CheckCircle2 className="w-4 h-4 text-blue-600" /> },
  ];

  const eligible = [
    'Item completely sealed, never opened or used',
    'All manufacturer seals, tags, and wrapping intact',
    'Original retail packaging pristine and undamaged',
    'All accessories, manuals, cables, and warranty cards present',
    'Return initiated within 72 hours (3 days) of delivery',
    'Complete unboxing video showing courier handover',
    'Government-issued ID and payment proof provided',
    '₦5,000 non-refundable processing fee paid',
  ];

  const notEligible = [
    'Any item opened, used, tested, or activated',
    'Missing original shrink wrap, factory seals, or security tags',
    'Packaging shows wear, tears, damage, or resealing',
    'Software, digital licenses, or downloadable products',
    'Items marked "Final Sale", "Clearance", "As-Is", or "No Return"',
    'Products sold below manufacturer\'s recommended retail price',
    'Custom-ordered, personalized, or configured items',
    'Refurbished or "open box" products',
    'Items with physical damage, scratches, dents, or blemishes',
    'Products with user-caused damage or mishandling',
    'Electronics with broken tamper-evident seals',
    'Items returned without pre-approval or RMA number',
    'Returns submitted after 72-hour window expires',
    'Incomplete accessory sets or missing documentation',
    'Items purchased during promotional sales or special offers',
    'Products shipped to addresses outside Nigeria',
    'Orders paid via installment or third-party financing',
    'Items with serial numbers that don\'t match our records',
    'Returns without complete photographic documentation',
    'Any product where customer refused video inspection',
    'Items damaged during unauthorized return shipping',
    'Products returned in non-original packaging',
    'Orders where buyer\'s remorse is cited as reason',
    'Items affected by liquid, smoke, or environmental damage',
    'Returns initiated by unauthorized third parties',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Warning Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 text-sm mb-1">Important: Strict Return Conditions Apply</h3>
          <p className="text-sm text-red-800 leading-relaxed">
            Returns are subject to rigorous eligibility requirements and substantial deductions. Please review all conditions carefully before initiating a return. Most returns do not qualify for full refunds. All sales are considered final unless otherwise pre-approved in writing.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Clock className="w-6 h-6 text-blue-600" />, value: '72 Hours', label: 'Return Window', sub: 'From delivery date only' },
          { icon: <Ban className="w-6 h-6 text-blue-600" />, value: '25% Fee', label: 'Restocking Charge', sub: 'Plus all shipping costs' },
          { icon: <AlertTriangle className="w-6 h-6 text-blue-600" />, value: '21–30 Days', label: 'Refund Processing', sub: 'After inspection approval' },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5 text-center">
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-700 mt-0.5">{stat.label}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Return steps */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-1">The Return Process</h2>
        <p className="text-sm text-gray-500 mb-6">Five mandatory steps — all requirements must be met for consideration.</p>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{s.num}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {s.icon}
                    <h3 className="font-semibold text-gray-800 text-sm">{s.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Eligibility */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Return Eligibility Criteria</h2>
        <div className="grid grid-cols-1 gap-4">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Required for Return Consideration</h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {eligible.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow duration-200 border-red-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Automatic Disqualification — Not Eligible for Return</h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {notEligible.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Fees & Deductions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Mandatory Fees & Deductions</h2>
        <p className="text-sm text-gray-500 mb-6">All approved refunds are subject to the following non-negotiable deductions:</p>
        <Card className="hover:shadow-md transition-shadow duration-200 border-orange-200">
          <CardContent className="p-6">
            <ul className="space-y-3">
              {[
                { label: 'Restocking Fee', amount: '25% of item price', note: 'Applied to all returns regardless of condition' },
                { label: 'Processing Fee', amount: '₦5,000', note: 'Non-refundable administrative charge' },
                { label: 'Original Shipping', amount: '100% non-refundable', note: 'Initial delivery cost not reimbursed' },
                { label: 'Return Shipping', amount: 'Customer responsibility', note: 'You pay all costs to return item' },
                { label: 'Insurance & Handling', amount: '₦2,500', note: 'Warehouse receiving and processing' },
                { label: 'Inspection Fee', amount: '₦3,000', note: 'Technical evaluation and testing' },
                { label: 'Bank Transfer Fee', amount: '₦500 – ₦1,500', note: 'Third-party transaction charges' },
              ].map((fee, i) => (
                <li key={i} className="flex items-start gap-3 pb-3 border-b last:border-b-0 border-gray-100">
                  <CreditCard className="w-4 h-4 text-orange-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 text-sm">{fee.label}</span>
                      <span className="font-bold text-orange-600 text-sm">{fee.amount}</span>
                    </div>
                    <p className="text-xs text-gray-500">{fee.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Example calculation */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Refund Calculation Example</h2>
        <p className="text-sm text-gray-500 mb-6">Understanding what you'll actually receive back:</p>
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-600">Original Order Total</span>
                <span className="font-semibold text-gray-900">₦100,000</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Restocking Fee (25%)</span>
                <span className="text-red-600">– ₦25,000</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Original Shipping (non-refundable)</span>
                <span className="text-red-600">– ₦2,500</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Return Shipping (your cost)</span>
                <span className="text-red-600">– ₦3,000</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Processing Fee</span>
                <span className="text-red-600">– ₦5,000</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Inspection Fee</span>
                <span className="text-red-600">– ₦3,000</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Insurance & Handling</span>
                <span className="text-red-600">– ₦2,500</span>
              </div>
              <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200">
                <span>Bank Transfer Fee</span>
                <span className="text-red-600">– ₦1,000</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span className="text-gray-900">Final Refund Amount</span>
                <span className="text-green-600">₦58,000</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                Additional 14–21 business days required for bank processing after our 21–30 day refund window.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* No exchanges */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-5 flex gap-3">
        <Ban className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">No Direct Exchanges</h3>
          <p className="text-sm text-gray-600">We do not offer direct item-for-item exchanges under any circumstances. To exchange a product, you must complete the full return process (including all fees and deductions), wait for the partial refund to process (35–51 business days total), and then place a new order at the current market price, which may differ from your original purchase price.</p>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <div className="flex gap-3">
          <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-600 leading-relaxed space-y-2">
            <p><strong>Legal Notice:</strong> This refund policy constitutes a binding agreement between you and SirDavid Gadgets. By completing a purchase, you acknowledge that you have read, understood, and agreed to these terms. We reserve the right to modify this policy at any time without prior notice. SirDavid Gadgets maintains sole discretion in determining return eligibility and refund amounts. All decisions are final and non-appealable. This policy is governed by the laws of the Federal Republic of Nigeria.</p>
            <p><strong>Fraud Prevention:</strong> All returns are subject to verification and fraud detection screening. Customers who abuse the return process, submit fraudulent claims, or engage in "wardrobing" behavior will be permanently banned from making future purchases and may be reported to relevant authorities.</p>
            <p><strong>Dispute Resolution:</strong> Any disputes arising from returns must be resolved through binding arbitration in Lagos, Nigeria. By initiating a return, you waive your right to participate in class-action lawsuits or public legal proceedings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Terms Content ────────────────────────────────────────────────────────────

const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    num: '1',
    title: 'Acceptance of Terms',
    body: [
      "By accessing, browsing, or using the SirDavid Gadgets website or placing an order, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you must not use our website or services.",
      "These terms apply to all visitors, users, and customers. We reserve the right to update these terms at any time. Continued use of the website after changes constitutes acceptance of the revised terms.",
    ],
  },
  {
    id: 'eligibility',
    num: '2',
    title: 'Eligibility & Account',
    body: [
      "You must be at least 18 years of age to make a purchase on our platform. By placing an order, you confirm that you meet this requirement.",
      "You are responsible for maintaining the confidentiality of any account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.",
    ],
  },
  {
    id: 'products',
    num: '3',
    title: 'Products, Descriptions & Pricing',
    body: [
      "We make every effort to ensure that product descriptions, images, and pricing are accurate. However, errors may occasionally occur. In the event of a pricing error, we reserve the right to cancel or refuse affected orders and will notify you promptly.",
      "Prices are displayed in Nigerian Naira (₦) and may also be shown in other currencies for reference. All prices are subject to change without notice.",
    ],
  },
  {
    id: 'orders',
    num: '4',
    title: 'Orders & Payment',
    body: [
      "Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. An order is confirmed only upon receipt of full payment and our acceptance email.",
      "All payments are processed securely through Paystack. By providing payment details, you represent that you are authorized to use the payment method. We do not store your card information.",
    ],
  },
  {
    id: 'delivery',
    num: '5',
    title: 'Delivery & Risk',
    body: [
      "Risk of loss or damage to goods transfers to you upon delivery. Title to goods passes upon full payment. Delivery timelines are estimates and are not guaranteed.",
      "You are responsible for providing accurate delivery information. Additional costs arising from incorrect address information are your responsibility.",
    ],
  },
  {
    id: 'returns',
    num: '6',
    title: 'Returns & Refunds',
    body: [
      "Our returns and refunds are governed by our Refund Policy, incorporated herein by reference. You are entitled to a refund or replacement for products that are defective, damaged in transit, or materially different from the description — within the stated return window.",
    ],
  },
  {
    id: 'ip',
    num: '7',
    title: 'Intellectual Property',
    body: [
      "All content on this website — including text, graphics, logos, images, and product descriptions — is the property of SirDavid Gadgets or its suppliers and is protected by intellectual property laws.",
      "You may not reproduce, distribute, or modify any content without our prior written consent.",
    ],
  },
  {
    id: 'liability',
    num: '8',
    title: 'Limitation of Liability',
    body: [
      "To the maximum extent permitted by law, SirDavid Gadgets shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website, products, or services.",
      "Our total liability for any claim shall not exceed the amount paid by you for the relevant transaction.",
    ],
  },
  {
    id: 'governing',
    num: '9',
    title: 'Governing Law & Disputes',
    body: [
      "These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of Nigerian courts.",
      "We encourage customers to contact us directly to resolve any dispute amicably before pursuing legal remedies.",
    ],
  },
];

function TermsContent() {
  const [activeSection, setActiveSection] = useState('acceptance');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        {/* Sticky TOC */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contents</p>
            <nav className="space-y-0.5">
              {TERMS_SECTIONS.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === s.id
                      ? 'bg-gray-900 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={`text-xs font-bold w-4 flex-shrink-0 ${activeSection === s.id ? 'text-white/60' : 'text-gray-400'}`}>{s.num}</span>
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Sections */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Notice banner */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">These terms were last updated in March 2026. Continued use of our services constitutes acceptance of any changes.</p>
          </div>

          {TERMS_SECTIONS.map(s => (
            <Card key={s.id} id={s.id} className="scroll-mt-24 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{s.num}</span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{s.title}</h2>
                </div>
                <div className="space-y-3">
                  {s.body.map((para, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed">{para}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Contact */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Questions about these terms?</h3>
              <p className="text-sm text-gray-600">Contact our team for any legal clarifications.</p>
            </div>
            <a href="mailto:legal@settlex.site" className="flex-shrink-0">
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" /> legal@settlex.site
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Privacy Content ──────────────────────────────────────────────────────────

const PRIVACY_SECTIONS = [
  {
    icon: <Database className="w-5 h-5 text-blue-600" />,
    title: 'Information We Collect',
    items: [
      'Identity Data: name, username',
      'Contact Data: email address, phone number, delivery address',
      'Payment Data: transaction reference (we do not store card numbers)',
      'Technical Data: IP address, browser type, cookies',
      'Usage Data: pages visited, search queries, purchase history',
    ],
  },
  {
    icon: <Eye className="w-5 h-5 text-blue-600" />,
    title: 'How We Use Your Data',
    items: [
      'Process and fulfil your orders, handle returns and refunds',
      'Send order confirmations, shipping updates, and receipts',
      'Respond to support enquiries and complaints',
      'Improve our website, product listings, and user experience',
      'Send promotional emails (only with your explicit consent)',
      'Detect and prevent fraud and unauthorized transactions',
    ],
  },
  {
    icon: <UserCheck className="w-5 h-5 text-blue-600" />,
    title: 'Legal Basis for Processing',
    items: [
      'Contract performance: to fulfil orders you place with us',
      'Legitimate interests: fraud prevention, site security',
      'Legal obligation: tax records, regulatory reporting',
      'Consent: marketing communications (revocable any time)',
    ],
  },
  {
    icon: <Globe className="w-5 h-5 text-blue-600" />,
    title: 'Sharing Your Information',
    items: [
      'Payment processors (Paystack) to complete transactions',
      'Logistics partners (GIG, DHL, Courier Plus) to deliver orders',
      'Email service providers (Brevo) for transactional emails',
      'Analytics tools — aggregated and anonymized data only',
      'Law enforcement, when required by Nigerian law or court order',
    ],
  },
  {
    icon: <Lock className="w-5 h-5 text-blue-600" />,
    title: 'Data Security',
    items: [
      'All data transmitted via HTTPS / TLS encryption',
      'Payment data handled entirely by PCI DSS-certified Paystack',
      'Databases access-controlled with role-based permissions',
      'Regular security audits and vulnerability assessments',
      'Immediate incident response procedures for data breaches',
    ],
  },
  {
    icon: <Cookie className="w-5 h-5 text-blue-600" />,
    title: 'Cookies',
    items: [
      'Session cookies: keep you signed in and remember your cart',
      'Preference cookies: remember currency and language settings',
      'Analytics cookies: anonymized traffic analysis only',
      'Security cookies: prevent fraudulent logins',
      'You can control cookies through your browser settings',
    ],
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    title: 'Your Rights',
    items: [
      'Access: request a copy of personal data we hold about you',
      'Rectification: correct inaccurate or incomplete data',
      'Erasure: request deletion of your data (subject to retention obligations)',
      'Restriction: limit how we process your data in certain circumstances',
      'Portability: receive your data in a structured, machine-readable format',
      'Objection: opt out of direct marketing at any time',
    ],
  },
];

function PrivacyContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Trust chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: <Ban className="w-4 h-4 text-blue-600" />, text: 'We never sell your data' },
          { icon: <Lock className="w-4 h-4 text-blue-600" />, text: 'Encrypted & secure storage' },
          { icon: <UserCheck className="w-4 h-4 text-blue-600" />, text: 'You control your data' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full px-4 py-2 text-sm font-medium text-gray-700">
            {item.icon} {item.text}
          </div>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {PRIVACY_SECTIONS.map((s, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <h2 className="font-bold text-gray-900 text-base">{s.title}</h2>
              </div>
              <ul className="space-y-2">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DPO contact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Privacy Enquiries</h3>
          <p className="text-sm text-gray-600">Reach our Data Protection Officer for any privacy-related concerns.</p>
        </div>
        <a href="mailto:privacy@settlex.site" className="flex-shrink-0">
          <Button className="gap-2">
            <Mail className="w-4 h-4" /> Contact DPO
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─── Legal Hub ────────────────────────────────────────────────────────────────

const LEGAL_DOCS = [
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    title: 'Terms & Conditions',
    desc: 'The rules governing use of our website and the purchase of products, including payment, delivery, returns, and liability.',
    href: '/terms-and-conditions',
    badge: '9 Sections',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    title: 'Privacy Policy',
    desc: 'How we collect, process, and protect your personal data, and your rights under applicable data protection law.',
    href: '/privacy-policy',
    badge: '7 Sections',
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-blue-600" />,
    title: 'Refund & Returns Policy',
    desc: 'Our 14-day return window, the step-by-step refund process, eligibility criteria, and exchange terms.',
    href: '/refund-policy',
    badge: '5-Step Process',
  },
  {
    icon: <Truck className="w-6 h-6 text-blue-600" />,
    title: 'Shipping Policy',
    desc: 'Delivery timelines, shipping methods, costs, international rules, and handling of lost or damaged packages.',
    href: '/shipping-policy',
    badge: '4 Options',
  },
];

function LegalContent() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Our Policy Documents</h2>
        <p className="text-sm text-gray-500">All documents are written in plain language. Last reviewed March 2026.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LEGAL_DOCS.map((doc, i) => (
          <Link key={i} to={doc.href}>
            <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    {doc.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">{doc.badge}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{doc.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{doc.desc}</p>
                <div className="flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600">
                  Read Policy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Transparency note */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6 flex gap-4">
          <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Our Commitment to Transparency</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              SirDavid Gadgets is committed to operating transparently and in compliance with Nigerian consumer protection laws and international best practices. We review and update our policies regularly to reflect changes in law and in our services.
            </p>
            <p className="text-sm text-gray-500">
              Legal enquiries:{' '}
              <a href="mailto:legal@settlex.site" className="text-blue-600 hover:underline">
                legal@settlex.site
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PolicyPage() {
  const location = useLocation();
  const path = location.pathname;

  const contentMap: Record<string, React.ReactNode> = {
    '/faqs': <FAQContent />,
    '/shipping-policy': <ShippingContent />,
    '/refund-policy': <RefundContent />,
    '/terms-and-conditions': <TermsContent />,
    '/privacy-policy': <PrivacyContent />,
    '/legal': <LegalContent />,
  };

  const content = contentMap[path] ?? (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-400">
      <Info className="w-10 h-10 mx-auto mb-4 opacity-40" />
      <p className="font-medium">Page not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <PageHeader path={path} />
        {content}
      </main>
      <Footer />
    </div>
  );
}