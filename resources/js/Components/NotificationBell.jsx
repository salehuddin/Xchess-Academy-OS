import { useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Badge,
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ScrollShadow,
    Chip,
    Spinner,
} from '@heroui/react';
import useNotifications from '@/Hooks/useNotifications';

const BellIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.2599H18.66C19.96 18.2599 20.45 16.9499 19.74 15.7699L18.59 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M13.87 3.2C13.56 3.11 13.24 3.04 12.91 3C11.95 2.88 11.03 2.97 10.17 3.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M15.02 19.06C15.02 20.71 13.67 22.06 12.02 22.06C10.37 22.06 9.02 20.71 9.02 19.06" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

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

export default function NotificationBell() {
    const { url } = usePage();
    const { count, latest, loading, setCount, setLatest, refresh } = useNotifications(45000);

    // Re-fetch after every Inertia navigation.
    useEffect(() => {
        refresh({ silent: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const unreadBadge = count > 99 ? '99+' : count;

    const markRead = async (item) => {
        const wasUnread = !item.read_at;
        // Optimistic update.
        setLatest((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
        if (wasUnread) setCount((c) => Math.max(0, c - 1));
        try {
            await axios.post(route('me.notifications.read', item.id), {}, { validateStatus: () => true });
        } catch {
            // non-fatal
        }
        if (item.url) {
            router.visit(item.url);
        }
    };

    const markAllRead = async () => {
        setCount(0);
        setLatest((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        try {
            await axios.post(route('me.notifications.read-all'), {}, { validateStatus: () => true });
        } catch {
            // non-fatal
        }
    };

    return (
        <Popover placement="bottom-end">
            <PopoverTrigger>
                <Button isIconOnly variant="light" radius="full" aria-label="Notifications">
                    <Badge
                        content={unreadBadge}
                        color="danger"
                        shape="circle"
                        size="sm"
                        isInvisible={count === 0}
                    >
                        <BellIcon className="text-default-500 text-xl" />
                    </Badge>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
                    <span className="font-semibold text-foreground">Notifications</span>
                    {count > 0 && (
                        <Button size="sm" variant="light" onPress={markAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollShadow className="max-h-[380px] overflow-y-auto">
                    {loading && latest.length === 0 ? (
                        <div className="flex justify-center p-8">
                            <Spinner size="sm" />
                        </div>
                    ) : latest.length === 0 ? (
                        <div className="p-8 text-center text-default-400 text-sm">
                            You&rsquo;re all caught up.
                        </div>
                    ) : (
                        latest.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => markRead(n)}
                                className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-default-100 transition-colors border-b border-divider/50 ${
                                    n.read_at ? '' : 'bg-primary/5'
                                }`}
                            >
                                <Chip size="sm" variant="flat" color={TYPE_COLOR[n.type] ?? 'default'} className="flex-shrink-0">
                                    {TYPE_LABEL[n.type] ?? n.type}
                                </Chip>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                                    {n.body && <p className="text-xs text-default-500 line-clamp-2">{n.body}</p>}
                                    <p className="text-tiny text-default-400 mt-0.5">{fmtRelative(n.created_at)}</p>
                                </div>
                                {!n.read_at && (
                                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                )}
                            </button>
                        ))
                    )}
                </ScrollShadow>
                <div className="border-t border-divider p-2">
                    <Button as={Link} href={route('me.notifications.index')} variant="light" size="sm" fullWidth>
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
