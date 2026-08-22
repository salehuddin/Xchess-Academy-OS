# How-To Guide: Billing, Invoicing & Chip Online Payments

This guide explains how monthly draft invoices are generated, reviewed by Finance, sent to parents, paid online via Chip Gateway, and exported as official PDF documents.

---

## 📊 Invoicing & Payment Flowchart

```mermaid
graph TD
    A[System Generates Monthly Invoices] --> B[Invoices Created in Draft Status]
    B --> C[Finance Review: Check Amounts & Discounts]
    C --> D{Need Adjustments?}
    D -->|Yes| E[Add Itemized Credit / Charge Line Items]
    D -->|No| F[Click Send Invoice]
    E --> F
    F --> G[Status Changes to Pending]
    G --> H[Parent Receives Email & Portal Link]
    H --> I[Parent Clicks Pay via Chip]
    I --> J[Completes FPX / Card / E-Wallet Payment]
    J --> K[Webhook Reconciles Payment Automatically]
    K --> L[Status Changes to Paid]
    L --> M[Download Official PDF Receipt]
```

---

## 📋 Invoice Status Legend

| Status | Badge Color | Meaning | Allowed Actions |
| :--- | :--- | :--- | :--- |
| **Draft** | ⚪ Gray | Under internal finance review | Edit adjustments, Send Invoice |
| **Pending** | 🟡 Yellow | Sent to parent; awaiting payment | Pay via Chip, Download PDF Invoice |
| **Paid** | 🟢 Green | Payment completed and reconciled | Download Official PDF Receipt |
| **Overdue** | 🔴 Red | Past due date without payment | Resend notification, Pay via Chip |

---

## 📝 Step-by-Step Instructions

### Step 1: Generating Draft Invoices

Monthly draft invoices are generated automatically by the system on the 1st of each month at 00:00 via the Laravel scheduler (`invoices:generate-monthly` command). No manual action is required.
- Draft invoices calculate:  
  `Total = Base Tuition Fee + Tax − Recurring Student Discount ± Carry-Forward Adjustments`  
  (carry-forward adjustments are any recorded refund credits or additional charges, applied automatically)

---

### Step 2: Finance Review & Manual Adjustments

1. Open **Invoices** from the main sidebar.
2. Click **View** on any invoice in `Draft` status.
3. If an adjustment is needed, add **adjustment line items** (editable only while the invoice is in `Draft`):
   - **Credit** — reduces the total (e.g. refund, cancelled class, sibling allowance).
   - **Charge** — increases the total (e.g. additional fee, surcharge).
   - Enter an **amount** and a **reason** for each line item.
   - Click **"Save Adjustment"**. The total updates in real-time
     (`Total = Base Tuition + Tax − Recurring Discount + Charges − Credits`, clamped ≥ 0).

**Recording a refund or additional charge for next month's invoice**
- Use the **"Record Adjustment for Next Month"** section on any invoice.
- Enter a **Credit (refund)** or **Charge (additional fee)**, amount, and reason.
- It is stored as *pending* and **auto-applied to that student's next month's auto-generated Draft invoice** on the 1st of the month (never double-counted).
- Pending carry-forward adjustments appear on the Draft invoice as itemized lines, and can be removed before that invoice is sent.

---

### Step 3: Sending Invoices to Parents

1. Review the finalized invoice details.
2. Click **"Send Invoice"**.
3. Status changes from `Draft` to `Pending`. The parent receives:
   - Email notification with billing summary.
   - Tokenized Parent Portal link.

---

### Step 4: Parent Online Checkout (Chip Gateway)

1. Parent opens their portal link on mobile or desktop.
2. Click **"Pay RMXXX via Chip"**.
3. Select payment method:
   - **FPX Online Banking** (Maybank, CIMB, RHB, Public Bank, etc.)
   - **Credit / Debit Cards** (Visa, Mastercard)
   - **E-Wallets** (Touch 'n Go, GrabPay, Boost)
4. Once payment succeeds, Chip sends instant webhook reconciliation to the academy OS.
5. Invoice status changes to `Paid` immediately!

---

### Step 5: Downloading PDF Documents

- **PDF Invoice**: Click **"📄 Download PDF Invoice"** on any pending or paid invoice to stream a printable PDF document with academy branding.
- **Official Receipt**: Once an invoice is `Paid`, click **"🧾 Official Receipt PDF"** in the Parent Portal or Admin panel to download an official payment receipt with transaction reference ID.

> [!TIP]
> PDF invoices and receipts dynamically display the Academy Name, SSM Registration No, Phone, Email, and Bank Transfer details configured in **Settings → Company Profile**!
