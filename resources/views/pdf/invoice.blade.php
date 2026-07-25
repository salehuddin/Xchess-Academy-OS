<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #INV-{{ $invoice->id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #111827;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            text-align: right;
        }
        .details-table {
            width: 100%;
            margin-bottom: 25px;
        }
        .details-table td {
            vertical-align: top;
            width: 50%;
        }
        .section-heading {
            font-size: 11px;
            font-weight: bold;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .items-table th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: bold;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            border-bottom: 1px solid #d1d5db;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        .text-right {
            text-align: right;
        }
        .total-row td {
            font-weight: bold;
            font-size: 15px;
            background-color: #f9fafb;
            border-top: 2px solid #111827;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-pending { background-color: #fef3c7; color: #92400e; }
        .badge-paid { background-color: #d1fae5; color: #065f46; }
        .badge-overdue { background-color: #fee2e2; color: #991b1b; }
        .footer-note {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            font-size: 12px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td>
                <div class="company-name">{{ $company['name'] }}</div>
                <div>Reg No: {{ $company['reg_no'] }}</div>
                <div>{!! nl2br(e($company['address'])) !!}</div>
                <div>Email: {{ $company['email'] }} | Phone: {{ $company['phone'] }}</div>
            </td>
            <td class="text-right">
                <div class="invoice-title">INVOICE</div>
                <div style="margin-top: 6px;">
                    <span class="badge badge-{{ strtolower($invoice->status) }}">{{ $invoice->status }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="details-table">
        <tr>
            <td>
                <div class="section-heading">Billed To</div>
                <div style="font-weight: bold; font-size: 14px;">{{ $invoice->student?->parent?->name ?? 'Parent' }}</div>
                <div>Student: <strong>{{ $invoice->student?->name }}</strong> ({{ $invoice->student?->student_uid }})</div>
                <div>Email: {{ $invoice->student?->parent?->email ?? '-' }}</div>
                <div>Phone: {{ $invoice->student?->parent?->phone ?? '-' }}</div>
            </td>
            <td class="text-right">
                <div class="section-heading">Invoice Details</div>
                <div>Invoice #: <strong>INV-{{ $invoice->id }}</strong></div>
                <div>Billing Period: <strong>{{ $invoice->month_year }}</strong></div>
                <div>Issue Date: {{ $invoice->created_at?->format('d M Y') }}</div>
                <div>Due Date: <strong>{{ $invoice->due_date ? $invoice->due_date->format('d M Y') : '-' }}</strong></div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description / Item</th>
                <th class="text-right">Amount (RM)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Base Tuition Fee - {{ $invoice->month_year }}</td>
                <td class="text-right">RM {{ number_format($invoice->base_amount, 2) }}</td>
            </tr>
            @if($invoice->tax_amount > 0)
            <tr>
                <td>Tax / Service Fee</td>
                <td class="text-right">RM {{ number_format($invoice->tax_amount, 2) }}</td>
            </tr>
            @endif
            @if($invoice->recurring_discount_val > 0)
            <tr>
                <td style="color: #059669;">Recurring Student Discount</td>
                <td class="text-right" style="color: #059669;">-RM {{ number_format($invoice->recurring_discount_val, 2) }}</td>
            </tr>
            @endif
            @if($invoice->manual_adjustment > 0)
            <tr>
                <td style="color: #059669;">Manual Deductions / Adjustments</td>
                <td class="text-right" style="color: #059669;">-RM {{ number_format($invoice->manual_adjustment, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>Total Amount Payable</td>
                <td class="text-right" style="color: #2563eb;">RM {{ number_format($invoice->total_amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    @if($invoice->finance_remarks)
    <div style="margin-bottom: 20px;">
        <div class="section-heading">Finance Remarks / Deductions Note</div>
        <div style="background: #fffbebfb; padding: 10px; border-radius: 4px; border: 1px solid #fef3c7;">
            {{ $invoice->finance_remarks }}
        </div>
    </div>
    @endif

    <div class="footer-note">
        <div style="font-weight: bold; margin-bottom: 5px;">Payment Instructions & Bank Account</div>
        <div>{!! nl2br(e($company['bank_details'])) !!}</div>
        <div style="margin-top: 8px; color: #6b7280; font-size: 11px;">Please include Invoice #<strong>INV-{{ $invoice->id }}</strong> as reference when making bank transfers.</div>
    </div>

</body>
</html>
