# Admin Sub-Page: External Services Settings

## Routes & Access
- `GET /admin/settings/services` (`admin.settings.services`)
- `POST /admin/settings/services` (`admin.settings.services.update`)
- Live Connection Test API Endpoints:
  - `POST /admin/settings/services/test-chip` (`admin.settings.test-chip`)
  - `POST /admin/settings/services/test-smtp` (`admin.settings.test-smtp`)
  - `POST /admin/settings/services/test-whatsapp` (`admin.settings.test-whatsapp`)
- Access: `auth` + `role:Admin`
- Controller: [SettingController](app/Http/Controllers/Admin/SettingController.php)
- UI Component: [Admin/Settings/Services.jsx](resources/js/Pages/Admin/Settings/Services.jsx)

## Service Integrations & Credentials

### 1. Chip Payment Gateway
- Credentials: `chip_environment` (`sandbox` / `live`), `chip_brand_id`, `chip_api_key`, `chip_webhook_secret`.
- Features: Interactive **"Test Chip API Connection"** button verifies HTTP authentication against Chip endpoints.

### 2. SMTP Mailer
- Credentials: `mail_host`, `mail_port`, `mail_username`, `mail_password`, `mail_encryption`, `mail_from_address`, `mail_from_name`.
- Features: Interactive **"Send Test Email"** modal verifies live SMTP transmission.

### 3. WhatsApp Gateway
- Credentials: `whatsapp_provider` (`twilio` / `waba` / `ultramsg`), `whatsapp_account_sid`, `whatsapp_auth_token`, `whatsapp_phone_number`.
- Features: Interactive **"Test WhatsApp Dispatch"** modal verifies credentials against target phone numbers.
