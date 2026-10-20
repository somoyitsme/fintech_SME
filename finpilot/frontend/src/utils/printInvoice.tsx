import QRCode from 'qrcode';
import { encodeCode128B } from './barcode';
import { numberToWordsBDT, InvoiceOrder, InvoiceCustomer } from '../components/common/TaxInvoiceDocument';

function generateBarcodeSvgString(value: string, height = 34, moduleWidth = 0.95): string {
  const { bars, totalWidth } = encodeCode128B(value || 'N/A', moduleWidth);
  const rects = bars
    .map(b => `<rect x="${b.x.toFixed(1)}" y="0" width="${b.width.toFixed(1)}" height="${height}" fill="#1C1917"/>`)
    .join('');

  return `<svg width="${totalWidth.toFixed(1)}" height="${height}" viewBox="0 0 ${totalWidth.toFixed(1)} ${height}" style="shape-rendering:crispEdges;display:block;margin:0 auto;">
    <rect width="${totalWidth.toFixed(1)}" height="${height}" fill="#FEFAE0"/>
    ${rects}
  </svg>`;
}

/**
 * Generates an isolated, perfectly proportioned A4 single-page Tax Invoice / Delivery Challan
 * styled in the Golden Summer Fields theme:
 * - Brand Ochre (#D4A373)
 * - Warm Sand (#FAEDCD)
 * - Soft Cream (#FEFAE0)
 * - Deep Stone (#1C1917)
 * - Warm Slate (#57534E)
 * - Full A4 height coverage with anchored signature lines (no cramped half-page blank space).
 * - Real vector Code128 barcode and 2D QR verification scanner.
 */
