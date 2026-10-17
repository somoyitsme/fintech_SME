import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_invoice_pdf(invoice: dict, items: list[dict], client: dict, tenant: dict) -> bytes:
    """Generates a clean PDF invoice using ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    elements = []
    styles = getSampleStyleSheet()

    # Title & Header
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=12
    )
    elements.append(Paragraph(f"INVOICE {invoice.get('invoice_number', 'INV-001')}", title_style))
    elements.append(Spacer(1, 10))

    # Two column info table (Seller info on left, Buyer info on right)
    seller_text = f"<b>From:</b><br/>{tenant.get('company_name', 'FinPilot Merchant')}<br/>Tax ID: {tenant.get('tax_id', 'N/A')}<br/>Currency: {tenant.get('currency', 'CNY')}"
    buyer_text = f"<b>Billed To:</b><br/>{client.get('name', 'Valued Client')}<br/>{client.get('company', '')}<br/>Email: {client.get('email', 'N/A')}<br/>Tax ID: {client.get('tax_number', 'N/A')}"
    
    info_data = [[
        Paragraph(seller_text, styles['Normal']),
        Paragraph(buyer_text, styles['Normal'])
    ]]
    info_table = Table(info_data, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 15))

    # Dates Table
    dates_data = [
        ["Issue Date", "Due Date", "Status", "Total Amount"],
        [
            str(invoice.get('issue_date', ''))[:10],
            str(invoice.get('due_date', ''))[:10],
            str(invoice.get('status', 'draft')).upper(),
            f"¥{invoice.get('total', 0.0):,.2f}"
        ]
    ]
    dates_table = Table(dates_data, colWidths=[135, 135, 135, 135])
    dates_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#334155')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
    ]))
    elements.append(dates_table)
    elements.append(Spacer(1, 20))

    # Items Table
    table_rows = [["Item Description", "Qty", "Unit Price", "Tax", "Subtotal"]]
    for item in items:
        table_rows.append([
            item.get('description', 'Service item'),
            f"{item.get('quantity', 1):.1f}",
            f"¥{item.get('unit_price', 0.0):,.2f}",
            f"{item.get('tax_rate', 0.0)*100:.0f}%",
            f"¥{item.get('total', 0.0):,.2f}"
        ])

    items_table = Table(table_rows, colWidths=[240, 60, 90, 60, 90])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 25))

    # Notes
    if invoice.get('notes'):
        elements.append(Paragraph(f"<b>Notes & Payment Instructions:</b> {invoice.get('notes')}", styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
