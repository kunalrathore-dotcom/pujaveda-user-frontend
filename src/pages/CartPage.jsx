import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  CheckCircle,
  ShieldCheck,
  X,
  Loader2,
  Receipt,
  Sparkles,
} from 'lucide-react';

import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useStore();
  const { user, isAuthenticated } = useAuth();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  // Authoritative Quote state
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: 'India',
    paymentMethod: 'razorpay',
  });

  // Fetch authoritative pricing quote from backend
  const fetchQuote = async () => {
    if (!cart || !cart.length) {
      setQuote(null);
      return;
    }

    try {
      setQuoteLoading(true);
      const items = cart.map((item) => ({
        productId: item._id || item.id,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders/quote', { items });

      if (res.success && res.quote) {
        setQuote(res.quote);
      }
    } catch (err) {
      console.warn('Failed to fetch pricing quote:', err.message);
    } finally {
      setQuoteLoading(false);
    }
  };

  // Re-fetch authoritative price quote when cart items change
  useEffect(() => {
    if (cart.length > 0) {
      fetchQuote();
    } else {
      setQuote(null);
    }
  }, [cart]);

  // Track cart viewed
  useEffect(() => {
    if (cart && cart.length > 0) {
      api
        .post('/audit/track', {
          eventType: 'CART_VIEWED',
          category: 'shopping',
          description: `User viewed cart with ${cart.length} item(s)`,
          metadata: { itemsCount: cart.length },
        })
        .catch(() => {});
    }
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setCheckoutOpen(true);
    api
      .post('/audit/track', {
        eventType: 'CHECKOUT_INITIATED',
        category: 'shopping',
        description: `User initiated checkout with ${cart.length} item(s)`,
        metadata: {
          itemsCount: cart.length,
          subtotal: quote?.subtotal || cartTotal,
        },
      })
      .catch(() => {});
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postalCode.trim()
    ) {
      setError('Please fill in all required shipping and contact details.');
      return;
    }

    try {
      setSubmitting(true);

      const items = cart.map((item) => ({
        productId: item._id || item.id,
        quantity: item.quantity,
      }));

      const payload = {
        items,
        customerDetails: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        shippingAddress: {
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country || 'India',
        },
        paymentMethod: form.paymentMethod,
      };

      const res = await api.post('/orders', payload);

      if (res.success && res.order) {
        if (form.paymentMethod === 'razorpay' && res.razorpayOrder) {
          const loaded = await loadRazorpayScript();
          if (!loaded) {
            setError('Unable to load Razorpay payment SDK. Please check your connection.');
            setSubmitting(false);
            return;
          }

          const options = {
            key: res.razorpayOrder.keyId,
            amount: res.razorpayOrder.amount,
            currency: res.razorpayOrder.currency || 'INR',
            name: 'Pujaveda',
            description: `Order ${res.order.orderNumber}`,
            order_id: res.razorpayOrder.orderId,
            prefill: {
              name: form.name.trim(),
              email: form.email.trim(),
              contact: form.phone.trim(),
            },
            theme: {
              color: '#5C0F17',
            },
            handler: async (response) => {
              try {
                setSubmitting(true);
                const verifyRes = await api.post('/payments/verify', {
                  orderId: res.order._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                setOrderSuccess(verifyRes.order || res.order);
                clearCart();
                setCheckoutOpen(false);
              } catch (verifyErr) {
                console.error('Payment verification error:', verifyErr);
                setError('Payment verification failed: ' + verifyErr.message);
              } finally {
                setSubmitting(false);
              }
            },
            modal: {
              ondismiss: () => {
                setSubmitting(false);
                setError(
                  'Payment checkout cancelled. Your order has been saved with pending status.'
                );
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.on('payment.failed', (resp) => {
            setError(
              'Payment failed: ' + (resp.error?.description || 'Transaction declined')
            );
            setSubmitting(false);
          });
          rzp.open();
          return;
        }

        // For COD or direct methods
        setOrderSuccess(res.order);
        clearCart();
        setCheckoutOpen(false);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.message || 'Failed to place order. Please check item stock.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle size={40} />
        </div>
        <span className="mt-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          Order Confirmed
        </span>
        <h1 className="mt-3 text-3xl font-black">Thank you for your order!</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Your order number is <b className="text-neutral-900">{orderSuccess.orderNumber}</b>.
        </p>
        <div className="mt-6 w-full rounded-2xl border border-neutral-100 bg-[#f8f8f8] p-5 text-left text-xs">
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">Subtotal:</span>
            <span className="font-semibold text-neutral-900">
              ₹{(orderSuccess.subtotal || orderSuccess.totalAmount).toLocaleString('en-IN')}
            </span>
          </div>
          {orderSuccess.coupon?.discount > 0 && (
            <div className="flex justify-between py-1 text-emerald-700">
              <span>Coupon Discount ({orderSuccess.coupon.code}):</span>
              <span className="font-semibold">
                -₹{orderSuccess.coupon.discount.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          {orderSuccess.taxAmount > 0 && (
            <div className="flex justify-between py-1 text-neutral-600">
              <span>GST & Taxes:</span>
              <span className="font-semibold">
                +₹{orderSuccess.taxAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          {orderSuccess.platformFee > 0 && (
            <div className="flex justify-between py-1 text-neutral-600">
              <span>Platform Fee:</span>
              <span className="font-semibold">
                +₹{orderSuccess.platformFee.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 py-1.5 font-bold">
            <span className="text-neutral-900">Total Paid/Payable:</span>
            <span className="text-sm font-black text-[#5C0F17]">
              ₹{orderSuccess.totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">Payment Method:</span>
            <span className="font-semibold uppercase text-neutral-800">
              {orderSuccess.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-500">Delivery Address:</span>
            <span className="text-right text-neutral-700">
              {orderSuccess.shippingAddress.street}, {orderSuccess.shippingAddress.city},{' '}
              {orderSuccess.shippingAddress.postalCode}
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/orders"
            className="!text-white rounded-full bg-neutral-900 px-7 py-3 text-sm font-bold transition hover:bg-neutral-800"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="rounded-full bg-[#5C0F17] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#4A0D15]"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  if (!cart.length) {
    return (
      <section className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-center justify-center px-5 py-16 text-center">
        <ShoppingBag size={44} className="text-neutral-300" />
        <h1 className="mt-5 text-3xl font-black">Your cart is waiting.</h1>
        <p className="mt-3 text-sm text-neutral-500">Discover something you'll love.</p>
        <Link
          to="/"
          className="mt-6 rounded-full bg-[#5C0F17] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4A0D15]"
        >
          Explore products
        </Link>
      </section>
    );
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-[#5C0F17] focus:ring-2 focus:ring-[#5C0F17]/10';

  // Calculations for summary display
  const displaySubtotal = quote?.subtotal ?? cartTotal;
  const displayTotal = quote?.totalAmount ?? cartTotal;

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-black sm:text-4xl">Your Cart</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {cart.length} different product(s) in your bag
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart Items List */}
        <div className="space-y-4">
          {cart.map((item) => (
            <article
              key={item._id || item.id}
              className="flex gap-4 rounded-2xl border border-neutral-100 p-3 sm:gap-5 sm:p-5"
            >
              <Link to={`/product/${item._id || item.id}`} className="shrink-0">
                <img
                  src={item.images?.[0] || ''}
                  alt={item.name}
                  className="h-28 w-28 rounded-xl bg-neutral-100 object-cover sm:h-36 sm:w-36"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link to={`/product/${item._id || item.id}`}>
                  <h2 className="font-bold hover:text-[#5C0F17]">{item.name}</h2>
                </Link>

                <p className="mt-2 text-sm font-extrabold">
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center rounded-lg border border-neutral-200">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQuantity(item._id || item.id, item.quantity - 1)
                      }
                      disabled={item.quantity === 1}
                      className="p-2 disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="min-w-7 text-center text-sm font-bold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        updateQuantity(item._id || item.id, item.quantity + 1)
                      }
                      className="p-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item._id || item.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-500 transition hover:text-red-600"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Order Summary Breakdown */}
        <aside className="rounded-2xl bg-[#f8f8f8] p-5 sm:p-6 lg:sticky lg:top-36">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-neutral-900">Order Summary</h2>
            {quoteLoading && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Loader2 size={14} className="animate-spin text-[#5C0F17]" />
                Calculating...
              </span>
            )}
          </div>

          {/* Authoritative Price Breakdown */}
          <div className="mt-5 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Verified Product Subtotal</span>
              <span className="font-semibold text-neutral-900">
                ₹{displaySubtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Configured Taxes & Fees */}
            {quote?.chargesBreakdown && quote.chargesBreakdown.length > 0 ? (
              quote.chargesBreakdown.map((charge) => (
                <div
                  key={charge.key}
                  className="flex justify-between text-neutral-600"
                >
                  <span>{charge.name}</span>
                  <span className="font-medium text-neutral-800">
                    +₹{charge.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between text-neutral-500">
                  <span>GST (Estimated 18%)</span>
                  <span>
                    +₹
                    {Math.round(displaySubtotal * 0.18).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Platform Fee</span>
                  <span>
                    +₹
                    {Math.round(displaySubtotal * 0.02).toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>

            <div className="my-3 border-t border-neutral-200" />

            <div className="flex justify-between text-base">
              <span className="font-bold text-neutral-900">Final Total Payable</span>
              <span className="text-xl font-black text-[#5C0F17]">
                ₹{displayTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCheckout}
            className="mt-6 w-full rounded-full bg-[#5C0F17] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#4A0D15]"
          >
            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>

          <p className="mt-3 text-center text-[10px] text-neutral-400">
            Backed by secure server-side quote and Razorpay payment gateway.
          </p>
        </aside>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#5C0F17]" size={24} />
              <h2 className="text-xl font-black text-neutral-900">Checkout</h2>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Provide delivery details to complete your order.
            </p>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                {error}
              </p>
            )}

            <form onSubmit={handlePlaceOrder} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={inputClass}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700">Street Address *</label>
                <input
                  required
                  value={form.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className={inputClass}
                  placeholder="House / Flat / Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700">City *</label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={inputClass}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700">State *</label>
                  <input
                    required
                    value={form.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={inputClass}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700">Postal Code *</label>
                  <input
                    required
                    value={form.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className={inputClass}
                    placeholder="PIN Code"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700">Payment Method</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                      form.paymentMethod === 'razorpay'
                        ? 'border-[#5C0F17] bg-rose-50 text-[#5C0F17]'
                        : 'border-neutral-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={form.paymentMethod === 'razorpay'}
                      onChange={() => handleInputChange('paymentMethod', 'razorpay')}
                      className="accent-[#5C0F17]"
                    />
                    Razorpay (UPI / Cards / NetBanking)
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                      form.paymentMethod === 'cod'
                        ? 'border-[#5C0F17] bg-rose-50 text-[#5C0F17]'
                        : 'border-neutral-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={() => handleInputChange('paymentMethod', 'cod')}
                      className="accent-[#5C0F17]"
                    />
                    Cash on Delivery
                  </label>
                </div>
              </div>

              {/* Order breakdown inside modal */}
              <div className="mt-4 rounded-xl bg-neutral-50 p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{displaySubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {quote?.chargesBreakdown?.map((c) => (
                  <div key={c.key} className="flex justify-between text-neutral-500 text-[11px]">
                    <span>{c.name}:</span>
                    <span>+₹{c.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-sm">
                  <span>Total Amount:</span>
                  <span className="text-[#5C0F17]">
                    ₹{displayTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#5C0F17] py-3.5 text-sm font-bold text-white transition hover:bg-[#4A0D15] disabled:opacity-50"
              >
                {submitting
                  ? 'Placing Order...'
                  : `Confirm Order (₹${displayTotal.toLocaleString('en-IN')})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