export async function printTaxInvoice(order: InvoiceOrder | any, customer?: InvoiceCustomer | any): Promise<void> {
  if (!order) return;

  const cust = customer || order.customerDetails;
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal || order.totalAmount || 0;
  const totalAmount = order.totalAmount || 0;
  const paidAmount = order.paidAmount !== undefined ? order.paidAmount : totalAmount;
  const dueAmount = order.dueAmount !== undefined ? order.dueAmount : Math.max(0, totalAmount - paidAmount);
  const discountAmount = order.discountAmount || 0;
  const vatAmount = order.vatAmount || 0;
  const orderNumber = order.orderNumber || 'ORD-UNKNOWN';
  const orderDate = order.orderDate || new Date().toISOString().slice(0, 19).replace('T', ' ');
  const branch = order.branch || 'Banani Central Vault & Warehouse';
  const salesman = order.salesman || 'Tanvir Ahmed';
  const customerName = order.customerName || cust?.name || 'Valued Commercial Client';
  const contactNumber = order.contactNumber || cust?.contactNumber || 'N/A';
  const deliveryAddress = order.deliveryAddress || cust?.deliveryAddress || 'Central Showroom Counter Collection';
  const customerBin = cust?.binNumber || 'Unregistered Commercial';
  const customerType = cust?.customerType || 'Wholesale Partner';
  const customerLifetimeDue = cust?.totalDue !== undefined ? cust.totalDue : dueAmount;

  // 1. Generate QR Code SVG string with Golden Summer Fields palette
  const qrVerificationData = JSON.stringify({
    inv: orderNumber,
    date: orderDate,
    bin: '003456789012-0101',
    customer: customerName,
    total_bdt: totalAmount,
    paid_bdt: paidAmount,
    due_bdt: dueAmount,
    branch,
    nbr_auth: 'MUSHAK-6.3-VALID'
  });

  const qrSvgString = await new Promise<string>((resolve) => {
    QRCode.toString(
      qrVerificationData,
      {
        type: 'svg',
        margin: 1,
        width: 76,
        errorCorrectionLevel: 'M',
        color: { dark: '#1C1917', light: '#FEFAE0' }
      },
      (err, str) => {
        resolve(!err && str ? str : '');
      }
    );
  });

  // 2. Generate Barcode SVG string with theme colors
  const barcodeSvgString = generateBarcodeSvgString(orderNumber, 34, 0.95);

  // 3. Generate HTML for table rows with comfortable line height & padding
  const itemRowsHtml = items.map((it: any, idx: number) => {
    const itemTotal = it.total || (it.unitPrice * it.quantity);
    return `
      <tr style="border-bottom: 1.5px solid #E8E4D5;">
        <td style="padding: 14px 10px; font-family: monospace; color: #78716C; text-align: center; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 14px 12px;">
          <div style="font-weight: 800; color: #1C1917; font-size: 12px;">${it.name}</div>
          <div style="font-size: 10px; color: #57534E; margin-top: 2px;">Genuine Distributor Inventory • Serial Warranty Registered</div>
        </td>
        <td style="padding: 14px 10px; font-family: monospace; font-size: 11px; color: #57534E;">
          ${it.sku || 'HARDWARE-GEN'}
        </td>
        <td style="padding: 14px 10px; text-align: center; font-weight: 800; color: #1C1917; font-size: 12px;">
          ${it.quantity}
        </td>
        <td style="padding: 14px 12px; text-align: right; font-family: monospace; color: #1C1917; font-size: 11.5px;">
          ৳ ${Number(it.unitPrice).toLocaleString()}
        </td>
        <td style="padding: 14px 12px; text-align: right; font-family: monospace; font-weight: 800; color: #1C1917; font-size: 12px;">
          ৳ ${Number(itemTotal).toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  // Placeholder guideline rows for orders with fewer than 3 items to gracefully balance A4 height
  const emptyRowsNeeded = Math.max(0, 3 - items.length);
  const placeholderRowsHtml = Array.from({ length: emptyRowsNeeded }).map((_, i) => `
    <tr style="border-bottom: 1px dashed #E8E4D5; height: 34px;">
      <td style="padding: 6px 10px; text-align: center; color: #A8A29E; font-size: 10px;">-</td>
      <td style="padding: 6px 12px; color: #A8A29E; font-size: 10px; font-style: italic;">
        ${i === 0 ? '*** Verified Authorized Stock Line — Nothing Follows ***' : ''}
      </td>
      <td style="padding: 6px 10px; color: #A8A29E; font-size: 10px;">-</td>
      <td style="padding: 6px 10px; text-align: center; color: #A8A29E; font-size: 10px;">-</td>
      <td style="padding: 6px 12px; text-align: right; color: #A8A29E; font-size: 10px;">-</td>
      <td style="padding: 6px 12px; text-align: right; color: #A8A29E; font-size: 10px;">-</td>
    </tr>
  `).join('');

  // 4. Build single-page A4 HTML document filling full A4 height
  const invoiceHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Tax_Invoice_${orderNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF !important;
      color: #1C1917 !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
    }
    .invoice-page {
      width: 100%;
      max-width: 190mm;
      margin: 0 auto;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 275mm;
      box-sizing: border-box;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
  </style>
</head>
<body>
  <div class="invoice-page">
    <!-- Top & Main Content Flow -->
    <div>
      <!-- ── 1. Enterprise Brand Header (Golden Summer Fields) ── -->
      <div style="border-bottom: 2.5px solid #D4A373; padding-bottom: 12px; margin-bottom: 14px;">
        <table style="width: 100%;">
          <tr>
            <td style="vertical-align: top; width: 75%;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 13px; height: 13px; background-color: #D4A373; border-radius: 3px; display: inline-block;"></div>
                <div style="font-size: 19.5px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.3px; color: #1C1917; display: inline-block;">
                  Now_or_Never Technology & Hardware Ltd.
                </div>
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #D4A373; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px;">
                Wholesale Distribution, Enterprise Servers & Hardware Infrastructure
              </div>
              <div style="font-size: 10px; color: #57534E; margin-top: 3px;">
                Corporate Office: Level 4, Plot 18, Road 11, Banani Commercial Area, Dhaka-1213, Bangladesh
              </div>
              <div style="font-size: 10.5px; font-weight: 700; margin-top: 5px; color: #1C1917; display: flex; flex-wrap: wrap; gap: 14px;">
                <span>Corporate BIN: <strong class="font-mono" style="color: #1C1917; background-color: #FAEDCD; padding: 1px 6px; border-radius: 3px;">003456789012-0101</strong></span>
                <span>TIN: <strong class="font-mono">TIN-984102948-2026</strong></span>
                <span>Tel: +880 1711-000000</span>
                <span>Email: billing@nowornever.console</span>
              </div>
            </td>
            <td style="vertical-align: top; text-align: right; width: 25%;">
              <div style="display: inline-block; background-color: #D4A373; color: #FFFFFF; padding: 6px 14px; font-size: 12px; font-weight: 900; border-radius: 6px; letter-spacing: 1px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                MUSHAK - 6.3
              </div>
              <div style="font-size: 10.5px; font-weight: 800; text-transform: uppercase; margin-top: 5px; color: #1C1917; letter-spacing: 0.4px;">
                Tax Invoice & Challan
              </div>
              <div style="font-size: 8.5px; color: #78716C; margin-top: 2px;">
                [NBR Rule 40(1) — VAT Act 2012]
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- ── 2. Meta Details & Customer Intelligence (2 Cards Grid) ── -->
      <div style="margin-bottom: 16px;">
        <table style="width: 100%;">
          <tr>
            <!-- Left Card: Invoice Meta (49%) -->
            <td style="width: 49%; vertical-align: top; background-color: #FBFBF7; border: 1.5px solid #E8E4D5; border-radius: 8px; padding: 12px 14px;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #D4A373; margin-bottom: 6px; letter-spacing: 0.5px;">
                Commercial Invoice Information:
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #E8E4D5;">
                <span style="color: #78716C; font-weight: 600;">Invoice / Challan No:</span>
                <span class="font-mono" style="font-weight: 900; color: #1C1917; font-size: 12px;">${orderNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #E8E4D5;">
                <span style="color: #78716C; font-weight: 600;">Issue Date & Time:</span>
                <span class="font-mono" style="color: #1C1917; font-weight: 600;">${orderDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #E8E4D5;">
                <span style="color: #78716C; font-weight: 600;">Dispatching Vault:</span>
                <span style="color: #1C1917; font-weight: 700;">${branch}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #E8E4D5;">
                <span style="color: #78716C; font-weight: 600;">Sales Representative:</span>
                <span style="color: #1C1917; font-weight: 600;">${salesman}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0;">
                <span style="color: #78716C; font-weight: 600;">Payment Terms / Status:</span>
                <span style="font-weight: 800; text-transform: uppercase; color: #1C1917;">${order.paymentMethod || 'cash'} (${order.paymentStatus || 'Paid'})</span>
              </div>
            </td>

            <td style="width: 2%;"></td>

            <!-- Right Card: Customer Dossier (49%) -->
            <td style="width: 49%; vertical-align: top; background-color: #FEFAE0; border: 1.5px solid #D5CEBE; border-left: 4px solid #D4A373; border-radius: 8px; padding: 12px 14px;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #D4A373; margin-bottom: 6px; letter-spacing: 0.5px;">
                Bill To & Consignee Intelligence:
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #D5CEBE;">
                <span style="color: #78716C; font-weight: 600;">Client Enterprise:</span>
                <span style="font-weight: 800; color: #1C1917; font-size: 12px;">${customerName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #D5CEBE;">
                <span style="color: #78716C; font-weight: 600;">Contact Phone:</span>
                <span class="font-mono" style="font-weight: 700; color: #1C1917;">${contactNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #D5CEBE;">
                <span style="color: #78716C; font-weight: 600;">Customer BIN / TIN:</span>
                <span class="font-mono" style="font-weight: 600; color: #1C1917;">${customerBin}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #D5CEBE;">
                <span style="color: #78716C; font-weight: 600;">Account Category:</span>
                <span style="font-weight: 700; color: #1C1917;">${customerType}</span>
              </div>
              <div style="padding: 3px 0; font-size: 10px;">
                <span style="color: #78716C; font-weight: 600;">Delivery Destination: </span>
                <span style="color: #1C1917; font-weight: 600;">${deliveryAddress}</span>
              </div>
              ${customerLifetimeDue > 0 ? `
                <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #D4A373; padding-top: 4px; margin-top: 4px; color: #B45309; font-weight: 900;">
                  <span>Customer Lifetime Due Balance:</span>
                  <span class="font-mono" style="font-size: 11.5px;">৳ ${Number(customerLifetimeDue).toLocaleString()} BDT</span>
                </div>
              ` : ''}
            </td>
          </tr>
        </table>
      </div>

      <!-- ── 3. Roomy Itemized Table ── -->
      <div style="margin-bottom: 16px; border: 1.5px solid #D5CEBE; border-radius: 8px; overflow: hidden;">
        <table style="width: 100%;">
          <thead>
            <tr style="background-color: #FAEDCD; border-bottom: 2px solid #D4A373;">
              <th style="width: 32px; text-align: center; color: #1C1917; padding: 10px 8px; font-size: 10.5px;">#</th>
              <th style="text-align: left; color: #1C1917; padding: 10px 12px; font-size: 10.5px;">Hardware Description & Specifications</th>
              <th style="width: 135px; text-align: left; color: #1C1917; padding: 10px 10px; font-size: 10.5px;">SKU / Code</th>
              <th style="width: 50px; text-align: center; color: #1C1917; padding: 10px 8px; font-size: 10.5px;">Qty</th>
              <th style="width: 95px; text-align: right; color: #1C1917; padding: 10px 12px; font-size: 10.5px;">Rate (BDT)</th>
              <th style="width: 110px; text-align: right; color: #1C1917; padding: 10px 12px; font-size: 10.5px;">Total (BDT)</th>
            </tr>
          </thead>
          <tbody style="background-color: #FFFFFF;">
            ${itemRowsHtml}
            ${placeholderRowsHtml}
          </tbody>
        </table>
      </div>

      <!-- ── 4. Financial Calculations & Verification Scanners ── -->
      <div style="margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
          <tr>
            <!-- Left: In Words, Themed Barcode, QR Code Scanner & Courier (50%) -->
            <td style="width: 50%; vertical-align: top; padding-right: 8px;">
              <!-- Amount in words card -->
              <div style="background-color: #FEFAE0; border: 1.5px solid #FAEDCD; padding: 9px 12px; border-radius: 8px; margin-bottom: 10px;">
                <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #D4A373; letter-spacing: 0.5px;">
                  Total Invoiced Amount in Words:
                </div>
                <div style="font-weight: 800; font-style: italic; color: #1C1917; font-size: 11.5px; margin-top: 2px;">
                  ${numberToWordsBDT(totalAmount)}
                </div>
              </div>

              <!-- Barcode & QR Code Card with Theme Palette (Vertically Stacked for Perfect Fit) -->
              <div style="border: 1.5px solid #D5CEBE; background-color: #FEFAE0; border-radius: 8px; padding: 10px 12px;">
                <!-- QR Code + Details row -->
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="background-color: #FFFFFF; padding: 3px; border-radius: 6px; border: 1.5px solid #D5CEBE; flex-shrink: 0;">
                    ${qrSvgString}
                  </div>
                  <div style="font-size: 9.5px; color: #57534E; line-height: 1.35;">
                    <strong style="color: #1C1917; display: block; font-size: 10.5px;">2D Smart Verification</strong>
                    <span>• NBR Mushak-6.3 Authenticated</span><br/>
                    <span>• Genuine Hardware Warranted</span><br/>
                    <span>• Real-time Vault Database</span>
                  </div>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background-color: #D5CEBE; margin: 8px 0;"></div>

                <!-- Barcode centered -->
                <div style="text-align: center;">
                  <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #D4A373; margin-bottom: 3px; letter-spacing: 0.5px;">
                    Handheld Optical Barcode
                  </div>
                  <div style="background-color: #FFFFFF; padding: 3px 6px; border-radius: 4px; border: 1px solid #D5CEBE; display: inline-block;">
                    ${barcodeSvgString}
                  </div>
                  <div class="font-mono" style="font-size: 9.5px; font-weight: 800; color: #1C1917; margin-top: 2px; letter-spacing: 1px;">
                    *${orderNumber}*
                  </div>
                </div>
              </div>

              ${order.courier ? `
                <div style="margin-top: 8px; background-color: #FBFBF7; border: 1.5px solid #CCD5AE; border-radius: 6px; padding: 6px 10px; font-size: 10px; color: #1C1917;">
                  <strong style="color: #2E7D47;">Logistics Dispatch:</strong> ${order.courier.provider} Courier • Consignment ID: <strong class="font-mono">${order.courier.consignmentId}</strong> • Status: <strong>${order.courier.status}</strong>
                </div>
              ` : ''}
            </td>

            <!-- Right: Financial Sums & Remaining Due Box (50%) -->
            <td style="width: 50%; vertical-align: top; padding-left: 8px;">
              <div style="background-color: #FBFBF7; border: 1.5px solid #E8E4D5; border-radius: 8px; padding: 12px 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed #E8E4D5;">
                  <span style="color: #78716C; font-weight: 600; font-size: 11px; white-space: nowrap;">Subtotal:</span>
                  <span class="font-mono" style="font-weight: 700; color: #1C1917; font-size: 12px; white-space: nowrap;">৳ ${Number(subtotal).toLocaleString()} BDT</span>
                </div>

                ${discountAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed #E8E4D5; color: #BE123C; font-weight: 700;">
                    <span style="font-size: 11px; white-space: nowrap;">Trade Discount:</span>
                    <span class="font-mono" style="font-size: 12px; white-space: nowrap;">- ৳ ${Number(discountAmount).toLocaleString()} BDT</span>
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed #E8E4D5;">
                  <span style="color: #78716C; font-weight: 600; font-size: 11px; white-space: nowrap;">NBR 5% Standard VAT:</span>
                  <span class="font-mono" style="font-weight: 700; color: #1C1917; font-size: 12px; white-space: nowrap;">৳ ${Number(vatAmount).toLocaleString()} BDT</span>
                </div>

                <!-- Total Invoiced Banner (Theme Ochre) -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background-color: #D4A373; color: #FFFFFF; font-size: 13.5px; font-weight: 900; margin: 8px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                  <span style="white-space: nowrap;">Total Invoiced:</span>
                  <span class="font-mono" style="white-space: nowrap;">৳ ${Number(totalAmount).toLocaleString()} BDT</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed #E8E4D5;">
                  <span style="color: #1C1917; font-weight: 700; font-size: 11px; white-space: nowrap;">Amount Paid Now:</span>
                  <span class="font-mono" style="font-weight: 800; color: #2E7D47; font-size: 12px; white-space: nowrap;">৳ ${Number(paidAmount).toLocaleString()} BDT</span>
                </div>

                <!-- Remaining Due Box -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; border: 2px solid #D4A373; background-color: #FEFAE0; color: #B45309; border-radius: 6px; font-weight: 900; margin-top: 8px;">
                  <span style="font-size: 11.5px; white-space: nowrap;">Remaining Due Balance:</span>
                  <span class="font-mono" style="font-size: 13px; white-space: nowrap;">৳ ${Number(dueAmount).toLocaleString()} BDT</span>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Bottom Group: Terms & Anchored Tri-Signatures -->
    <div>
      <!-- ── 5. Statutory Terms & Commercial Policy ── -->
      <div style="background-color: #FBFBF7; border: 1.5px solid #E8E4D5; border-radius: 8px; padding: 8px 12px; font-size: 9px; color: #57534E; line-height: 1.4;">
        <strong style="color: #1C1917;">Terms & Commercial Warranty Policy:</strong> Goods once sold cannot be returned without the original invoice and intact warranty serial seals. Warranty claims strictly follow manufacturer replacement guidelines against physical burn or liquid damage. Outstanding credit balances are subject to agreed commercial settlement cycles. This is an authenticated computer-generated Tax Invoice and Delivery Challan under Rule 40 of NBR VAT Act 2012.
      </div>

      <!-- ── 6. Anchored Tri-Signatures Section ── -->
      <div style="margin-top: 32px; padding-bottom: 6px;">
        <table style="width: 100%; text-align: center; font-size: 10.5px;">
          <tr>
            <td style="width: 33%;">
              <div style="border-top: 1.5px solid #1C1917; width: 85%; margin: 0 auto; padding-top: 4px; font-weight: 800; color: #1C1917;">
                Prepared & Checked By
              </div>
              <div style="font-size: 9px; color: #78716C; margin-top: 1px;">Accounts & Vault Department</div>
            </td>
            <td style="width: 33%;">
              <div style="border-top: 1.5px solid #1C1917; width: 85%; margin: 0 auto; padding-top: 4px; font-weight: 800; color: #1C1917;">
                Received in Good Condition
              </div>
              <div style="font-size: 9px; color: #78716C; margin-top: 1px;">Customer's Authorized Signature & Seal</div>
            </td>
            <td style="width: 33%;">
              <div style="border-top: 1.5px solid #D4A373; width: 85%; margin: 0 auto; padding-top: 4px; font-weight: 800; color: #1C1917;">
                Authorized Signatory
              </div>
              <div style="font-size: 9px; color: #D4A373; font-weight: 700; margin-top: 1px;">For Now_or_Never Technology Ltd.</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

  // 5. Create or reuse isolated hidden print iframe
  let iframe = document.getElementById('finpilot-print-iframe') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'finpilot-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(invoiceHtml);
  doc.close();

  // Set document title so browser "Save as PDF" defaults to clean filename
  if (doc) {
    doc.title = `Tax_Invoice_${orderNumber}`;
  }

  // 6. Trigger print on the isolated iframe document only
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 220);
}
