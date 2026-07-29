# Admin Page: Reports

## Routes & Access
- Page: `GET /admin/reports` (`admin.reports.index`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/ReportController](app/Http/Controllers/Admin/ReportController.php)

## UI
- Page: [Admin/Reports/Index.jsx](resources/js/Pages/Admin/Reports/Index.jsx)

## Features Built
### Financial Overview
- Total revenue: sum of `Paid` invoices (`invoices.total_amount`)
- Total expenses: sum of `Paid` payrolls (`payrolls.total_amount`)
- Net income: revenue - expenses

### Monthly Breakdown
- Aggregates per `month_year` across:
  - paid invoices
  - paid payrolls
- Produces a combined month list and returns:
  - revenue
  - expenses
  - net

## Technical Specs
### Revenue & Expense Sources
- Revenue:
  - `Invoice::where('status', 'Paid')->sum('total_amount')`
- Expenses:
  - `Payroll::where('status', 'Paid')->sum('total_amount')`
- Monthly stats:
  - collects distinct months from both sources and computes month-by-month sums
- Implementation: [ReportController](app/Http/Controllers/Admin/ReportController.php#L14-L70)

## Notes / Constraints
- Monthly breakdown is based only on months present in paid invoices/payrolls; there is no “fill missing months” behavior.
