# Admin Sub-Page: Company Profile Settings

## Routes & Access
- `GET /admin/settings/company` (`admin.settings.company`)
- `POST /admin/settings/company` (`admin.settings.company.update`)
- Access: `auth` + `role:Admin`
- Controller: [SettingController@company](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/SettingController.php#L165-L212)
- UI Component: [Admin/Settings/Company.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Settings/Company.jsx)

## Configurable Fields
- `company_name`: Academy Name (e.g. X Chess Academy)
- `company_reg_no`: SSM / Business Registration No
- `company_email`: Official Contact Email
- `company_phone`: Official Phone Number
- `company_address`: Physical Business Address
- `company_bank_details`: Bank Name, Account Number, and Account Name for manual transfers.

## PDF Integration
- These setting values are passed dynamically into printable Blade PDF templates:
  - Invoice: [pdf/invoice.blade.php](file:///c:/laragon/www/xchess-academy-os/resources/views/pdf/invoice.blade.php)
  - Official Receipt: [pdf/receipt.blade.php](file:///c:/laragon/www/xchess-academy-os/resources/views/pdf/receipt.blade.php)
