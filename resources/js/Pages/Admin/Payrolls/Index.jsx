import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Card,
    CardBody,
    Button,
    Select,
    SelectItem,
} from "@heroui/react";
import { useCallback, useState } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────
const CheckIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M16.6666 5.83331L7.49992 15L3.33325 10.8333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const DollarIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M10 2.5V17.5M5.83333 5.83333H12.5C13.8807 5.83333 15 6.95262 15 8.33333C15 9.71404 13.8807 10.8333 12.5 10.8333H7.5C6.11929 10.8333 5 11.9526 5 13.3333C5 14.714 6.11929 15.8333 7.5 15.8333H14.1667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const UsersIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const CalendarIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

// ── Helpers ─────────────────────────────────────────────────────────────────
const statusColorMap = {
    Paid: "success",
    Processed: "primary",
    Draft: "warning",
};

const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

const formatMonth = (yearMonth) => {
    if (!yearMonth) return '—';
    const [year, month] = yearMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'long' });
};

// ── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, icon, colorClass }) {
    return (
        <Card shadow="none" className="border border-default-200">
            <CardBody className="flex flex-row items-center gap-4 p-5">
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-default-500 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-xl font-bold text-default-800 mt-0.5">{value}</p>
                </div>
            </CardBody>
        </Card>
    );
}

