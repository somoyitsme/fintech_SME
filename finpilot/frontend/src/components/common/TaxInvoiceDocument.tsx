import React from 'react';
import { BarcodeSvg } from './BarcodeSvg';
import { QrCodeSvg } from './QrCodeSvg';

export interface InvoiceOrderItem {
  productId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  profit?: number;
  total: number;
}

export interface InvoiceCustomer {
  id?: string;
  name: string;
  contactNumber?: string;
  email?: string;
  deliveryAddress?: string;
  customerType?: string;
  binNumber?: string | null;
  totalPurchases?: number;
  totalDue?: number;
}

export interface InvoiceOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  customerName: string;
  contactNumber?: string;
  deliveryAddress?: string;
  subtotal: number;
  discountAmount?: number;
  vatAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  branch?: string;
  salesman?: string;
  orderDate?: string;
  items: InvoiceOrderItem[];
  customerDetails?: InvoiceCustomer | null;
  courier?: {
    provider: string;
    consignmentId: string;
    trackingUrl?: string;
    status: string;
    codAmount?: number;
  } | null;
}

interface TaxInvoiceDocumentProps {
  order: InvoiceOrder;
  customer?: InvoiceCustomer | null;
  className?: string;
}

export function numberToWordsBDT(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Taka Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(num: number): string {
    let str = '';
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += units[num] + ' ';
    }
    return str.trim();
  }

  let rem = rounded;
  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = rem;

  let words = 'Taka ';
  if (crore) words += convertChunk(crore) + ' Crore ';
  if (lakh) words += convertChunk(lakh) + ' Lakh ';
  if (thousand) words += convertChunk(thousand) + ' Thousand ';
  if (hundred) words += convertChunk(hundred) + ' ';

  return words.trim() + ' Only';
}

