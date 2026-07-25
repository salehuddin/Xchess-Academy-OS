<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Official Receipt #OR-{{ $invoice->id }}</title>
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
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 22px;
            font-weight: bold;
            color: #111827;
        }
        .receipt-title {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
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
        .receipt-box {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
        }
        .receipt-amount {
            font-size: 26px;
            font-weight: bold;
            color: #047857;
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
        .stamp-box {
            margin-top: 30px;
            float: right;
            width: 220px;
            text-align: center;
            border: 2px dashed #059669;
            padding: 12px;
            border-radius: 8px;
            color: #047857;
            font-weight: bold;
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
                <div class="receipt-title">OFFICIAL RECEIPT</div>
                <div style="margin-top: 6px; font-weight: bold; color: #047857;">
                    STATUS: PAID IN FULL
                </div>
            </td>
        </tr>
    </table>

    <div class="receipt-box">
        <table style="width: 100%;">
            <tr>
                <td>
                    <div class="section-heading">Amount Paid</div>
                    <div class="receipt-amount">RM {{ number_format($invoice->total_amount, 2) }}</div>
                </td>
                <td class="text-right">
                    <div>Receipt Date: <strong>{{ $payment ? $payment->payment_date?->format('d M Y') : now()->format('d M Y') }}</strong></div>
                    <div>Payment Method: <strong>{{ $payment->payment_method ?? 'Chip Gateway' }}</strong></div>
                    <div>Transaction Ref: <strong>{{ $payment->transaction_id ?? ('OR-'.$invoice->id) }}</strong></div>
                </td>
            </tr>
        </table>
    </div>

    <table class="details-table">
        <tr>
            <td>
                <div class="section-heading">Received From</div>
                <div style="font-weight: bold; font-size: 14px;">{{ $invoice->student?->parent?->name ?? 'Parent' }}</div>
                <div>Student: <strong>{{ $invoice->student?->name }}</strong> ({{ $invoice->student?->student_uid }})</div>
                <div>Email: {{ $invoice->student?->parent?->email ?? '-' }}</div>
            </td>
            <td class="text-right">
                <div class="section-heading">Invoice Reference</div>
                <div>Invoice #: <strong>INV-{{ $invoice->id }}</strong></div>
                <div>Billing Period: <strong>{{ $invoice->month_year }}</strong></div>
            </td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th>Payment Item Description</th>
                <th class="text-right">Amount Paid (RM)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Full Tuition Payment for {{ $invoice->month_year }} (Invoice #INV-{{ $invoice->id }})</td>
                <td class="text-right">RM {{ number_format($invoice->total_amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="stamp-box">
        OFFICIAL RECEIPT<br>
        <span style="font-size: 10px; font-weight: normal; color: #374151;">Verified & Generated Electronically</span><br>
        <strong>{{ $company['name'] }}</strong>
    </div>

</body>
</html>
