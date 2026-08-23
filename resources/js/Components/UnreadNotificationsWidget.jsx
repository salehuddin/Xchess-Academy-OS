import { Link, router } from '@inertiajs/react';
import { Card, CardBody, CardHeader, Chip, Button } from '@heroui/react';
import axios from 'axios';
import { useCallback } from 'react';

const TYPE_LABEL = {
    task_assigned: 'Task',
    invoice_overdue: 'Overdue',
    invoice_sent: 'Invoice',
    payroll_ready: 'Payroll',
    attendance_pending: 'Attendance',
    outbound_failure_spike: 'Alert',
};

const TYPE_COLOR = {
    task_assigned: 'primary',
    invoice_overdue: 'danger',
    invoice_sent: 'success',
    payroll_ready: 'secondary',
    attendance_pending: 'warning',
    outbound_failure_spike: 'danger',
};

const BellIcon = (props) => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
);

function fmtRelative(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const diff = (date.getTime() - Date.now()) / 1000;
    const abs = Math.abs(diff);
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    if (abs < 60) return rtf.format(Math.round(diff), 'second');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 2592000) return rtf.format(Math.round(diff / 86400), 'day');
    return date.toLocaleDateString();
}

export default function UnreadNotificationsWidget({ notifications = [] }) {
    const items = Array.isArray(notifications) ? notifications : (notifications?.data ?? []);

    const openItem = useCallback(async (n) => {
        if (!n.read_at) {
            axios.post(route('me.notifications.read', n.id), {}, { validateStatus: () => true }).catch(() => {});
        }
        if (n.url) {
            router.visit(n.url);
        }
    }, []);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex justify-between items-center px-6 pt-6">
                <div className="flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-default-500" />
                    <h3 className="text-lg font-bold">Recent Notifications</h3>
                </div>
                {items.length > 0 && (
                    <Chip color="danger" size="sm" variant="flat">{items.length}</Chip>
                )}
            </CardHeader>
            <CardBody className="px-6 pb-6">
                {items.length === 0 ? (
                    <div className="py-8 text-center text-default-400">
                        <BellIcon className="w-10 h-10 mx-auto mb-2 text-default-300" />
                        <p className="text-sm">You&rsquo;re all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => openItem(n)}
                                className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-default-50 transition-colors"
                            >
                                <Chip size="sm" variant="flat" color={TYPE_COLOR[n.type] ?? 'default'} className="flex-shrink-0 mt-0.5">
                                    {TYPE_LABEL[n.type] ?? n.type}
                                </Chip>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                                    {n.body && <p className="text-xs text-default-500 line-clamp-1">{n.body}</p>}
                                    <p className="text-tiny text-default-400 mt-0.5">{fmtRelative(n.created_at)}</p>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            </button>
                        ))}
                        <Button
                            as={Link}
                            href={route('me.notifications.index')}
                            variant="light"
                            size="sm"
                            fullWidth
                            className="mt-2"
                        >
                            View all
                        </Button>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
