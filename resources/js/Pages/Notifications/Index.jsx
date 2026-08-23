import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import axios from 'axios';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Select,
    SelectItem,
    Pagination,
    Button,
} from '@heroui/react';

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

export default function Index({ notifications, filters, types }) {
    const { auth } = usePage().props;
    const [filter, setFilter] = useState(filters?.filter ?? '');
    const [type, setType] = useState(filters?.type ?? '');
    const [busyId, setBusyId] = useState(null);

    const applyFilters = useCallback(() => {
        router.get(
            route('me.notifications.index'),
            {
                filter: filter || undefined,
                type: type || undefined,
            },
            { preserveState: true, replace: true },
        );
    }, [filter, type]);

    const clearFilters = useCallback(() => {
        setFilter('');
        setType('');
        router.get(route('me.notifications.index'), {}, { preserveState: true, replace: true });
    }, []);

    const onPageChange = useCallback((page) => {
        router.get(route('me.notifications.index'), { ...filters, page }, { preserveState: true, replace: true });
    }, [filters]);

    const openItem = async (n) => {
        if (!n.read_at) {
            setBusyId(n.id);
            try {
                await axios.post(route('me.notifications.read', n.id), {}, { validateStatus: () => true });
            } catch {
                // non-fatal
            } finally {
                setBusyId(null);
            }
        }
        if (n.url) {
            router.visit(n.url);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post(route('me.notifications.read-all'), {}, { validateStatus: () => true });
            router.reload({ preserveState: true, replace: true });
        } catch {
            // non-fatal
        }
    };

    const hasUnread = (notifications?.data ?? []).some((n) => !n.read_at);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Notifications</h2>
                        <p className="text-sm text-gray-500">Your in-app activity and alerts</p>
                    </div>
                    {hasUnread && (
                        <Button variant="flat" onPress={markAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Notifications" />

            <Card className="shadow-sm border border-gray-100">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <Select
                            label="Filter"
                            selectedKeys={filter ? [filter] : []}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full md:w-[200px]"
                            disallowEmptySelection
                        >
                            <SelectItem key="">All</SelectItem>
                            <SelectItem key="unread">Unread</SelectItem>
                        </Select>
                        <Select
                            label="Type"
                            selectedKeys={type ? [type] : []}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full md:w-[220px]"
                            disallowEmptySelection
                        >
                            <SelectItem key="">All types</SelectItem>
                            {(types ?? []).map((t) => (
                                <SelectItem key={t}>{TYPE_LABEL[t] ?? t}</SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="flat" onPress={clearFilters}>Clear</Button>
                        <Button color="primary" onPress={applyFilters}>Apply</Button>
                        <label className="flex items-center text-default-400 text-small ml-2">
                            Rows per page:
                            <select
                                className="bg-transparent outline-none text-default-400 text-small ml-1"
                                onChange={(e) =>
                                    router.get(
                                        route('me.notifications.index'),
                                        { ...filters, per_page: Number(e.target.value), page: 1 },
                                        { preserveState: true, replace: true },
                                    )
                                }
                                value={filters?.per_page || 15}
                            >
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </label>
                    </div>
                </CardHeader>

                <CardBody>
                    <Table aria-label="Notifications table" removeWrapper>
                        <TableHeader>
                            <TableColumn>WHEN</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>TITLE</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn align="end">ACTION</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No notifications found.">
                            {(notifications?.data ?? []).map((n) => (
                                <TableRow
                                    key={n.id}
                                    className={n.read_at ? '' : 'bg-primary/5 cursor-pointer'}
                                    onClick={() => openItem(n)}
                                >
                                    <TableCell className="whitespace-nowrap">{fmtRelative(n.created_at)}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color={TYPE_COLOR[n.type] ?? 'default'}>
                                            {TYPE_LABEL[n.type] ?? n.type}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-foreground">{n.title}</p>
                                        {n.body && <p className="text-xs text-default-500 line-clamp-2">{n.body}</p>}
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant={n.read_at ? 'flat' : 'solid'} color={n.read_at ? 'default' : 'primary'}>
                                            {n.read_at ? 'Read' : 'Unread'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell align="end">
                                        {n.url && (
                                            <Button
                                                as={Link}
                                                href={n.url}
                                                size="sm"
                                                variant="flat"
                                                isLoading={busyId === n.id}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Open
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {notifications?.last_page > 1 ? (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                page={notifications.current_page}
                                total={notifications.last_page}
                                onChange={onPageChange}
                                showControls
                            />
                        </div>
                    ) : null}
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
