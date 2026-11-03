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
  MapPin,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  CreditCard,
} from 'lucide-react';

import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { profileService } from '../services/profileService';
import { validateCheckoutAddress } from '../validations/orderValidation';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useStore();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  // Authoritative Quote state
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Address Selection & Management in Checkout
  const savedAddresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const defaultIdx = savedAddresses.findIndex((a) => a.isDefault);
  const initialSelectedIdx = defaultIdx !== -1 ? defaultIdx : (savedAddresses.length > 0 ? 0 : null);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(initialSelectedIdx);
  const [useDifferentAddress, setUseDifferentAddress] = useState(savedAddresses.length === 0);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [checkoutFieldErrors, setCheckoutFieldErrors] = useState({});

  const [differentAddressForm, setDifferentAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Sync selected address index if user changes
  useEffect(() => {
    const addrs = Array.isArray(user?.addresses) ? user.addresses : [];
    if (addrs.length > 0) {
      const dIdx = addrs.findIndex((a) => a.isDefault);
      setSelectedAddressIndex(dIdx !== -1 ? dIdx : 0);
      setUseDifferentAddress(false);
    } else {
      setSelectedAddressIndex(null);
      setUseDifferentAddress(true);
    }
  }, [user?.addresses]);

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

  const handleDifferentAddressChange = (field, value) => {
    setDifferentAddressForm((prev) => ({ ...prev, [field]: value }));
    setCheckoutFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setError('');
  };

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }
    setError('');
    setCheckoutFieldErrors({});
    const addrs = Array.isArray(user?.addresses) ? user.addresses : [];
    if (addrs.length > 0) {
      const dIdx = addrs.findIndex((a) => a.isDefault);
      setSelectedAddressIndex(dIdx !== -1 ? dIdx : 0);
      setUseDifferentAddress(false);
    } else {
      setSelectedAddressIndex(null);
      setUseDifferentAddress(true);
    }
    setSaveAddressToProfile(false);
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
    setCheckoutFieldErrors({});

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    let finalShippingAddress = null;
    let finalCustomerName = '';
    let finalCustomerPhone = '';

    if (
      !useDifferentAddress &&
      savedAddresses.length > 0 &&
      selectedAddressIndex !== null &&
      savedAddresses[selectedAddressIndex]
    ) {
      const selected = savedAddresses[selectedAddressIndex];
      finalCustomerName = selected.name?.trim() || user?.name || '';
      finalCustomerPhone = selected.phone?.trim() || user?.phone || '';
      finalShippingAddress = {
        name: finalCustomerName,
        phone: finalCustomerPhone,
        street: selected.street?.trim() || '',
        city: selected.city?.trim() || '',
        state: selected.state?.trim() || '',
        postalCode: selected.postalCode?.trim() || '',
        country: selected.country || 'India',
      };

      if (!finalShippingAddress.street || !finalShippingAddress.city || !finalShippingAddress.state || !finalShippingAddress.postalCode) {
        setError('Selected address is missing required fields. Please edit it or use a different address.');
        return;
      }
    } else {
      // Validate different address using modular validator
      const val = validateCheckoutAddress(differentAddressForm);
      if (!val.isValid) {
        setCheckoutFieldErrors(val.errors);
        setError(Object.values(val.errors)[0]);
        return;
      }

      const name = differentAddressForm.name.trim();
      const phone = differentAddressForm.phone.trim();
      const street = differentAddressForm.street.trim();
      const city = differentAddressForm.city.trim();
      const state = differentAddressForm.state.trim();
      const postalCode = differentAddressForm.postalCode.trim();
      const country = differentAddressForm.country?.trim() || 'India';

      finalCustomerName = name;
      finalCustomerPhone = phone;
      finalShippingAddress = {
        name,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
      };

      // If user selected to save this address and has < 3 addresses saved
      if (saveAddressToProfile && savedAddresses.length < 3) {
        try {
          const newAddressItem = {
            name,
            phone,
            street,
            city,
            state,
            postalCode,
            country,
            isDefault: savedAddresses.length === 0,
          };
          const updatedAddresses = [...savedAddresses, newAddressItem];
          const profRes = await profileService.updateProfile({ addresses: updatedAddresses });
          if (profRes && profRes.success && profRes.user) {

            updateUser(profRes.user);
          }
        } catch (saveErr) {
          console.warn('Unable to auto-save address to profile:', saveErr);
        }
      }
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
          name: finalCustomerName,
          email: user?.email || '',
          phone: finalCustomerPhone,
        },
        shippingAddress: finalShippingAddress,
        paymentMethod: paymentMethod,
      };

      const res = await api.post('/orders', payload);

      if (res.success && res.order) {
        if (paymentMethod === 'razorpay' && res.razorpayOrder) {
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
              name: finalCustomerName,
              email: user?.email || '',
              contact: finalCustomerPhone,
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

        // Fallback order completion if direct capture
        setOrderSuccess(res.order);
        clearCart();
        setCheckoutOpen(false);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setCheckoutFieldErrors(err.fieldErrors);
      }
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

            <form onSubmit={handlePlaceOrder} className="mt-6 space-y-5">
              {/* Recipient Account / Contact Banner */}
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Account Email
                  </span>
                  <span className="font-bold text-neutral-800 font-mono">
                    {user?.email || 'N/A'}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400">Order confirmation & receipt</span>
              </div>

              {/* Delivery Address Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#5C0F17]" />
                    <label className="text-xs font-black uppercase tracking-wider text-neutral-800">
                      Delivery Address *
                    </label>
                  </div>
                  {savedAddresses.length > 0 && !useDifferentAddress && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
                      {savedAddresses.length}/3 Saved
                    </span>
                  )}
                </div>

                {/* Case 1: Customer has saved addresses and is selecting one */}
                {savedAddresses.length > 0 && !useDifferentAddress ? (
                  <div className="space-y-2.5">
                    {savedAddresses.map((addr, idx) => {
                      const isSelected = selectedAddressIndex === idx;
                      return (
                        <div
                          key={addr._id || idx}
                          onClick={() => setSelectedAddressIndex(idx)}
                          className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                            isSelected
                              ? 'border-[#5C0F17] bg-[#FFFDF9] ring-2 ring-[#5C0F17]/15 shadow-xs'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                                  isSelected
                                    ? 'border-[#5C0F17] bg-[#5C0F17] text-white'
                                    : 'border-neutral-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check size={12} className="stroke-[3]" />}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-neutral-900">
                                  {addr.name || user?.name || 'Recipient'}
                                </span>
                                {(addr.phone || user?.phone) && (
                                  <span className="text-xs font-medium text-neutral-500">
                                    • {addr.phone || user?.phone}
                                  </span>
                                )}
                                {addr.isDefault && (
                                  <span className="rounded-full bg-[#DA9B26]/15 px-2 py-0.5 text-[10px] font-bold text-[#5C0F17] border border-[#DA9B26]/30">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                                {addr.street}, {addr.city}, {addr.state} -{' '}
                                <span className="font-semibold text-neutral-900 font-mono">
                                  {addr.postalCode}
                                </span>
                              </p>
                              <p className="text-[11px] text-neutral-400 mt-0.5">
                                {addr.country || 'India'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setDifferentAddressForm({
                          name: user?.name || '',
                          phone: user?.phone || '',
                          street: '',
                          city: '',
                          state: '',
                          postalCode: '',
                          country: 'India',
                        });
                        setUseDifferentAddress(true);
                      }}
                      className="w-full mt-1.5 rounded-xl border border-dashed border-[#5C0F17]/40 bg-[#FAF6F0]/40 py-2.5 text-xs font-bold text-[#5C0F17] hover:bg-[#FAF6F0] transition"
                    >
                      + Deliver to a different address
                    </button>
                  </div>
                ) : (
                  /* Case 2: Customer enters a new or different address */
                  <div className="space-y-3.5">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseDifferentAddress(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C0F17] hover:underline"
                      >
                        <ArrowLeft size={13} /> Back to saved addresses ({savedAddresses.length})
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-700">Recipient Name *</label>
                        <input
                          value={differentAddressForm.name}
                          onChange={(e) => handleDifferentAddressChange('name', e.target.value)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition ${
                            checkoutFieldErrors.name
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                              : 'border-neutral-200 bg-white focus:border-[#5C0F17]'
                          }`}
                          placeholder="e.g. Kunal Rathore"
                        />
                        {checkoutFieldErrors.name && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">
                            {checkoutFieldErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700">Phone Number *</label>
                        <input
                          value={differentAddressForm.phone}
                          onChange={(e) => handleDifferentAddressChange('phone', e.target.value)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition ${
                            checkoutFieldErrors.phone
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                              : 'border-neutral-200 bg-white focus:border-[#5C0F17]'
                          }`}
                          placeholder="e.g. 9876543210"
                        />
                        {checkoutFieldErrors.phone && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">
                            {checkoutFieldErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700">Street Address *</label>
                      <input
                        value={differentAddressForm.street}
                        onChange={(e) => handleDifferentAddressChange('street', e.target.value)}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition ${
                          checkoutFieldErrors.street
                            ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                            : 'border-neutral-200 bg-white focus:border-[#5C0F17]'
                        }`}
                        placeholder="House / Flat #, Apartment, Street name"
                      />
                      {checkoutFieldErrors.street && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-600">
                          {checkoutFieldErrors.street}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-neutral-700">City *</label>
                        <input
                          value={differentAddressForm.city}
                          onChange={(e) => handleDifferentAddressChange('city', e.target.value)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition ${
                            checkoutFieldErrors.city
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                              : 'border-neutral-200 bg-white focus:border-[#5C0F17]'
                          }`}
                          placeholder="City"
                        />
                        {checkoutFieldErrors.city && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">
                            {checkoutFieldErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700">State *</label>
                        <input
                          value={differentAddressForm.state}
                          onChange={(e) => handleDifferentAddressChange('state', e.target.value)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition ${
                            checkoutFieldErrors.state
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                              : 'border-neutral-200 bg-white focus:border-[#5C0F17]'
                          }`}
                          placeholder="State"
                        />
                        {checkoutFieldErrors.state && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">
                            {checkoutFieldErrors.state}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700">PIN Code *</label>
                        <input
                          maxLength={6}
                          value={differentAddressForm.postalCode}
                          onChange={(e) =>
                            handleDifferentAddressChange(
                              'postalCode',
                              e.target.value.replace(/\D/g, '')
                            )
                          }
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none transition ${
                            checkoutFieldErrors.postalCode
                              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20'
                              : 'border-neutral-200 bg-white focus:border-[#5C0F17]'
                          }`}
                          placeholder="6 digits"
                        />
                        {checkoutFieldErrors.postalCode && (
                          <p className="mt-1 text-[11px] font-semibold text-rose-600">
                            {checkoutFieldErrors.postalCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Profile Saving Option & Maximum 3 Limit Notice */}
                    {savedAddresses.length < 3 ? (
                      <label className="flex items-start gap-2.5 rounded-xl border border-neutral-200/90 bg-neutral-50/60 p-3 text-xs cursor-pointer hover:bg-neutral-50 transition">
                        <input
                          type="checkbox"
                          checked={saveAddressToProfile}
                          onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#5C0F17] focus:ring-[#5C0F17] accent-[#5C0F17]"
                        />
                        <div>
                          <span className="font-bold text-neutral-800 block">
                            Save this address to my profile for future orders
                          </span>
                          <span className="text-[11px] text-neutral-400 block mt-0.5">
                            Quick 1-click checkout for your next puja booking ({savedAddresses.length}/3 saved).
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                        <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          <span className="font-bold">Maximum 3 saved addresses reached.</span>
                          <p className="text-amber-800/90 mt-0.5">
                            You have reached the maximum limit of 3 saved addresses. This address will be used for your current order, but cannot be saved to your profile unless an existing address is removed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-neutral-700">Payment Method</label>
                <div className="mt-2 rounded-xl border border-[#5C0F17] bg-rose-50/60 p-3.5 text-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5C0F17]">
                    <CreditCard size={16} className="text-[#5C0F17]" />
                    <span>Razorpay Secure Online Checkout</span>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      100% Secure
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-600 leading-relaxed">
                    Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit / Debit Cards, or NetBanking.
                  </p>
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
