import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X,
  MapPin,
  CreditCard,
  FileText,
  AlertCircle,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

// Normalize backend status values
const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
};

// Get order tracking progress from backend status
const getTrackingProgress = (status) => {
  const normalized = normalizeStatus(status);

  const stages = [
    { key: "ordered", label: "Ordered", icon: ShoppingBag },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const statusMap = {
    pending: 0,
    confirmed: 0,
    ordered: 0,
    paymentpending: 0,
    paymentfailed: 0,

    processing: 1,
    packed: 1,
    prepared: 1,

    shipped: 2,
    dispatched: 2,
    outfordelivery: 2,

    delivered: 3,
  };

  const currentStep = statusMap[normalized] ?? -1;

  return {
    stages,
    currentStep,
    isCancelled: normalized === "cancelled",
    isUnknown: currentStep === -1 && normalized !== "cancelled",
  };
};

// Reusable tracking component
function OrderTracking({ orderStatus, paymentStatus }) {
  const {
    stages,
    currentStep,
    isCancelled,
    isUnknown,
  } = getTrackingProgress(orderStatus);

  const isPaid = normalizeStatus(paymentStatus) === "paid";

  return (
    <div className="mt-5 rounded-2xl border border-neutral-100 bg-white p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-neutral-900">
            Order Tracking
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Track your order delivery progress
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold ${isCancelled
              ? "bg-rose-100 text-rose-700"
              : currentStep === 3
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
        >
          {isCancelled
            ? "Cancelled"
            : isUnknown
              ? orderStatus || "Status unavailable"
              : stages[currentStep].label}
        </span>
      </div>

      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4">
          <AlertCircle size={22} className="shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-rose-800">
              Order Cancelled
            </p>
            <p className="mt-1 text-xs text-rose-600">
              This order is no longer being processed.
            </p>
          </div>
        </div>
      ) : isUnknown ? (
        <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-700">
          Current order status: <b>{orderStatus || "Unknown"}</b>.
          Tracking progress is unavailable for this status.
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-neutral-100" />

            <div
              className="absolute left-[12.5%] top-5 h-1 rounded-full bg-[#5C0F17] transition-all duration-500"
              style={{
                width: `${(currentStep / 3) * 75}%`,
              }}
            />

            <div className="relative grid grid-cols-4">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const completed = index <= currentStep;
                const active = index === currentStep;

                return (
                  <div
                    key={stage.key}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${completed
                          ? "border-[#5C0F17] bg-[#5C0F17] text-white"
                          : "border-neutral-200 bg-white text-neutral-400"
                        } ${active
                          ? "ring-4 ring-[#5C0F17]/10"
                          : ""
                        }`}
                    >
                      <Icon size={17} />
                    </div>

                    <p
                      className={`mt-3 text-[10px] font-bold sm:text-xs ${completed
                          ? "text-neutral-900"
                          : "text-neutral-400"
                        }`}
                    >
                      {stage.label}
                    </p>

                    {active && (
                      <span className="mt-1 text-[9px] font-semibold text-[#5C0F17]">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-neutral-100 pt-4">
            {isPaid ? (
              <CheckCircle2
                size={15}
                className="text-emerald-600"
              />
            ) : (
              <Clock
                size={15}
                className="text-amber-600"
              />
            )}

            <p className="text-xs text-neutral-600">
              Payment:{" "}
              <span
                className={`font-bold ${isPaid
                    ? "text-emerald-700"
                    : "text-amber-700"
                  }`}
              >
                {paymentStatus || "Pending"}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/orders" } },
      });
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/orders/my-orders");

      setOrders(res.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Unable to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";

      case "processing":
      case "shipped":
      case "dispatched":
      case "outfordelivery":
        return "bg-blue-100 text-blue-800 border-blue-200";

      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";

      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5C0F17] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track and view history of your purchases
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#5C0F17]"
        >
          <ArrowLeft size={14} /> Back to Shopping
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <Package size={32} />
          </div>

          <h2 className="mt-4 text-xl font-bold text-neutral-900">
            No orders placed yet
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            When you purchase products, your order summary and delivery updates will appear here.
          </p>

          <Link
            to="/"
            className="mt-6 rounded-full bg-[#5C0F17] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4A0D15]"
          >
            Start Exploring Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid =
              normalizeStatus(order.paymentStatus) === "paid";

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50/50 px-5 py-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-neutral-900">
                      {order.orderNumber}
                    </span>

                    <span className="text-neutral-400">|</span>

                    <span className="text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${isPaid
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock size={12} />
                      )}

                      {isPaid ? "Paid" : "Payment Pending"}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 font-bold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus || "Pending"}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-[#5C0F17] hover:underline"
                    >
                      View Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="divide-y divide-neutral-100">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 rounded-xl object-cover bg-neutral-50"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                            <Package size={20} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-neutral-900">
                            {item.name}
                          </p>

                          <p className="text-xs text-neutral-500">
                            Qty: {item.quantity} × ₹
                            {Number(item.price).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="text-right text-sm font-bold text-neutral-900">
                          ₹
                          {Number(
                            item.price * item.quantity
                          ).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* NEW: Order Tracking */}
                  <OrderTracking
                    orderStatus={order.orderStatus}
                    paymentStatus={order.paymentStatus}
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                    <div>
                      <span>Delivery To: </span>

                      <span className="font-semibold text-neutral-700">
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state} (
                        {order.shippingAddress?.postalCode})
                      </span>
                    </div>

                    <div className="text-sm font-black text-neutral-900">
                      Total: ₹
                      {Number(order.totalAmount).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#5C0F17]">
                <FileText size={20} />
              </span>

              <div>
                <h2 className="text-xl font-black text-neutral-900">
                  Order {selectedOrder.orderNumber}
                </h2>

                <p className="text-xs text-neutral-400">
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* NEW: Order Tracking in Details */}
            <OrderTracking
              orderStatus={selectedOrder.orderStatus}
              paymentStatus={selectedOrder.paymentStatus}
            />

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-xs">
                <div className="mb-2 flex items-center gap-1.5 font-bold text-neutral-800">
                  <CreditCard size={15} className="text-[#5C0F17]" />
                  Payment Details
                </div>

                <div className="space-y-1 text-neutral-600">
                  <p>
                    <span className="text-neutral-400">Method:</span>{" "}
                    <b className="uppercase">
                      {selectedOrder.paymentMethod}
                    </b>
                  </p>

                  <p>
                    <span className="text-neutral-400">Payment Status:</span>{" "}
                    <b
                      className={
                        normalizeStatus(selectedOrder.paymentStatus) === "paid"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }
                    >
                      {selectedOrder.paymentStatus}
                    </b>
                  </p>

                  {selectedOrder.paymentDetails?.razorpayOrderId && (
                    <p className="font-mono text-[11px]">
                      <span className="text-neutral-400">
                        Razorpay Order:
                      </span>{" "}
                      {selectedOrder.paymentDetails.razorpayOrderId}
                    </p>
                  )}

                  {selectedOrder.paymentDetails?.razorpayPaymentId && (
                    <p className="font-mono text-[11px]">
                      <span className="text-neutral-400">
                        Razorpay Payment:
                      </span>{" "}
                      {selectedOrder.paymentDetails.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-xs">
                <div className="mb-2 flex items-center gap-1.5 font-bold text-neutral-800">
                  <MapPin size={15} className="text-[#5C0F17]" />
                  Shipping Details
                </div>

                <div className="text-neutral-600">
                  <p className="font-bold text-neutral-800">
                    {selectedOrder.customerDetails?.name}
                  </p>

                  <p>{selectedOrder.customerDetails?.email}</p>

                  {selectedOrder.customerDetails?.phone && (
                    <p>{selectedOrder.customerDetails.phone}</p>
                  )}

                  <p className="mt-1 text-neutral-500">
                    {selectedOrder.shippingAddress?.street},{" "}
                    {selectedOrder.shippingAddress?.city},{" "}
                    {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                Items Ordered
              </h3>

              <div className="divide-y divide-neutral-100 border-y border-neutral-100">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 py-3"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-xl object-cover bg-neutral-50"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                        <Package size={20} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-800">
                        {item.name}
                      </p>

                      <p className="text-xs text-neutral-400">
                        Qty: {item.quantity} × ₹
                        {Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="text-right text-sm font-bold text-neutral-900">
                      ₹
                      {Number(
                        item.price * item.quantity
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-2 rounded-2xl bg-neutral-50 p-4 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>
                  ₹{Number(selectedOrder.subtotal).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-neutral-500">
                <span>Shipping Charges</span>

                <span>
                  {selectedOrder.shippingFee === 0
                    ? "FREE"
                    : `₹${selectedOrder.shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between border-t border-neutral-200 pt-2 text-sm font-black text-neutral-900">
                <span>Grand Total</span>

                <span>
                  ₹
                  {Number(selectedOrder.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}