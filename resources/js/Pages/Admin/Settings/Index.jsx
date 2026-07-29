import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    Tabs,
    Tab,
    Chip,
    Divider,
    Switch,
    Textarea
} from "@heroui/react";

export default function Index({ settings }) {
    const { auth, flash = {} } = usePage().props;

    const companyForm = useForm({
        company_name: settings.company_name || '',
        company_reg_no: settings.company_reg_no || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        company_bank_details: settings.company_bank_details || '',
        company_website: settings.company_website || '',
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
        support_hours: settings.support_hours || '',
    });

    const servicesForm = useForm({
        chip_environment: settings.chip_environment || 'sandbox',
        chip_brand_id: settings.chip_brand_id || '',
        chip_api_key: settings.chip_api_key || '',
        chip_webhook_secret: settings.chip_webhook_secret || '',

        mail_host: settings.mail_host || '',
        mail_port: settings.mail_port || 2525,
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || '',
        mail_from_name: settings.mail_from_name || '',

        whatsapp_provider: settings.whatsapp_provider || 'twilio',
        whatsapp_account_sid: settings.whatsapp_account_sid || '',
        whatsapp_auth_token: settings.whatsapp_auth_token || '',
        whatsapp_phone_number: settings.whatsapp_phone_number || '',
        whatsapp_access_token: settings.whatsapp_access_token || '',
        whatsapp_phone_number_id: settings.whatsapp_phone_number_id || '',
    });

    const notifForm = useForm({
        notifications_enabled: settings.notifications_enabled !== false,
        notifications_daily_limit: settings.notifications_daily_limit || 250,
        notifications_retry_attempts: settings.notifications_retry_attempts ?? 3,
        notifications_retry_delay_minutes: settings.notifications_retry_delay_minutes ?? 30,
        notifications_admin_alert_email: settings.notifications_admin_alert_email || '',
    });

    const [testRecipient, setTestRecipient] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [testingChip, setTestingChip] = useState(false);
    const [testingWhatsApp, setTestingWhatsApp] = useState(false);

    const logoForm = useForm({ logo: null });
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const logoUrl = settings.company_logo
        ? `/storage/${settings.company_logo}`
        : null;

    const handleLogoUpload = (e) => {
        e.preventDefault();
        if (!logoForm.data.logo) return;
        setUploadingLogo(true);
        logoForm.post(route('admin.settings.logo.upload'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                logoForm.reset('logo');
                setUploadingLogo(false);
            },
            onError: () => setUploadingLogo(false),
            onFinish: () => setUploadingLogo(false),
        });
    };

    const handleLogoRemove = () => {
        router.delete(route('admin.settings.logo.remove'), {
            preserveScroll: true,
        });
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();
        companyForm.post(route('admin.settings.company.update'), { preserveScroll: true });
    };

    const handleServicesSubmit = (e) => {
        e.preventDefault();
        servicesForm.post(route('admin.settings.services.update'), { preserveScroll: true });
    };

    const handleNotifSubmit = (e) => {
        e.preventDefault();
        notifForm.post(route('admin.settings.notifications.update'), { preserveScroll: true });
    };

    const handleTestSmtp = () => {
        if (!testRecipient) return;
        setTestingSmtp(true);
        router.post(route('admin.settings.test-smtp'), { recipient: testRecipient }, {
            preserveScroll: true,
            onSuccess: () => setTestingSmtp(false),
            onError: () => setTestingSmtp(false),
            onFinish: () => setTestingSmtp(false),
        });
    };

    const handleTestChip = () => {
        setTestingChip(true);
        router.post(route('admin.settings.test-chip'), {}, {
            preserveScroll: true,
            onSuccess: () => setTestingChip(false),
            onError: () => setTestingChip(false),
            onFinish: () => setTestingChip(false),
        });
    };

    const handleTestWhatsApp = () => {
        if (!testPhone) return;
        setTestingWhatsApp(true);
        router.post(route('admin.settings.test-whatsapp'), { phone: testPhone }, {
            preserveScroll: true,
            onSuccess: () => setTestingWhatsApp(false),
            onError: () => setTestingWhatsApp(false),
            onFinish: () => setTestingWhatsApp(false),
        });
    };

    const isWaba = servicesForm.data.whatsapp_provider === 'waba';

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-foreground leading-tight">System Settings</h2>
                    <p className="text-sm text-default-500">Company profile, external services, and notification system configuration</p>
                </div>
            }
        >
            <Head title="System Settings" />

            <div className="py-6 space-y-6 max-w-6xl mx-auto">
                {flash.success && (
                    <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Success! </strong>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span>{flash.error}</span>
                    </div>
                )}

                <Tabs aria-label="Settings" color="primary" variant="bordered" className="w-full">
                    {/* Company Profile Tab */}
                    <Tab key="company" title="Company Profile">
                        <Card className="bg-content1 shadow-sm mt-4">
                            <CardHeader className="px-6 pt-6">
                                <div>
                                    <h3 className="text-lg font-bold">Company & Billing Details</h3>
                                    <p className="text-sm text-default-500">Embedded into official PDF Invoices and Receipts.</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6">
                                <form onSubmit={handleCompanySubmit} className="space-y-6">
                                    {/* Logo Upload */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-divider bg-content2/30">
                                        <div className="w-16 h-16 rounded-lg bg-background border border-divider flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Academy logo" className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-2xl">X</div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h4 className="text-sm font-semibold text-foreground">Academy Logo</h4>
                                            <p className="text-xs text-default-500">Shown in the portal sidebar, auth pages, and home page. JPG, PNG, SVG, or WebP up to 2 MB.</p>
                                            <form onSubmit={handleLogoUpload} className="flex flex-wrap items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                                    onChange={(e) => logoForm.setData('logo', e.target.files[0])}
                                                    className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                                                />
                                                <Button size="sm" color="primary" type="submit" isLoading={uploadingLogo} isDisabled={!logoForm.data.logo}>
                                                    Upload
                                                </Button>
                                                {logoUrl && (
                                                    <Button size="sm" color="danger" variant="flat" type="button" onPress={handleLogoRemove}>
                                                        Remove
                                                    </Button>
                                                )}
                                            </form>
                                            {logoForm.errors.logo && (
                                                <p className="text-xs text-danger">{logoForm.errors.logo}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Company / Academy Name"
                                            value={companyForm.data.company_name}
                                            onChange={(e) => companyForm.setData('company_name', e.target.value)}
                                            isInvalid={!!companyForm.errors.company_name}
                                            errorMessage={companyForm.errors.company_name}
                                            required
                                        />
                                        <Input
                                            label="SSM / Registration Number"
                                            value={companyForm.data.company_reg_no}
                                            onChange={(e) => companyForm.setData('company_reg_no', e.target.value)}
                                            isInvalid={!!companyForm.errors.company_reg_no}
                                            errorMessage={companyForm.errors.company_reg_no}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            type="email"
                                            label="Official Contact Email"
                                            value={companyForm.data.company_email}
                                            onChange={(e) => companyForm.setData('company_email', e.target.value)}
                                            isInvalid={!!companyForm.errors.company_email}
                                            errorMessage={companyForm.errors.company_email}
                                            required
                                        />
                                        <Input
                                            label="Official Phone Number"
                                            value={companyForm.data.company_phone}
                                            onChange={(e) => companyForm.setData('company_phone', e.target.value)}
                                            isInvalid={!!companyForm.errors.company_phone}
                                            errorMessage={companyForm.errors.company_phone}
                                            required
                                        />
                                    </div>
                                    <Textarea
                                        label="Official Address"
                                        rows={3}
                                        value={companyForm.data.company_address}
                                        onChange={(e) => companyForm.setData('company_address', e.target.value)}
                                        isInvalid={!!companyForm.errors.company_address}
                                        errorMessage={companyForm.errors.company_address}
                                        required
                                    />
                                    <Textarea
                                        label="Bank Account & Transfer Details"
                                        rows={3}
                                        value={companyForm.data.company_bank_details}
                                        onChange={(e) => companyForm.setData('company_bank_details', e.target.value)}
                                        isInvalid={!!companyForm.errors.company_bank_details}
                                        errorMessage={companyForm.errors.company_bank_details}
                                    />
                                    <Input
                                        type="url"
                                        label="Main Website"
                                        value={companyForm.data.company_website}
                                        onChange={(e) => companyForm.setData('company_website', e.target.value)}
                                        isInvalid={!!companyForm.errors.company_website}
                                        errorMessage={companyForm.errors.company_website}
                                        placeholder="https://xchessacademy.com"
                                    />
                                    <Divider />
                                    <div>
                                        <h4 className="text-base font-semibold text-foreground">Support Contact</h4>
                                        <p className="text-sm text-default-500">Shown publicly on the home page contact section.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            type="email"
                                            label="Support Email"
                                            value={companyForm.data.support_email}
                                            onChange={(e) => companyForm.setData('support_email', e.target.value)}
                                            isInvalid={!!companyForm.errors.support_email}
                                            errorMessage={companyForm.errors.support_email}
                                        />
                                        <Input
                                            label="Support Phone Number"
                                            value={companyForm.data.support_phone}
                                            onChange={(e) => companyForm.setData('support_phone', e.target.value)}
                                            isInvalid={!!companyForm.errors.support_phone}
                                            errorMessage={companyForm.errors.support_phone}
                                        />
                                    </div>
                                    <Input
                                        label="Support Hours"
                                        value={companyForm.data.support_hours}
                                        onChange={(e) => companyForm.setData('support_hours', e.target.value)}
                                        isInvalid={!!companyForm.errors.support_hours}
                                        errorMessage={companyForm.errors.support_hours}
                                    />
                                    <div className="flex justify-end">
                                        <Button color="primary" type="submit" isLoading={companyForm.processing}>
                                            Save Company Profile
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Email / SMTP Tab */}
                    <Tab key="email" title="Email / SMTP">
                        <Card className="bg-content1 shadow-sm mt-4">
                            <CardHeader className="px-6 pt-6">
                                <div>
                                    <h3 className="text-lg font-bold">SMTP Mailer Settings</h3>
                                    <p className="text-sm text-default-500">Configure email server for invoices and system announcements.</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6 space-y-4">
                                <form onSubmit={handleServicesSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="SMTP Host"
                                            value={servicesForm.data.mail_host}
                                            onChange={(e) => servicesForm.setData('mail_host', e.target.value)}
                                            isInvalid={!!servicesForm.errors.mail_host}
                                            errorMessage={servicesForm.errors.mail_host}
                                        />
                                        <Input
                                            type="number"
                                            label="Port"
                                            value={servicesForm.data.mail_port}
                                            onChange={(e) => servicesForm.setData('mail_port', e.target.value)}
                                            isInvalid={!!servicesForm.errors.mail_port}
                                            errorMessage={servicesForm.errors.mail_port}
                                        />
                                        <Select
                                            label="Encryption"
                                            selectedKeys={[servicesForm.data.mail_encryption]}
                                            onSelectionChange={(keys) => servicesForm.setData('mail_encryption', Array.from(keys)[0])}
                                        >
                                            <SelectItem key="tls" textValue="TLS">TLS</SelectItem>
                                            <SelectItem key="ssl" textValue="SSL">SSL</SelectItem>
                                            <SelectItem key="none" textValue="None">None</SelectItem>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <Input
                                            label="SMTP Username"
                                            value={servicesForm.data.mail_username}
                                            onChange={(e) => servicesForm.setData('mail_username', e.target.value)}
                                            isInvalid={!!servicesForm.errors.mail_username}
                                            errorMessage={servicesForm.errors.mail_username}
                                        />
                                        <Input
                                            type="password"
                                            label="SMTP Password"
                                            value={servicesForm.data.mail_password}
                                            onChange={(e) => servicesForm.setData('mail_password', e.target.value)}
                                            isInvalid={!!servicesForm.errors.mail_password}
                                            errorMessage={servicesForm.errors.mail_password}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <Input
                                            label="From Email Address"
                                            value={servicesForm.data.mail_from_address}
                                            onChange={(e) => servicesForm.setData('mail_from_address', e.target.value)}
                                            isInvalid={!!servicesForm.errors.mail_from_address}
                                            errorMessage={servicesForm.errors.mail_from_address}
                                        />
                                        <Input
                                            label="From Sender Name"
                                            value={servicesForm.data.mail_from_name}
                                            onChange={(e) => servicesForm.setData('mail_from_name', e.target.value)}
                                            isInvalid={!!servicesForm.errors.mail_from_name}
                                            errorMessage={servicesForm.errors.mail_from_name}
                                        />
                                    </div>
                                    <Divider className="mt-6" />
                                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Input
                                                size="sm"
                                                placeholder="Recipient email address"
                                                value={testRecipient}
                                                onChange={(e) => setTestRecipient(e.target.value)}
                                                className="w-64"
                                            />
                                            <Button
                                                type="button"
                                                color="secondary"
                                                variant="flat"
                                                size="sm"
                                                onPress={handleTestSmtp}
                                                isLoading={testingSmtp}
                                            >
                                                Send Test Email
                                            </Button>
                                        </div>
                                        <Button color="primary" type="submit" isLoading={servicesForm.processing}>
                                            Save SMTP Settings
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* WhatsApp Tab */}
                    <Tab key="whatsapp" title="WhatsApp">
                        <Card className="bg-content1 shadow-sm mt-4">
                            <CardHeader className="px-6 pt-6">
                                <div>
                                    <h3 className="text-lg font-bold">WhatsApp Gateway Integration</h3>
                                    <p className="text-sm text-default-500">Configure WhatsApp API for parent reminders and class notifications.</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6 space-y-4">
                                <form onSubmit={handleServicesSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Provider"
                                            selectedKeys={[servicesForm.data.whatsapp_provider]}
                                            onSelectionChange={(keys) => servicesForm.setData('whatsapp_provider', Array.from(keys)[0])}
                                        >
                                            <SelectItem key="twilio" textValue="Twilio WhatsApp API">Twilio WhatsApp API</SelectItem>
                                            <SelectItem key="waba" textValue="WhatsApp Cloud API (Meta)">WhatsApp Cloud API (Meta)</SelectItem>
                                            <SelectItem key="ultramsg" textValue="UltraMsg / Custom Instance">UltraMsg / Custom Instance</SelectItem>
                                        </Select>
                                        {isWaba ? (
                                            <Input
                                                type="password"
                                                label="Cloud API Access Token"
                                                value={servicesForm.data.whatsapp_access_token}
                                                onChange={(e) => servicesForm.setData('whatsapp_access_token', e.target.value)}
                                                isInvalid={!!servicesForm.errors.whatsapp_access_token}
                                                errorMessage={servicesForm.errors.whatsapp_access_token}
                                            />
                                        ) : (
                                            <Input
                                                label={isWaba ? 'Phone Number ID' : 'Account SID / Instance ID'}
                                                value={servicesForm.data.whatsapp_account_sid}
                                                onChange={(e) => servicesForm.setData('whatsapp_account_sid', e.target.value)}
                                                isInvalid={!!servicesForm.errors.whatsapp_account_sid}
                                                errorMessage={servicesForm.errors.whatsapp_account_sid}
                                            />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {isWaba ? (
                                            <Input
                                                label="Phone Number ID"
                                                value={servicesForm.data.whatsapp_phone_number_id}
                                                onChange={(e) => servicesForm.setData('whatsapp_phone_number_id', e.target.value)}
                                                isInvalid={!!servicesForm.errors.whatsapp_phone_number_id}
                                                errorMessage={servicesForm.errors.whatsapp_phone_number_id}
                                            />
                                        ) : (
                                            <Input
                                                type="password"
                                                label="Auth Token / API Key"
                                                value={servicesForm.data.whatsapp_auth_token}
                                                onChange={(e) => servicesForm.setData('whatsapp_auth_token', e.target.value)}
                                                isInvalid={!!servicesForm.errors.whatsapp_auth_token}
                                                errorMessage={servicesForm.errors.whatsapp_auth_token}
                                            />
                                        )}
                                        <Input
                                            label="Sender Phone Number (with Country Code)"
                                            value={servicesForm.data.whatsapp_phone_number}
                                            onChange={(e) => servicesForm.setData('whatsapp_phone_number', e.target.value)}
                                            isInvalid={!!servicesForm.errors.whatsapp_phone_number}
                                            errorMessage={servicesForm.errors.whatsapp_phone_number}
                                        />
                                    </div>
                                    <Divider className="mt-6" />
                                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Input
                                                size="sm"
                                                placeholder="+60123456789"
                                                value={testPhone}
                                                onChange={(e) => setTestPhone(e.target.value)}
                                                className="w-64"
                                            />
                                            <Button
                                                type="button"
                                                color="secondary"
                                                variant="flat"
                                                size="sm"
                                                onPress={handleTestWhatsApp}
                                                isLoading={testingWhatsApp}
                                            >
                                                Test WhatsApp
                                            </Button>
                                        </div>
                                        <Button color="primary" type="submit" isLoading={servicesForm.processing}>
                                            Save WhatsApp Settings
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Chip Payment Gateway Tab */}
                    <Tab key="chip" title="Chip Payment">
                        <Card className="bg-content1 shadow-sm mt-4">
                            <CardHeader className="flex justify-between items-center px-6 pt-6">
                                <div>
                                    <h3 className="text-lg font-bold">Chip Payment Gateway</h3>
                                    <p className="text-sm text-default-500">Configure Chip API for online invoice payment reconciliation.</p>
                                </div>
                                <Chip color={servicesForm.data.chip_environment === 'live' ? 'success' : 'warning'} variant="flat">
                                    {servicesForm.data.chip_environment.toUpperCase()} MODE
                                </Chip>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6 space-y-4">
                                <form onSubmit={handleServicesSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Environment"
                                            selectedKeys={[servicesForm.data.chip_environment]}
                                            onSelectionChange={(keys) => servicesForm.setData('chip_environment', Array.from(keys)[0])}
                                        >
                                            <SelectItem key="sandbox" textValue="Sandbox (Testing)">Sandbox (Testing)</SelectItem>
                                            <SelectItem key="live" textValue="Live (Production)">Live (Production)</SelectItem>
                                        </Select>
                                        <Input
                                            label="Brand ID"
                                            value={servicesForm.data.chip_brand_id}
                                            onChange={(e) => servicesForm.setData('chip_brand_id', e.target.value)}
                                            isInvalid={!!servicesForm.errors.chip_brand_id}
                                            errorMessage={servicesForm.errors.chip_brand_id}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <Input
                                            type="password"
                                            label="API Secret Key"
                                            value={servicesForm.data.chip_api_key}
                                            onChange={(e) => servicesForm.setData('chip_api_key', e.target.value)}
                                            isInvalid={!!servicesForm.errors.chip_api_key}
                                            errorMessage={servicesForm.errors.chip_api_key}
                                        />
                                        <Input
                                            type="password"
                                            label="Webhook Public Key / Secret"
                                            value={servicesForm.data.chip_webhook_secret}
                                            onChange={(e) => servicesForm.setData('chip_webhook_secret', e.target.value)}
                                            isInvalid={!!servicesForm.errors.chip_webhook_secret}
                                            errorMessage={servicesForm.errors.chip_webhook_secret}
                                        />
                                    </div>
                                    <Divider className="mt-6" />
                                    <div className="flex justify-between items-center pt-2">
                                        <Button
                                            type="button"
                                            color="secondary"
                                            variant="flat"
                                            onPress={handleTestChip}
                                            isLoading={testingChip}
                                        >
                                            Test Chip API Connection
                                        </Button>
                                        <Button color="primary" type="submit" isLoading={servicesForm.processing}>
                                            Save Chip Settings
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Tab>

                    {/* Notification System Tab */}
                    <Tab key="notification-system" title="Notification System">
                        <Card className="bg-content1 shadow-sm mt-4">
                            <CardHeader className="px-6 pt-6">
                                <div>
                                    <h3 className="text-lg font-bold">Notification System</h3>
                                    <p className="text-sm text-default-500">Global behavior settings for all outbound email and WhatsApp notifications.</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6 space-y-6">
                                <form onSubmit={handleNotifSubmit} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Enable Notifications</p>
                                            <p className="text-sm text-default-500">Master switch for all outbound notification dispatches.</p>
                                        </div>
                                        <Switch
                                            isSelected={notifForm.data.notifications_enabled}
                                            onValueChange={(val) => notifForm.setData('notifications_enabled', val)}
                                            color="primary"
                                        />
                                    </div>
                                    <Divider />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            type="number"
                                            label="Daily Dispatch Limit"
                                            value={notifForm.data.notifications_daily_limit}
                                            onChange={(e) => notifForm.setData('notifications_daily_limit', e.target.value)}
                                            isInvalid={!!notifForm.errors.notifications_daily_limit}
                                            errorMessage={notifForm.errors.notifications_daily_limit}
                                        />
                                        <Input
                                            type="number"
                                            label="Retry Attempts"
                                            value={notifForm.data.notifications_retry_attempts}
                                            onChange={(e) => notifForm.setData('notifications_retry_attempts', e.target.value)}
                                            isInvalid={!!notifForm.errors.notifications_retry_attempts}
                                            errorMessage={notifForm.errors.notifications_retry_attempts}
                                        />
                                        <Input
                                            type="number"
                                            label="Retry Delay (minutes)"
                                            value={notifForm.data.notifications_retry_delay_minutes}
                                            onChange={(e) => notifForm.setData('notifications_retry_delay_minutes', e.target.value)}
                                            isInvalid={!!notifForm.errors.notifications_retry_delay_minutes}
                                            errorMessage={notifForm.errors.notifications_retry_delay_minutes}
                                        />
                                    </div>
                                    <Input
                                        type="email"
                                        label="Admin Alert Email"
                                        placeholder="admin@xchessacademy.com"
                                        value={notifForm.data.notifications_admin_alert_email}
                                        onChange={(e) => notifForm.setData('notifications_admin_alert_email', e.target.value)}
                                        isInvalid={!!notifForm.errors.notifications_admin_alert_email}
                                        errorMessage={notifForm.errors.notifications_admin_alert_email}
                                    />
                                    <p className="text-sm text-default-500">
                                        Receives alerts when 5+ consecutive dispatch failures occur.
                                    </p>
                                    <div className="flex justify-end">
                                        <Button color="primary" type="submit" isLoading={notifForm.processing}>
                                            Save Notification Settings
                                        </Button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
