import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Pagination,
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
} from "@heroui/react";
import { useCallback, useState } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────
const EyeIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const DocumentIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusColorMap = {
    Draft: "default",
    Pending: "warning",
    Paid: "success",
    Overdue: "danger",
    Partial: "primary",
};

const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

const formatMonth = (yearMonth) => {
    if (!yearMonth) return '—';
    const [year, month] = yearMonth.split('-');
    return new Date(Number(year), Number(month) - 1, 1)
        .toLocaleDateString('en-MY', { year: 'numeric', month: 'long' });
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, colorClass, icon }) {
    return (
        <Card shadow="none" className="border border-default-200">
            <CardBody className="flex flex-row items-center gap-4 p-5">
                <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
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
    { name: "INV #", uid: "id" },
    { name: "STUDENT", uid: "student" },
    { name: "MONTH", uid: "month" },
    { name: "AMOUNT", uid: "amount" },
    { name: "DUE DATE", uid: "due_date" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Index({ auth, invoices, summary, availableMonths, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [selectedMonth, setSelectedMonth] = useState(new Set(filters?.month ? [filters.month] : []));
    const [selectedStatus, setSelectedStatus] = useState(new Set(filters?.status ? [filters.status] : []));

    const pushFilters = (overrides = {}) => {
        const params = {
            search: search || undefined,
            month: [...selectedMonth][0] || undefined,
            status: [...selectedStatus][0] || undefined,
            per_page: filters?.per_page,
            ...overrides,
        };
        // strip undefined keys
        Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
        router.get(route('admin.invoices.index'), params, { preserveState: true, replace: true });
    };

    const handleMonthChange = (keys) => {
        setSelectedMonth(keys);
        pushFilters({ month: [...keys][0] || undefined });
    };

    const handleStatusChange = (keys) => {
        setSelectedStatus(keys);
        pushFilters({ status: [...keys][0] || undefined });
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') pushFilters({ search: search || undefined });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedMonth(new Set());
        setSelectedStatus(new Set());
        router.get(route('admin.invoices.index'), {}, { preserveState: false });
    };

    const hasActiveFilters = filters?.month || filters?.status || filters?.search;

    const renderCell = useCallback((invoice, columnKey) => {
        switch (columnKey) {
            case 'id':
                return (
                    <Link href={route('admin.invoices.show', invoice.id)} className="font-bold text-primary hover:underline">
                        INV-{String(invoice.id).padStart(4, '0')}
                    </Link>
                );
            case 'student':
                return (
                    <div>
                        <p className="font-semibold text-sm">{invoice.student?.name}</p>
                        <p className="text-xs text-default-400">{invoice.student?.student_uid ?? ''}</p>
                    </div>
                );
            case 'month':
                return <p className="text-sm font-medium">{formatMonth(invoice.month_year)}</p>;
            case 'amount':
                return <p className="font-bold text-sm">{formatRM(invoice.total_amount)}</p>;
            case 'due_date':
                return <p className="text-sm text-default-600">{formatDate(invoice.due_date)}</p>;
            case 'status':
                return (
                    <Chip
                        className="capitalize"
                        color={statusColorMap[invoice.status] ?? 'default'}
                        size="sm"
                        variant="flat"
                    >
                        {invoice.status}
                    </Chip>
                );
            case 'actions':
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Tooltip content="View Invoice">
                            <Link
                                id={`view-invoice-${invoice.id}`}
                                href={route('admin.invoices.show', invoice.id)}
                                className="text-default-400 hover:text-primary transition-colors"
                            >
                                <EyeIcon />
                            </Link>
                        </Tooltip>
                    </div>
                );
            default:
                return invoice[columnKey];
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Invoices</h2>
                        <p className="text-sm text-gray-500">Review, adjust, and send monthly student invoices</p>
                    </div>
                </div>
            }
        >
            <Head title="Invoices" />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <SummaryCard
                    label="Total"
                    value={summary.total}
                    colorClass="bg-default-100 text-default-600"
                    icon={<DocumentIcon style={{ width: '1.2rem', height: '1.2rem' }} />}
                />
                <SummaryCard
                    label="Draft"
                    value={summary.draft_count}
                    colorClass="bg-default-100 text-default-600"
                    icon={<span className="text-xs font-bold">DR</span>}
                />
                <SummaryCard
                    label="Pending"
                    value={summary.pending_count}
                    colorClass="bg-warning-50 text-warning-600"
                    icon={<span className="text-xs font-bold">PE</span>}
                />
                <SummaryCard
                    label="Paid"
                    value={summary.paid_count}
                    colorClass="bg-success-50 text-success-600"
                    icon={<span className="text-xs font-bold">PD</span>}
                />
                <SummaryCard
                    label="Billed"
                    value={formatRM(summary.total_billed)}
                    colorClass="bg-primary-50 text-primary-600"
                    icon={<span className="text-xs font-bold">RM</span>}
                />
                <SummaryCard
                    label="Collected"
                    value={formatRM(summary.total_collected)}
                    colorClass="bg-success-50 text-success-700"
                    icon={<span className="text-xs font-bold">✓</span>}
                />
            </div>

            {/* Table Card */}
            <Card shadow="none" className="border border-default-200">
                <CardBody className="p-0">
                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-3 items-center px-5 py-4 border-b border-default-100">
                        <Input
                            id="invoice-search"
                            aria-label="Search by student name"
                            placeholder="Search student..."
                            size="sm"
                            className="w-52"
                            startContent={<SearchIcon className="text-default-400 shrink-0" style={{ width: '1rem' }} />}
                            value={search}
                            onValueChange={setSearch}
                            onKeyDown={handleSearchKeyDown}
                            onClear={() => { setSearch(''); pushFilters({ search: undefined }); }}
                            isClearable
                        />

                        <Select
                            id="invoice-filter-month"
                            aria-label="Filter by month"
                            placeholder="All Months"
                            size="sm"
                            className="w-44"
                            selectedKeys={selectedMonth}
                            onSelectionChange={handleMonthChange}
                        >
                            {availableMonths.map((m) => (
                                <SelectItem key={m}>{formatMonth(m)}</SelectItem>
                            ))}
                        </Select>

                        <Select
                            id="invoice-filter-status"
                            aria-label="Filter by status"
                            placeholder="All Statuses"
                            size="sm"
                            className="w-40"
                            selectedKeys={selectedStatus}
                            onSelectionChange={handleStatusChange}
                        >
                            <SelectItem key="Draft">Draft</SelectItem>
                            <SelectItem key="Pending">Pending</SelectItem>
                            <SelectItem key="Paid">Paid</SelectItem>
                            <SelectItem key="Overdue">Overdue</SelectItem>
                        </Select>

                        {hasActiveFilters && (
                            <Button id="invoice-clear-filters" size="sm" variant="light" onPress={clearFilters}>
                                Clear filters
                            </Button>
                        )}

                        <span className="ml-auto text-xs text-default-400">
                            {invoices.total} invoice{invoices.total !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    <Table
                        aria-label="Invoices table"
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
                                    align={column.uid === 'actions' ? 'center' : 'start'}
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody
                            items={invoices.data}
                            emptyContent={
                                <div className="py-12 text-center">
                                    <DocumentIcon className="mx-auto mb-3 text-default-300" style={{ width: '2.5rem', height: '2.5rem' }} />
                                    <p className="text-default-500 font-medium">No invoices found</p>
                                    <p className="text-default-400 text-sm mt-1">
                                        Run <code className="bg-default-100 px-1.5 py-0.5 rounded text-xs">php artisan invoices:generate-monthly</code> to generate this month's invoices.
                                    </p>
                                </div>
                            }
                        >
                            {(item) => (
                                <TableRow key={item.id} className="hover:bg-default-50 transition-colors cursor-pointer">
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {invoices.last_page > 1 && (
                        <div className="flex w-full justify-between items-center px-5 py-4 border-t border-default-100">
                            <span className="text-xs text-default-400">
                                Showing {invoices.from}–{invoices.to} of {invoices.total}
                            </span>
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={invoices.current_page}
                                total={invoices.last_page}
                                onChange={(page) => router.get(route('admin.invoices.index', { ...filters, page }), {}, { preserveState: true })}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
