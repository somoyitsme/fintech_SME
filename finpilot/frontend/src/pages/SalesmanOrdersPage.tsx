import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  CheckCircle, 
  Clock, 
  Printer, 
  MapPin, 
  Phone, 
  Calendar,
  AlertCircle,
  ExternalLink,
  Send,
  Zap,
  Package,
  Store as StoreIcon,
  Globe,
  Check,
  Barcode
} from 'lucide-react';
import { useStore, Order } from '../context/StoreContext';

export const SalesmanOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, dispatchWithCourier } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [customCodAmount, setCustomCodAmount] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const onlineOrdersCount = orders.filter(o => o.orderType === 'online').length;
  const offlineOrdersCount = orders.filter(o => o.orderType === 'offline').length;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.courier && o.courier.consignmentId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'all' ||
      (filterType === 'online' && o.orderType === 'online') ||
      (filterType === 'offline' && o.orderType === 'offline');

    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleQuickDispatch = (orderId: string, provider: 'Pathao' | 'Steadfast') => {
    dispatchWithCourier(orderId, provider);
    showToast(`Order dispatched to ${provider} Courier successfully! Live consignment ID generated.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Order Management & Courier Dispatch
            </h1>
            <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {orders.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Manage counter walk-in sales & online delivery orders. 1-click dispatch to Pathao and Steadfast Courier.
          </p>
        </div>

        {/* Order Type Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] self-start lg:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-white dark:bg-[#21262d] text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Orders</span>
            <span className="text-[10px] bg-slate-200 dark:bg-[#30363d] px-1.5 py-0.2 rounded-full font-mono">
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => setFilterType('online')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'online'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Online Delivery</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filterType === 'online' ? 'bg-blue-800 text-white' : 'bg-slate-200 dark:bg-[#30363d]'
            }`}>
              {onlineOrdersCount}
            </span>
          </button>
          <button
            onClick={() => setFilterType('offline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'offline'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Offline Counter</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filterType === 'offline' ? 'bg-emerald-800 text-white' : 'bg-slate-200 dark:bg-[#30363d]'
            }`}>
              {offlineOrdersCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-3 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by order #, client name, consignment tracking ID, or hardware..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl px-3 py-2 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-[#161b22]">All Statuses</option>
            <option value="Ready for Dispatch" className="bg-white dark:bg-[#161b22]">Ready for Dispatch</option>
            <option value="Processing" className="bg-white dark:bg-[#161b22]">Processing</option>
            <option value="In Transit" className="bg-white dark:bg-[#161b22]">In Transit</option>
            <option value="Delivered" className="bg-white dark:bg-[#161b22]">Delivered</option>
            <option value="Counter Collected" className="bg-white dark:bg-[#161b22]">Counter Collected</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="enterprise-table w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-500 dark:text-[#8b949e] font-semibold border-b border-slate-200 dark:border-[#30363d]">
              <tr>
                <th className="py-3 px-4">Order # & Type</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Products Manifest</th>
                <th className="py-3 px-4">Total & Payment</th>
                <th className="py-3 px-4">Courier / Delivery</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isOnline = order.orderType === 'online';
                  const isCourierDispatched = !!order.courier;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 dark:hover:bg-[#21262d]/50 transition">
                      {/* Order # and Type */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.orderNumber}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {order.orderDate}
                        </div>
                        <div className="mt-1.5">
                          {isOnline ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Globe className="w-2.5 h-2.5" /> Online Delivery
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <StoreIcon className="w-2.5 h-2.5" /> Counter Sale
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer & Location */}
                      <td className="py-3.5 px-4 max-w-xs align-top">
                        <div className="font-semibold text-slate-900 dark:text-[#f0f6fc]">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-[#8b949e] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {order.contactNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#8b949e] flex items-start gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" /> 
                          <span className="line-clamp-2">{order.deliveryAddress}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium max-w-xs align-top">
                        <div className="line-clamp-2">{order.itemsSummary}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Sales rep: <span className="font-medium text-slate-600 dark:text-slate-300">{order.salesman}</span>
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="py-3.5 px-4 font-mono align-top">
                        <div className="font-bold text-slate-900 dark:text-[#f0f6fc] text-sm">
                          ৳ {order.totalAmount.toLocaleString()}
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            -৳{order.discountAmount.toLocaleString()} disc ({order.discountPercent}%)
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 font-normal uppercase mt-0.5">
                          {order.paymentMethod} · 
                          <span className={`font-semibold ml-1 ${
                            order.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Courier & Delivery Status */}
                      <td className="py-3.5 px-4 align-top">
                        {isOnline ? (
                          isCourierDispatched ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  order.courier?.provider === 'Pathao'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                }`}>
                                  {order.courier?.provider}
                                </span>
                                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Dispatched
                                </span>
                              </div>
                              <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-[#21262d] px-2 py-0.5 rounded border border-slate-200 dark:border-[#30363d] inline-block">
                                {order.courier?.consignmentId}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                COD: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">৳{order.courier?.codAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> Awaiting Courier
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleQuickDispatch(order.id, 'Pathao')}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold text-[10.5px] transition flex items-center gap-1"
                                  title="1-Click Dispatch to Pathao Courier"
                                >
                                  <Zap className="w-3 h-3 text-rose-600" /> Pathao
                                </button>
                                <button
                                  onClick={() => handleQuickDispatch(order.id, 'Steadfast')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-[10.5px] transition flex items-center gap-1"
                                  title="1-Click Dispatch to Steadfast Courier"
                                >
                                  <Zap className="w-3 h-3 text-emerald-600" /> Steadfast
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Handed at Counter
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">No courier shipment required</div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-700 dark:text-slate-200 transition"
                            title={isOnline ? "Print Courier Challan / Label" : "Print Counter Receipt"}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping Challan & Courier Label Preview Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#30363d]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  selectedOrder.orderType === 'online' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50'
                }`}>
                  {selectedOrder.orderType === 'online' ? <Truck className="w-5 h-5" /> : <StoreIcon className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {selectedOrder.orderType === 'online' ? 'Courier Shipping Challan' : 'Counter Sale Delivery Receipt'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Dhaka Silicon ERP & Logistics Division</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-[#21262d] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#30363d]">
                {selectedOrder.orderNumber}
              </span>
            </div>

            {/* Courier Specific Banner if online */}
            {selectedOrder.orderType === 'online' && (
              <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Logistics Partner</div>
                  <div className="text-sm font-bold flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      selectedOrder.courier?.provider === 'Pathao' ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} />
                    {selectedOrder.courier?.provider || 'Standard Dispatch'} Logistics
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Consignment ID</div>
                  <div className="font-mono text-xs font-bold text-amber-400 mt-0.5">
                    {selectedOrder.courier?.consignmentId || 'BOOKING-PENDING'}
                  </div>
                </div>
              </div>
            )}

            {/* Manifest Card */}
            <div className="my-4 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-3.5 text-xs">
              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-[#30363d]">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Deliver To</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedOrder.customerName}</div>
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {selectedOrder.contactNumber}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Dispatched By</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Dhaka Silicon Central Vault</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Banani Showroom, Dhaka · Rep: {selectedOrder.salesman}</div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Destination Address</span>
                <div className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-slate-50 dark:bg-[#21262d] p-2.5 rounded-xl border border-slate-100 dark:border-[#30363d]">
                  {selectedOrder.deliveryAddress}
                </div>
              </div>

              {/* Items Manifest */}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Hardware Items Summary</span>
                <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px] bg-slate-50 dark:bg-[#21262d] p-2 rounded-xl">
                  {selectedOrder.itemsSummary}
                </div>
              </div>

              {/* COD & Totals */}
              <div className="pt-2 border-t border-slate-200 dark:border-[#30363d] flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Payment Method</span>
                  <div className="font-semibold uppercase text-slate-700 dark:text-slate-200">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    {selectedOrder.orderType === 'online' ? 'COD Collectible' : 'Total Amount'}
                  </span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    ৳ {selectedOrder.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Simulated Barcode */}
              <div className="pt-2 text-center">
                <div className="h-8 bg-slate-800 dark:bg-slate-200 rounded flex items-center justify-around px-4 py-1">
                  {[...Array(32)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full ${i % 3 === 0 ? 'w-1 bg-white dark:bg-slate-900' : 'w-0.5 bg-slate-400 dark:bg-slate-600'}`} 
                    />
                  ))}
                </div>
                <div className="font-mono text-[10px] text-slate-400 tracking-widest mt-1">
                  *{selectedOrder.orderNumber}*
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition"
              >
                <Printer className="w-4 h-4" /> Print Label & Challan
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
