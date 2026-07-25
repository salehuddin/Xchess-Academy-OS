import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Switch
} from "@heroui/react";

const scheduleDaysToString = (notification) => {
    const days = notification?.schedule?.days;
    if (!Array.isArray(days) || days.length === 0) return '0';
    return days.join(',');
};

export default function Edit({ notification }) {
    const { auth } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: notification.name || '',
        channel: notification.channel || 'email',
        trigger: notification.trigger || 'invoice_sent',
        subject: notification.subject || '',
        body: notification.body || '',
        is_active: !!notification.is_active,
        class_mode: notification.conditions?.class_mode || 'All',
        schedule_days: scheduleDaysToString(notification)
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.notifications.update', notification.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Edit Notification</h2>
                        <p className="text-sm text-gray-500">Update channel, trigger, and message template</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Notification" />

            <Card className="w-full max-w-3xl mx-auto shadow-sm border border-gray-100">
                <CardBody className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            errorMessage={errors.name}
                            isInvalid={!!errors.name}
                            isRequired
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Channel"
                                selectedKeys={data.channel ? [data.channel] : []}
                                onChange={(e) => setData('channel', e.target.value)}
                                errorMessage={errors.channel}
                                isInvalid={!!errors.channel}
                                isRequired
                            >
                                <SelectItem key="email">Email</SelectItem>
                                <SelectItem key="whatsapp">WhatsApp</SelectItem>
                            </Select>

                            <Select
                                label="Trigger"
                                selectedKeys={data.trigger ? [data.trigger] : []}
                                onChange={(e) => setData('trigger', e.target.value)}
                                errorMessage={errors.trigger}
                                isInvalid={!!errors.trigger}
                                isRequired
                            >
                                <SelectItem key="invoice_sent">Invoice Sent</SelectItem>
                                <SelectItem key="invoice_overdue">Invoice Overdue</SelectItem>
                                <SelectItem key="announcement">Announcement</SelectItem>
                            </Select>

                            <Select
                                label="Class Mode Filter"
                                selectedKeys={data.class_mode ? [data.class_mode] : []}
                                onChange={(e) => setData('class_mode', e.target.value)}
                                errorMessage={errors.class_mode}
                                isInvalid={!!errors.class_mode}
                                isRequired
                            >
                                <SelectItem key="All">All</SelectItem>
                                <SelectItem key="Online">Online</SelectItem>
                                <SelectItem key="Physical">Physical</SelectItem>
                            </Select>
                        </div>

                        {data.channel === 'email' ? (
                            <Input
                                label="Email Subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                errorMessage={errors.subject}
                                isInvalid={!!errors.subject}
                            />
                        ) : null}

                        {data.trigger === 'invoice_overdue' ? (
                            <Input
                                label="Reminder Days (comma-separated)"
                                description="Days after due date. Example: 0,3,7"
                                value={data.schedule_days}
                                onChange={(e) => setData('schedule_days', e.target.value)}
                                errorMessage={errors.schedule_days}
                                isInvalid={!!errors.schedule_days}
                            />
                        ) : null}

                        <Textarea
                            label={data.channel === 'email' ? 'Email Body (HTML allowed)' : 'Message Body'}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            errorMessage={errors.body}
                            isInvalid={!!errors.body}
                            minRows={8}
                            isRequired
                        />

                        <div className="flex items-center justify-between">
                            <Switch
                                isSelected={data.is_active}
                                onValueChange={(val) => setData('is_active', val)}
                            >
                                Active
                            </Switch>

                            <div className="flex items-center gap-4">
                                <Button
                                    as={Link}
                                    href={route('admin.notifications.index')}
                                    color="danger"
                                    variant="light"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" isLoading={processing}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}

