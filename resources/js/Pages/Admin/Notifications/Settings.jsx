import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Chip,
    Button
} from "@heroui/react";

export default function Settings({ settings }) {
    const { auth } = usePage().props;

    const chip = (ok, okLabel = 'Configured', badLabel = 'Missing') => (
        <Chip size="sm" color={ok ? 'success' : 'danger'} variant="flat">
            {ok ? okLabel : badLabel}
        </Chip>
    );

    const mail = settings?.mail ?? {};
    const whatsapp = settings?.whatsapp ?? {};

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Channel Settings</h2>
                        <p className="text-sm text-gray-500">View SMTP and WhatsApp configuration status</p>
                    </div>
                    <Button as={Link} href={route('admin.notifications.index')} variant="flat">
                        Back to Builder
                    </Button>
                </div>
            }
        >
            <Head title="Notification Settings" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="flex items-center justify-between">
                        <div className="font-semibold text-foreground">Email (SMTP)</div>
                        <Chip size="sm" variant="flat">{mail.default ?? 'log'}</Chip>
                    </CardHeader>
                    <Divider />
                    <CardBody className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-default-600">From Address</div>
                            <div className="text-sm text-foreground">{mail.from?.address ?? '-'}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-default-600">From Name</div>
                            <div className="text-sm text-foreground">{mail.from?.name ?? '-'}</div>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-default-600">SMTP Host</div>
                            <div className="text-sm text-foreground">{mail.smtp?.host ?? '-'}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-default-600">SMTP Port</div>
                            <div className="text-sm text-foreground">{mail.smtp?.port ?? '-'}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-default-600">SMTP Username</div>
                            <div>{chip(!!mail.smtp?.username_set)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-default-600">SMTP Password</div>
                            <div>{chip(!!mail.smtp?.password_set)}</div>
                        </div>
                        <Divider />
                        <div className="text-sm text-default-500">
                            Set these in .env: MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS, MAIL_FROM_NAME
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="flex items-center justify-between">
                        <div className="font-semibold text-foreground">WhatsApp</div>
                        <Chip size="sm" variant="flat">{whatsapp.driver ?? 'log'}</Chip>
                    </CardHeader>
                    <Divider />
                    <CardBody className="space-y-4">
                        <div className="text-sm text-default-500">
                            Current driver: <span className="text-foreground">{whatsapp.driver ?? 'log'}</span>
                        </div>
                        <Divider />
                        <div className="text-sm text-default-500">
                            Supported drivers in this build: {(whatsapp.supported_drivers ?? []).join(', ') || 'log'}
                        </div>
                        <div className="text-sm text-default-500">
                            Set this in .env: WHATSAPP_DRIVER
                        </div>
                        <Divider />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-content2">
                                <CardBody className="space-y-2">
                                    <div className="font-medium text-foreground">Twilio</div>
                                    <div className="flex items-center gap-2">
                                        {chip(!!whatsapp.twilio?.account_sid_set, 'SID', 'SID Missing')}
                                        {chip(!!whatsapp.twilio?.auth_token_set, 'Token', 'Token Missing')}
                                        {chip(!!whatsapp.twilio?.from_set, 'From', 'From Missing')}
                                    </div>
                                    <div className="text-sm text-default-500">
                                        ENV: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
                                    </div>
                                </CardBody>
                            </Card>
                            <Card className="bg-content2">
                                <CardBody className="space-y-2">
                                    <div className="font-medium text-foreground">Meta Cloud API</div>
                                    <div className="flex items-center gap-2">
                                        {chip(!!whatsapp.meta_cloud?.access_token_set, 'Token', 'Token Missing')}
                                        {chip(!!whatsapp.meta_cloud?.phone_number_id_set, 'Phone ID', 'Phone ID Missing')}
                                    </div>
                                    <div className="text-sm text-default-500">
                                        ENV: META_WHATSAPP_ACCESS_TOKEN, META_WHATSAPP_PHONE_NUMBER_ID
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-gray-100 lg:col-span-2">
                    <CardHeader className="font-semibold text-foreground">Email Provider Options</CardHeader>
                    <Divider />
                    <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-content2">
                            <CardBody className="space-y-2">
                                <div className="font-medium text-foreground">Postmark</div>
                                <div>{chip(!!mail.providers?.postmark_key_set)}</div>
                                <div className="text-sm text-default-500">ENV: POSTMARK_API_KEY</div>
                            </CardBody>
                        </Card>
                        <Card className="bg-content2">
                            <CardBody className="space-y-2">
                                <div className="font-medium text-foreground">Resend</div>
                                <div>{chip(!!mail.providers?.resend_key_set)}</div>
                                <div className="text-sm text-default-500">ENV: RESEND_API_KEY</div>
                            </CardBody>
                        </Card>
                        <Card className="bg-content2">
                            <CardBody className="space-y-2">
                                <div className="font-medium text-foreground">AWS SES</div>
                                <div className="flex items-center gap-2">
                                    {chip(!!mail.providers?.ses_key_set, 'Key', 'Key Missing')}
                                    {chip(!!mail.providers?.ses_secret_set, 'Secret', 'Secret Missing')}
                                </div>
                                <div className="text-sm text-default-500">ENV: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY</div>
                            </CardBody>
                        </Card>
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