// ── Table columns ─────────────────────────────────────────────────────────────
const columns = [
    { name: "COACH", uid: "coach" },
    { name: "MONTH", uid: "month" },
    { name: "SESSIONS", uid: "sessions" },
    { name: "RATE (AVG)", uid: "rate" },
    { name: "TOTAL PAY", uid: "total" },
    { name: "BANK", uid: "bank" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Index({ auth, payrolls, summary, availableMonths, filters }) {
    const [selectedMonth, setSelectedMonth] = useState(new Set(filters?.month ? [filters.month] : []));
    const [selectedStatus, setSelectedStatus] = useState(new Set(filters?.status ? [filters.status] : []));

    const applyFilters = (month, status) => {
        const params = {};
        if (month) params.month = month;
        if (status) params.status = status;
        router.get(route('admin.payrolls.index'), params, { preserveState: true, replace: true });
    };

    const handleMonthChange = (keys) => {
        setSelectedMonth(keys);
        const month = [...keys][0] ?? '';
        const status = [...selectedStatus][0] ?? '';
        applyFilters(month, status);
    };

    const handleStatusChange = (keys) => {
        setSelectedStatus(keys);
        const month = [...selectedMonth][0] ?? '';
        const status = [...keys][0] ?? '';
        applyFilters(month, status);
    };

    const clearFilters = () => {
        setSelectedMonth(new Set());
        setSelectedStatus(new Set());
        router.get(route('admin.payrolls.index'), {}, { preserveState: false });
    };

    const approve = (id) => {
        if (confirm('Mark this payroll as processed?')) {
            router.put(route('admin.payrolls.approve', id));
        }
    };

    const markPaid = (id) => {
        if (confirm('Mark this payroll as paid?')) {
            router.put(route('admin.payrolls.paid', id));
        }
    };

    const renderCell = useCallback((payroll, columnKey) => {
        switch (columnKey) {
            case "coach":
                return (
                    <div className="flex flex-col">
                        <p className="font-semibold text-sm capitalize">{payroll.coach?.name}</p>
                        <p className="text-xs text-default-400">{payroll.coach?.email}</p>
                    </div>
                );
            case "month":
                return (
                    <p className="font-medium text-sm">{formatMonth(payroll.month_year)}</p>
                );
            case "sessions":
                return (
                    <div className="flex flex-col items-start">
                        <p className="font-semibold text-sm">{payroll.total_sessions}</p>
                        <p className="text-xs text-default-400">sessions</p>
                    </div>
                );
            case "rate":
                return (
                    <p className="text-sm text-default-600">{formatRM(payroll.base_rate)}</p>
                );
            case "total":
                return (
                    <p className="font-bold text-sm text-success-600">{formatRM(payroll.total_amount)}</p>
                );
            case "bank":
                return payroll.coach?.coach_profile ? (
                    <div className="flex flex-col">
                        <p className="text-xs font-medium">{payroll.coach.coach_profile.bank_name || '—'}</p>
                        <p className="text-xs text-default-400">{payroll.coach.coach_profile.bank_account_number || '—'}</p>
                    </div>
                ) : <span className="text-xs text-default-300">No profile</span>;
            case "status":
                return (
                    <Chip
                        className="capitalize"
                        color={statusColorMap[payroll.status] || "default"}
                        size="sm"
                        variant="flat"
                    >
                        {payroll.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2 justify-center">
                        {payroll.status === 'Draft' && (
                            <Tooltip content="Mark as Processed" color="primary">
                                <button
                                    id={`approve-payroll-${payroll.id}`}
                                    className="text-primary hover:opacity-70 transition-opacity"
                                    onClick={() => approve(payroll.id)}
                                    aria-label="Approve payroll"
                                >
                                    <CheckIcon />
                                </button>
                            </Tooltip>
                        )}
                        {payroll.status === 'Processed' && (
                            <Tooltip content="Mark as Paid" color="success">
                                <button
                                    id={`pay-payroll-${payroll.id}`}
                                    className="text-success hover:opacity-70 transition-opacity"
                                    onClick={() => markPaid(payroll.id)}
                                    aria-label="Mark as paid"
                                >
                                    <DollarIcon />
                                </button>
                            </Tooltip>
                        )}
                        {payroll.status === 'Paid' && (
                            <span className="text-xs text-success-500 font-medium">Paid ✓</span>
                        )}
                    </div>
                );
            default:
                return payroll[columnKey];
        }
    }, []);

    const hasActiveFilters = filters?.month || filters?.status;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Coach Payrolls</h2>
                        <p className="text-sm text-gray-500">Review, approve, and track coach salary payments</p>
                    </div>
                </div>
            }
        >
            <Head title="Coach Payrolls" />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    label="Total Payroll"
                    value={formatRM(summary.total_payroll)}
                    colorClass="bg-primary-50 text-primary-600"
                    icon={<DollarIcon className="text-primary-600" style={{ width: '1.25rem', height: '1.25rem' }} />}
                />
                <SummaryCard
                    label="Sessions Delivered"
                    value={summary.total_sessions}
                    colorClass="bg-secondary-50 text-secondary-600"
                    icon={<CalendarIcon className="text-secondary-600" style={{ width: '1.25rem', height: '1.25rem' }} />}
                />
                <SummaryCard
                    label="Pending Approval"
                    value={summary.draft_count}
                    colorClass="bg-warning-50 text-warning-600"
                    icon={<UsersIcon className="text-warning-600" style={{ width: '1.25rem', height: '1.25rem' }} />}
                />
                <SummaryCard
                    label="Paid Out"
                    value={formatRM(summary.paid_amount)}
                    colorClass="bg-success-50 text-success-600"
                    icon={<CheckIcon className="text-success-600" style={{ width: '1.25rem', height: '1.25rem' }} />}
                />
            </div>

            {/* Filters + Table */}
            <Card shadow="none" className="border border-default-200">
                <CardBody className="p-0">
                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-3 items-center px-5 py-4 border-b border-default-100">
                        <Select
                            id="payroll-filter-month"
                            aria-label="Filter by month"
                            placeholder="All Months"
                            size="sm"
                            className="w-44"
                            selectedKeys={selectedMonth}
                            onSelectionChange={handleMonthChange}
                        >
                            {availableMonths.map((m) => (
                                <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                            ))}
                        </Select>

                        <Select
                            id="payroll-filter-status"
                            aria-label="Filter by status"
                            placeholder="All Statuses"
                            size="sm"
                            className="w-40"
                            selectedKeys={selectedStatus}
                            onSelectionChange={handleStatusChange}
                        >
                            <SelectItem key="Draft">Draft</SelectItem>
                            <SelectItem key="Processed">Processed</SelectItem>
                            <SelectItem key="Paid">Paid</SelectItem>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                id="payroll-clear-filters"
                                size="sm"
                                variant="light"
                                color="default"
                                onPress={clearFilters}
                            >
                                Clear filters
                            </Button>
                        )}

                        <span className="ml-auto text-xs text-default-400">
                            {payrolls.length} record{payrolls.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    <Table
                        aria-label="Coach payrolls table"
                        shadow="none"
                        classNames={{
                            wrapper: "shadow-none rounded-none p-0",
                            th: "bg-default-50 text-default-600 font-semibold text-xs uppercase tracking-wide px-5",
                            td: "px-5 py-3.5",
                        }}
                        selectionMode="none"
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align={column.uid === "actions" ? "center" : "start"}
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody
                            items={payrolls}
                            emptyContent={
                                <div className="py-12 text-center">
                                    <DollarIcon className="mx-auto mb-3 text-default-300" style={{ width: '2.5rem', height: '2.5rem' }} />
                                    <p className="text-default-500 font-medium">No payroll records found</p>
                                    <p className="text-default-400 text-sm mt-1">
                                        Run <code className="bg-default-100 px-1.5 py-0.5 rounded text-xs">php artisan payroll:generate-monthly</code> to generate payrolls.
                                    </p>
                                </div>
                            }
                        >
                            {(item) => (
                                <TableRow key={item.id} className="hover:bg-default-50 transition-colors">
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Status Legend */}
                    {payrolls.length > 0 && (
                        <div className="flex items-center gap-4 px-5 py-3 border-t border-default-100 bg-default-50/50">
                            <span className="text-xs text-default-500 font-medium">Status:</span>
                            <div className="flex items-center gap-3 text-xs text-default-500">
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-400 inline-block" /> Draft — awaiting approval</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-400 inline-block" /> Processed — approved, pending payment</div>
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success-400 inline-block" /> Paid — payment released</div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
