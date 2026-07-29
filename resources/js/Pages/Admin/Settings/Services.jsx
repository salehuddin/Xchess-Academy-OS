import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
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
    Divider
} from "@heroui/react";

export default function Services({ auth, settings }) {
    const { flash = {} } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        // Chip
        chip_environment: settings.chip_environment || 'sandbox',
        chip_brand_id: settings.chip_brand_id || '',
        chip_api_key: settings.chip_api_key || '',
        chip_webhook_secret: settings.chip_webhook_secret || '',

        // SMTP
        mail_host: settings.mail_host || '',
        mail_port: settings.mail_port || 2525,
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || '',
        mail_from_name: settings.mail_from_name || '',

        // WhatsApp
        whatsapp_provider: settings.whatsapp_provider || 'twilio',
        whatsapp_account_sid: settings.whatsapp_account_sid || '',
        whatsapp_auth_token: settings.whatsapp_auth_token || '',
        whatsapp_phone_number: settings.whatsapp_phone_number || '',
    });

    const [testRecipient, setTestRecipient] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [testingChip, setTestingChip] = useState(false);
    const [testingWhatsApp, setTestingWhatsApp] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.services.update'), {
            preserveScroll: true,
        });
    };

    const handleTestSmtp = () => {
        if (!testRecipient) return;
        setTestingSmtp(true);
        post(route('admin.settings.test-smtp'), { recipient: testRecipient }, {
            preserveScroll: true,
            onFinish: () => setTestingSmtp(false),
        });
    };

    const handleTestChip = () => {
        setTestingChip(true);
        post(route('admin.settings.test-chip'), {}, {
            preserveScroll: true,
            onFinish: () => setTestingChip(false),
        });
    };

    const handleTestWhatsApp = () => {
        if (!testPhone) return;
        setTestingWhatsApp(true);
        post(route('admin.settings.test-whatsapp'), { phone: testPhone }, {
            preserveScroll: true,
            onFinish: () => setTestingWhatsApp(false),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">External Services Settings</h2>}
        >
            <Head title="External Services Settings" />

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

                <form onSubmit={handleSubmit}>
                    <Tabs aria-label="External Services" color="primary" variant="bordered" className="w-full">
                        {/* Chip Payment Gateway Tab */}
                        <Tab key="chip" title="Chip Payment Gateway">
                            <Card className="bg-content1 shadow-sm mt-4">
                                <CardHeader className="flex justify-between items-center px-6 pt-6">
                                    <div>
                                        <h3 className="text-lg font-bold">Chip Payment Gateway</h3>
                                        <p className="text-sm text-default-500">Configure Chip API credentials for online parent invoice payment reconciliation.</p>
                                    </div>
                                    <Chip color={data.chip_environment === 'live' ? 'success' : 'warning'} variant="flat">
                                        {data.chip_environment.toUpperCase()} MODE
                                    </Chip>
                                </CardHeader>
                                <CardBody className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Environment"
                                            selectedKeys={[data.chip_environment]}
                                            onSelectionChange={(keys) => setData('chip_environment', Array.from(keys)[0])}
                                        >
                                            <SelectItem key="sandbox" textValue="Sandbox (Testing)">Sandbox (Testing)</SelectItem>
                                            <SelectItem key="live" textValue="Live (Production)">Live (Production)</SelectItem>
                                        </Select>

                                        <Input
                                            label="Brand ID"
                                            value={data.chip_brand_id}
                                            onChange={(e) => setData('chip_brand_id', e.target.value)}
                                            isInvalid={!!errors.chip_brand_id}
                                            errorMessage={errors.chip_brand_id}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            type="password"
                                            label="API Secret Key"
                                            value={data.chip_api_key}
                                            onChange={(e) => setData('chip_api_key', e.target.value)}
                                            isInvalid={!!errors.chip_api_key}
                                            errorMessage={errors.chip_api_key}
                                        />

                                        <Input
                                            type="password"
                                            label="Webhook Public Key / Secret"
                                            value={data.chip_webhook_secret}
                                            onChange={(e) => setData('chip_webhook_secret', e.target.value)}
                                            isInvalid={!!errors.chip_webhook_secret}
                                            errorMessage={errors.chip_webhook_secret}
                                        />
                                    </div>

                                    <Divider />

                                    <div className="flex justify-between items-center pt-2">
                                        <Button
                                            color="secondary"
                                            variant="flat"
                                            onPress={handleTestChip}
                                            isLoading={testingChip}
                                        >
                                            Test Chip API Connection
                                        </Button>
                                        <Button color="primary" type="submit" isLoading={processing}>
                                            Save Chip Settings
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>

                        {/* SMTP Mailer Tab */}
                        <Tab key="smtp" title="SMTP Mailer">
                            <Card className="bg-content1 shadow-sm mt-4">
                                <CardHeader className="px-6 pt-6">
                                    <div>
                                        <h3 className="text-lg font-bold">SMTP Mailer Settings</h3>
                                        <p className="text-sm text-default-500">Configure email server credentials for sending invoices and system announcements.</p>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input
                                            label="SMTP Host"
                                            value={data.mail_host}
                                            onChange={(e) => setData('mail_host', e.target.value)}
                                            isInvalid={!!errors.mail_host}
                                            errorMessage={errors.mail_host}
                                        />
                                        <Input
                                            type="number"
                                            label="Port"
                                            value={data.mail_port}
                                            onChange={(e) => setData('mail_port', e.target.value)}
                                            isInvalid={!!errors.mail_port}
                                            errorMessage={errors.mail_port}
                                        />
                                        <Select
                                            label="Encryption"
                                            selectedKeys={[data.mail_encryption]}
                                            onSelectionChange={(keys) => setData('mail_encryption', Array.from(keys)[0])}
                                        >
                                            <SelectItem key="tls" textValue="TLS">TLS</SelectItem>
                                            <SelectItem key="ssl" textValue="SSL">SSL</SelectItem>
                                            <SelectItem key="none" textValue="None">None</SelectItem>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="SMTP Username"
                                            value={data.mail_username}
                                            onChange={(e) => setData('mail_username', e.target.value)}
                                            isInvalid={!!errors.mail_username}
                                            errorMessage={errors.mail_username}
                                        />
                                        <Input
                                            type="password"
                                            label="SMTP Password"
                                            value={data.mail_password}
                                            onChange={(e) => setData('mail_password', e.target.value)}
                                            isInvalid={!!errors.mail_password}
                                            errorMessage={errors.mail_password}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="From Email Address"
                                            value={data.mail_from_address}
                                            onChange={(e) => setData('mail_from_address', e.target.value)}
                                            isInvalid={!!errors.mail_from_address}
                                            errorMessage={errors.mail_from_address}
                                        />
                                        <Input
                                            label="From Sender Name"
                                            value={data.mail_from_name}
                                            onChange={(e) => setData('mail_from_name', e.target.value)}
                                            isInvalid={!!errors.mail_from_name}
                                            errorMessage={errors.mail_from_name}
                                        />
                                    </div>

                                    <Divider />

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
                                                color="secondary"
                                                variant="flat"
                                                size="sm"
                                                onPress={handleTestSmtp}
                                                isLoading={testingSmtp}
                                            >
                                                Send Test Email
                                            </Button>
                                        </div>

                                        <Button color="primary" type="submit" isLoading={processing}>
                                            Save SMTP Settings
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>

                        {/* WhatsApp Gateway Tab */}
                        <Tab key="whatsapp" title="WhatsApp Messaging">
                            <Card className="bg-content1 shadow-sm mt-4">
                                <CardHeader className="px-6 pt-6">
                                    <div>
                                        <h3 className="text-lg font-bold">WhatsApp Gateway Integration</h3>
                                        <p className="text-sm text-default-500">Configure WhatsApp API credentials for dispatching parent reminders and class notifications.</p>
                                    </div>
                                </CardHeader>
                                <CardBody className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Provider"
                                            selectedKeys={[data.whatsapp_provider]}
                                            onSelectionChange={(keys) => setData('whatsapp_provider', Array.from(keys)[0])}
                                        >
                                            <SelectItem key="twilio" textValue="Twilio WhatsApp API">Twilio WhatsApp API</SelectItem>
                                            <SelectItem key="waba" textValue="WhatsApp Business API (WABA)">WhatsApp Business API (WABA)</SelectItem>
                                            <SelectItem key="ultramsg" textValue="UltraMsg / Custom Instance">UltraMsg / Custom Instance</SelectItem>
                                        </Select>

                                        <Input
                                            label="Account SID / Instance ID"
                                            value={data.whatsapp_account_sid}
                                            onChange={(e) => setData('whatsapp_account_sid', e.target.value)}
                                            isInvalid={!!errors.whatsapp_account_sid}
                                            errorMessage={errors.whatsapp_account_sid}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            type="password"
                                            label="Auth Token / API Key"
                                            value={data.whatsapp_auth_token}
                                            onChange={(e) => setData('whatsapp_auth_token', e.target.value)}
                                            isInvalid={!!errors.whatsapp_auth_token}
                                            errorMessage={errors.whatsapp_auth_token}
                                        />

                                        <Input
                                            label="Sender Phone Number (with Country Code)"
                                            value={data.whatsapp_phone_number}
                                            onChange={(e) => setData('whatsapp_phone_number', e.target.value)}
                                            isInvalid={!!errors.whatsapp_phone_number}
                                            errorMessage={errors.whatsapp_phone_number}
                                        />
                                    </div>

                                    <Divider />

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
                                                color="secondary"
                                                variant="flat"
                                                size="sm"
                                                onPress={handleTestWhatsApp}
                                                isLoading={testingWhatsApp}
                                            >
                                                Test WhatsApp Dispatch
                                            </Button>
                                        </div>

                                        <Button color="primary" type="submit" isLoading={processing}>
                                            Save WhatsApp Settings
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Tab>
                    </Tabs>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