export const TaxInvoiceDocument: React.FC<TaxInvoiceDocumentProps> = ({
  order,
  customer,
  className = '',
}) => {
  const cust = customer || order.customerDetails;
  const paidAmount = order.paidAmount !== undefined ? order.paidAmount : order.totalAmount;
  const dueAmount = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, order.totalAmount - paidAmount);
  const discountAmount = order.discountAmount || 0;
  const vatAmount = order.vatAmount || 0;
  const subtotal = order.subtotal || order.totalAmount;

  // Verification Payload for QR Code
  const qrVerificationData = JSON.stringify({
    inv: order.orderNumber,
    date: order.orderDate || new Date().toISOString().slice(0, 10),
    bin: '003456789012-0101',
    customer: order.customerName,
    total_bdt: order.totalAmount,
    paid_bdt: paidAmount,
    due_bdt: dueAmount,
    branch: order.branch || 'Banani Central',
    nbr_auth: 'MUSHAK-6.3-VALID'
  });

  return (
    <div
      className={`bg-white text-black font-sans leading-tight print-container ${className}`}
      style={{
        width: '100%',
        maxWidth: '210mm',
        margin: '0 auto',
        padding: '24px 28px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
      }}
    >
      {/* ── 1. NBR Mushak-6.3 Header & Enterprise Identification ── */}
      <div className="border-b-2 border-black pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight uppercase text-black">
              Now_or_Never Technology & Hardware Ltd.
            </h1>
            <p className="text-xs text-gray-700 font-medium mt-0.5">
              Wholesale, Commercial Distribution & Enterprise IT Infrastructure
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Registered Office: Level 4, Plot 18, Road 11, Banani Commercial Area, Dhaka-1213, Bangladesh
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] font-semibold text-black mt-1">
              <span>Corporate BIN: <strong className="font-mono">003456789012-0101</strong></span>
              <span>TIN: <strong className="font-mono">TIN-984102948-2026</strong></span>
              <span>Tel: +880 1711-000000</span>
              <span>Email: billing@nowornever.console</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider rounded">
              Mushak - 6.3
            </span>
            <span className="text-[10px] text-gray-600 uppercase font-semibold mt-1">
              Tax Invoice & Delivery Challan
            </span>
            <span className="text-[9px] text-gray-500">
              [NBR Rule 40(1) — VAT Act 2012]
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Invoice Meta & Customer Dossier (2-Column Grid) ── */}
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-black text-xs">
        {/* Left: Invoice & Dispatch Details */}
        <div className="space-y-1">
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-semibold text-gray-600">Invoice / Challan No:</span>
            <span className="font-mono font-black text-black">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-semibold text-gray-600">Date & Timestamp:</span>
            <span className="font-mono text-black">{order.orderDate || '2026-10-20 12:00:00'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-semibold text-gray-600">Dispatch Branch / Vault:</span>
            <span className="font-medium text-black">{order.branch || 'Banani Central Vault & Warehouse'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-semibold text-gray-600">Sales Representative:</span>
            <span className="font-medium text-black">{order.salesman || 'Tanvir Ahmed'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Payment Terms:</span>
            <span className="font-bold uppercase text-black">
              {order.paymentMethod.replace('_', ' ')} ({order.paymentStatus})
            </span>
          </div>
        </div>

        {/* Right: Customer Intelligence Dossier */}
        <div className="bg-gray-50 p-2.5 rounded border border-gray-300 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
            Bill To & Consignee Details:
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Client / Firm:</span>
            <span className="font-bold text-black">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Phone / Mobile:</span>
            <span className="font-mono font-medium text-black">{order.contactNumber || cust?.contactNumber || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Client BIN / TIN:</span>
            <span className="font-mono text-black">{cust?.binNumber || 'Unregistered Commercial'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Account Classification:</span>
            <span className="font-semibold text-black">{cust?.customerType || 'Wholesale Client'}</span>
          </div>
          <div className="text-[11px] pt-0.5 border-t border-gray-200">
            <span className="font-semibold text-gray-600">Delivery Address: </span>
            <span className="text-gray-900">{order.deliveryAddress || cust?.deliveryAddress || 'Counter Pickup'}</span>
          </div>
          {cust?.totalDue !== undefined && cust.totalDue > 0 && (
            <div className="flex justify-between pt-1 border-t border-gray-300 text-red-700 font-bold">
              <span>Client Lifetime Due Balance:</span>
              <span className="font-mono">৳ {cust.totalDue.toLocaleString()} BDT</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Itemized Hardware Table ── */}
      <div className="pt-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-y-2 border-black bg-gray-100 font-bold text-black">
              <th className="py-1.5 px-2 text-left w-8">#</th>
              <th className="py-1.5 px-2 text-left">Item Description & Specifications</th>
              <th className="py-1.5 px-2 text-left w-36">SKU / Model</th>
              <th className="py-1.5 px-2 text-center w-14">Qty</th>
              <th className="py-1.5 px-2 text-right w-28">Rate (BDT)</th>
              <th className="py-1.5 px-2 text-right w-32">Total (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2 px-2 text-left font-mono text-gray-600">{idx + 1}</td>
                <td className="py-2 px-2 text-left">
                  <div className="font-bold text-black">{item.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">Genuine Distributor Stock • Serialized</div>
                </td>
                <td className="py-2 px-2 text-left font-mono text-[11px] text-gray-700">
                  {item.sku || 'HARDWARE-GEN'}
                </td>
                <td className="py-2 px-2 text-center font-bold text-black">
                  {item.quantity}
                </td>
                <td className="py-2 px-2 text-right font-mono text-black">
                  ৳ {item.unitPrice.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-right font-mono font-bold text-black">
                  ৳ {(item.total || item.unitPrice * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 4. Financial Calculation Summary & In-Words ── */}
      <div className="grid grid-cols-12 gap-4 pt-3 border-t-2 border-black mt-2">
        {/* Left 7 Columns: In Words, Scanners & Logistics */}
        <div className="col-span-7 space-y-3">
          {/* Amount In Words */}
          <div className="p-2 bg-gray-50 border border-gray-300 rounded text-xs">
            <span className="font-bold text-gray-700 block text-[10px] uppercase">
              Total Invoiced Amount in Words:
            </span>
            <span className="font-bold text-black italic">
              {numberToWordsBDT(order.totalAmount)}
            </span>
          </div>

          {/* Barcode & QR Scanner Block */}
          <div className="p-2.5 border border-gray-300 rounded flex items-center justify-between gap-3 bg-white">
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-gray-500 mb-0.5 tracking-wider">
                Optical Barcode Scanner
              </span>
              <BarcodeSvg value={order.orderNumber} height={38} moduleWidth={1.3} />
            </div>

            <div className="h-14 w-px bg-gray-300 mx-1" />

            <div className="flex items-center gap-2">
              <QrCodeSvg value={qrVerificationData} size={76} />
              <div className="text-[9px] text-gray-600 leading-tight space-y-0.5">
                <span className="font-bold text-black block">2D Smart Verification</span>
                <span>• NBR Mushak Authenticated</span>
                <span>• Genuine Hardware Warranted</span>
                <span>• Live Database Link</span>
              </div>
            </div>
          </div>

          {/* Courier Details if Shipped Online */}
          {order.courier && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 space-y-0.5">
              <div className="font-bold flex justify-between">
                <span>Courier Partner: {order.courier.provider} Courier</span>
                <span className="uppercase">{order.courier.status}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Consignment ID: <strong className="font-mono">{order.courier.consignmentId}</strong></span>
                {order.courier.codAmount !== undefined && (
                  <span>COD Collection: <strong>৳ {order.courier.codAmount.toLocaleString()} BDT</strong></span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Financial Sums & Due Balance */}
        <div className="col-span-5 text-xs space-y-1.5">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="font-medium text-gray-600">Subtotal:</span>
            <span className="font-mono font-bold text-black">৳ {subtotal.toLocaleString()} BDT</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between py-1 border-b border-gray-200 text-red-600 font-semibold">
              <span>Trade Discount:</span>
              <span className="font-mono">- ৳ {discountAmount.toLocaleString()} BDT</span>
            </div>
          )}

          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="font-medium text-gray-600">NBR 5% Standard VAT:</span>
            <span className="font-mono text-black">৳ {vatAmount.toLocaleString()} BDT</span>
          </div>

          <div className="flex justify-between py-1.5 border-b-2 border-black text-sm font-black text-black bg-gray-100 px-2 rounded">
            <span>Invoiced Total:</span>
            <span className="font-mono">৳ {order.totalAmount.toLocaleString()} BDT</span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Amount Paid Now:</span>
            <span className="font-mono font-bold text-emerald-700">
              ৳ {paidAmount.toLocaleString()} BDT
            </span>
          </div>

          {/* Remaining Due Box */}
          <div className={`p-2 rounded border flex justify-between items-center ${
            dueAmount > 0 
              ? 'bg-red-50 border-red-400 text-red-800' 
              : 'bg-emerald-50 border-emerald-400 text-emerald-800'
          }`}>
            <span className="font-bold text-xs">Remaining Due Balance:</span>
            <span className="font-mono font-black text-sm">
              ৳ {dueAmount.toLocaleString()} BDT
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. Terms & Declarations ── */}
      <div className="mt-4 pt-2 border-t border-gray-300 text-[10px] text-gray-600 space-y-1">
        <p className="font-bold text-gray-800 uppercase">
          Standard Enterprise Terms & Commercial Warranty Policy:
        </p>
        <p className="leading-snug">
          1. Goods once sold cannot be returned or exchanged without the original invoice and warranty stickers intact.
          2. Warranty claims are governed strictly by the manufacturer’s replacement policy against physical burn or liquid damage.
          3. Outstanding due balances must be settled within agreed credit terms to avoid statutory finance charges.
          4. This is an authenticated computer-generated Tax Invoice and Delivery Challan under Rule 40 of NBR VAT Act 2012.
        </p>
      </div>

      {/* ── 6. Tri-Signatures Section ── */}
      <div className="grid grid-cols-3 gap-6 pt-12 mt-4 text-center text-xs">
        <div>
          <div className="border-t border-black pt-1.5 font-bold text-gray-800">
            Prepared & Checked By
          </div>
          <div className="text-[10px] text-gray-500 font-mono">Accounts & Vault Dept</div>
        </div>
        <div>
          <div className="border-t border-black pt-1.5 font-bold text-gray-800">
            Received in Good Condition
          </div>
          <div className="text-[10px] text-gray-500">Customer's Signature & Seal</div>
        </div>
        <div>
          <div className="border-t border-black pt-1.5 font-bold text-gray-800">
            Authorized Signatory
          </div>
          <div className="text-[10px] text-gray-500">For Now_or_Never Technology Ltd.</div>
        </div>
      </div>
    </div>
  );
};
