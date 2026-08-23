import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Textarea,
    Chip,
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Select,
    SelectItem,
} from "@heroui/react";

// ── Icons ──────────────────────────────────────────────────────────────────
const ArrowLeftIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const PdfIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const SendIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const TrashIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} />
        <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} />
    </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-start py-2.5 border-b border-default-100 last:border-0">
            <span className="text-sm text-default-500">{label}</span>
            <span className="text-sm font-medium text-default-800 text-right max-w-[60%]">{value ?? '—'}</span>
        </div>
    );
}

// ── Amount Row ────────────────────────────────────────────────────────────────
function AmountRow({ label, value, isDeduction, isTotal, isMuted }) {
    return (
        <div className={`flex justify-between items-center py-2 ${isTotal ? 'pt-3 mt-1 border-t-2 border-default-200' : ''}`}>
            <span className={`text-sm ${isTotal ? 'font-bold text-default-800' : isMuted ? 'text-default-400' : 'text-default-600'}`}>
                {label}
            </span>
            <span className={`text-sm font-semibold ${
                isTotal ? 'text-lg font-bold text-default-900' :
                isDeduction ? 'text-success-600' :
                isMuted ? 'text-default-400' : 'text-default-700'
            }`}>
                {isDeduction && value !== 'RM 0.00' ? `−${value}` : value}
            </span>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Show({ invoice, pendingAdjustments = [] }) {
    const { auth } = usePage().props;

    const appliedAdjustments = invoice.adjustments ?? [];

    const { data, setData, put, processing, errors, wasSuccessful } = useForm({
        finance_remarks: invoice.finance_remarks ?? '',
        adjustments: appliedAdjustments.map((adj) => ({
            id: adj.id,
            type: adj.type,
            amount: Number(adj.amount),
            reason: adj.reason ?? '',
        })),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.invoices.update', invoice.id));
    };

    const handleSend = () => {
        if (confirm('Send this invoice to the parent? It will move to Pending status.')) {
            router.post(route('admin.invoices.send', invoice.id));
        }
    };

    const handleAddAdjustment = () => {
        setData('adjustments', [
            ...data.adjustments,
            { id: null, type: 'credit', amount: '', reason: '' },
        ]);
    };

    const handleUpdateAdjustment = (index, key, value) => {
        const next = data.adjustments.map((adj, i) => (i === index ? { ...adj, [key]: value } : adj));
        setData('adjustments', next);
    };

    const handleRemoveAdjustment = (index) => {
        setData('adjustments', data.adjustments.filter((_, i) => i !== index));
    };

    const isDraft = invoice.status === 'Draft';

    const netAdjustment = data.adjustments.reduce(
        (carry, adj) => carry + (Number(adj.amount) || 0) * (adj.type === 'charge' ? 1 : -1),
        0
    );
    const adjustedTotal = Math.max(
        0,
        Number(invoice.base_amount) +
        Number(invoice.tax_amount) -
        Number(invoice.recurring_discount_val) +
        netAdjustment
    );

    const enrolledClasses = invoice.student?.classes ?? [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.invoices.index')}
                            className="text-default-400 hover:text-default-600 transition-colors"
                            id="back-to-invoices"
                        >
                            <ArrowLeftIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold leading-tight text-gray-800">
                                    INV-{String(invoice.id).padStart(4, '0')}
                                </h2>
                                <Chip
                                    color={statusColorMap[invoice.status] ?? 'default'}
                                    size="sm"
                                    variant="flat"
                                    className="capitalize"
                                >
                                    {invoice.status}
                                </Chip>
                                {invoice.notification_sent && (
                                    <Chip color="primary" size="sm" variant="bordered">
                                        Sent to parent
                                    </Chip>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {formatMonth(invoice.month_year)} · {invoice.student?.name}
                            </p>
                        </div>
                    </div>
                    <a
                        href={route('admin.invoices.pdf', invoice.id)}
                        target="_blank"
                        rel="noreferrer"
                        id="download-invoice-pdf"
                    >
                        <Button
                            color="secondary"
                            variant="flat"
                            className="font-semibold"
                            startContent={<PdfIcon />}
                        >
                            Download PDF
                        </Button>
                    </a>
                </div>
            }
        >
            <Head title={`Invoice INV-${String(invoice.id).padStart(4, '0')}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT COLUMN (spans 2) ───────────────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Student & Invoice Info */}
                    <Card shadow="none" className="border border-default-200">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <p className="font-semibold text-default-700">Invoice Details</p>
                        </CardHeader>
                        <CardBody className="px-5 pt-0 pb-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                <div>
                                    <p className="text-xs text-default-400 uppercase tracking-wide font-medium mb-2">Student</p>
                                    <InfoRow label="Name" value={invoice.student?.name} />
                                    <InfoRow label="Parent" value={invoice.student?.parent?.name} />
                                    <InfoRow label="Parent Email" value={invoice.student?.parent?.email} />
                                </div>
                                <div>
                                    <p className="text-xs text-default-400 uppercase tracking-wide font-medium mb-2">Invoice</p>
                                    <InfoRow label="Period" value={formatMonth(invoice.month_year)} />
                                    <InfoRow label="Due Date" value={formatDate(invoice.due_date)} />
                                    <InfoRow label="Generated" value={formatDate(invoice.created_at)} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Enrolled Classes */}
                    {enrolledClasses.length > 0 && (
                        <Card shadow="none" className="border border-default-200">
                            <CardHeader className="px-5 pt-5 pb-3">
                                <p className="font-semibold text-default-700">Enrolled Classes</p>
                            </CardHeader>
                            <CardBody className="px-0 pt-0 pb-0">
                                <Table
                                    aria-label="Enrolled classes"
                                    shadow="none"
                                    classNames={{
                                        wrapper: "shadow-none rounded-none",
                                        th: "bg-default-50 text-default-500 text-xs uppercase font-semibold tracking-wide",
                                    }}
                                    selectionMode="none"
                                >
                                    <TableHeader>
                                        <TableColumn>CLASS</TableColumn>
                                        <TableColumn>PACKAGE</TableColumn>
                                        <TableColumn>DAY / TIME</TableColumn>
                                        <TableColumn align="end">FEE</TableColumn>
                                    </TableHeader>
                                    <TableBody items={enrolledClasses}>
                                        {(cls) => (
                                            <TableRow key={cls.id}>
                                                <TableCell>
                                                    <p className="font-medium text-sm">{cls.name}</p>
                                                    <p className="text-xs text-default-400">{cls.uid}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm">{cls.package?.title ?? '—'}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm">{cls.day}</p>
                                                    <p className="text-xs text-default-400">
                                                        {cls.start_time} – {cls.end_time}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm font-semibold text-right">
                                                        {formatRM(cls.package?.monthly_fee)}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    )}

                    {/* Payments Received */}
                    {invoice.payments?.length > 0 && (
                        <Card shadow="none" className="border border-default-200">
                            <CardHeader className="px-5 pt-5 pb-3">
                                <p className="font-semibold text-default-700">Payments Received</p>
                            </CardHeader>
                            <CardBody className="px-0 pt-0 pb-0">
                                <Table
                                    aria-label="Payments received"
                                    shadow="none"
                                    classNames={{
                                        wrapper: "shadow-none rounded-none",
                                        th: "bg-default-50 text-default-500 text-xs uppercase font-semibold tracking-wide",
                                    }}
                                    selectionMode="none"
                                >
                                    <TableHeader>
                                        <TableColumn>DATE</TableColumn>
                                        <TableColumn>METHOD</TableColumn>
                                        <TableColumn>REFERENCE</TableColumn>
                                        <TableColumn align="end">AMOUNT</TableColumn>
                                    </TableHeader>
                                    <TableBody items={invoice.payments}>
                                        {(payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{formatDate(payment.payment_date ?? payment.created_at)}</TableCell>
                                                <TableCell>{payment.payment_method ?? '—'}</TableCell>
                                                <TableCell>
                                                    <p className="text-xs font-mono text-default-500">{payment.transaction_id ?? '—'}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="font-semibold text-success-600 text-right">
                                                        {formatRM(payment.amount)}
                                                    </p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* ── RIGHT COLUMN ────────────────────────────────────── */}
                <div className="flex flex-col gap-6">

                    {/* Amount Breakdown */}
                    <Card shadow="none" className="border border-default-200">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <p className="font-semibold text-default-700">Amount Breakdown</p>
                        </CardHeader>
                        <CardBody className="px-5 pt-0 pb-5">
                            <AmountRow label="Base Amount" value={formatRM(invoice.base_amount)} />
                            {Number(invoice.tax_amount) > 0 && (
                                <AmountRow label="Tax" value={formatRM(invoice.tax_amount)} />
                            )}
                            {Number(invoice.recurring_discount_val) > 0 && (
                                <AmountRow
                                    label="Recurring Discount"
                                    value={formatRM(invoice.recurring_discount_val)}
                                    isDeduction
                                />
                            )}
                            {data.adjustments
                                .filter((adj) => Number(adj.amount) > 0)
                                .map((adj, i) => (
                                    <AmountRow
                                        key={adj.id ?? `new-${i}`}
                                        label={adj.type === 'charge' ? `Charge: ${adj.reason || 'Additional fee'}` : `Credit: ${adj.reason || 'Refund'}`}
                                        value={formatRM(adj.amount)}
                                        isDeduction={adj.type === 'credit'}
                                    />
                                ))}
                            <AmountRow
                                label="Total"
                                value={formatRM(isDraft ? adjustedTotal : invoice.total_amount)}
                                isTotal
                            />
                            {invoice.finance_remarks && (
                                <div className="mt-4 p-3 bg-default-50 rounded-lg">
                                    <p className="text-xs text-default-400 font-medium uppercase tracking-wide mb-1">Remarks</p>
                                    <p className="text-sm text-default-600">{invoice.finance_remarks}</p>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Manual Adjustment — only for Draft invoices */}
                    {isDraft && (
                        <Card shadow="none" className="border border-warning-200 bg-warning-50/30">
                            <CardHeader className="px-5 pt-5 pb-3">
                                <p className="font-semibold text-default-700">Manual Adjustments</p>
                            </CardHeader>
                            <CardBody className="px-5 pt-0 pb-5">
                                {wasSuccessful && (
                                    <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                                        <p className="text-sm text-success-700 font-medium">✓ Adjustment saved</p>
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <p className="text-sm text-default-500">
                                        Add a <strong>Credit</strong> to reduce the total (e.g. refund, missed session) or a <strong>Charge</strong> to add an extra fee.
                                    </p>

                                    {data.adjustments.map((adj, index) => (
                                        <div key={adj.id ?? `new-${index}`} className="p-3 border border-default-200 rounded-lg space-y-3 bg-content1">
                                            <div className="flex items-end justify-between gap-2">
                                                <div className="flex gap-2 flex-1">
                                                    <Select
                                                        aria-label="Adjustment type"
                                                        size="sm"
                                                        selectedKeys={[adj.type]}
                                                        onSelectionChange={(keys) =>
                                                            handleUpdateAdjustment(index, 'type', Array.from(keys)[0])
                                                        }
                                                        className="w-32"
                                                    >
                                                        <SelectItem key="credit" value="credit">Credit</SelectItem>
                                                        <SelectItem key="charge" value="charge">Charge</SelectItem>
                                                    </Select>
                                                    <Input
                                                        aria-label="Adjustment amount"
                                                        type="number"
                                                        size="sm"
                                                        min="0"
                                                        step="0.01"
                                                        value={String(adj.amount ?? '')}
                                                        onValueChange={(val) => handleUpdateAdjustment(index, 'amount', val)}
                                                        placeholder="0.00"
                                                        startContent={<span className="text-default-400 text-sm pointer-events-none">RM</span>}
                                                    />
                                                </div>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    color="danger"
                                                    aria-label="Remove adjustment"
                                                    onPress={() => handleRemoveAdjustment(index)}
                                                >
                                                    <TrashIcon />
                                                </Button>
                                            </div>
                                            <Input
                                                aria-label="Adjustment reason"
                                                size="sm"
                                                value={adj.reason ?? ''}
                                                onValueChange={(val) => handleUpdateAdjustment(index, 'reason', val)}
                                                placeholder="Reason e.g. refund for cancelled class"
                                            />
                                        </div>
                                    ))}

                                    <Button
                                        id="add-adjustment-btn"
                                        type="button"
                                        color="default"
                                        variant="flat"
                                        className="w-full"
                                        onPress={handleAddAdjustment}
                                    >
                                        + Add Adjustment
                                    </Button>

                                    <Textarea
                                        id="finance-remarks-input"
                                        label="Finance Remarks"
                                        placeholder="General notes for the invoice..."
                                        value={data.finance_remarks}
                                        onValueChange={(val) => setData('finance_remarks', val)}
                                        errorMessage={errors.finance_remarks}
                                        isInvalid={!!errors.finance_remarks}
                                        minRows={2}
                                    />

                                    <Button
                                        id="save-adjustment-btn"
                                        type="submit"
                                        color="primary"
                                        variant="flat"
                                        isLoading={processing}
                                        className="w-full font-semibold"
                                    >
                                        Save Adjustment
                                    </Button>
                                </form>
                            </CardBody>
                        </Card>
                    )}

                    {/* Carry-forward summary (read-only — managed on the student profile) */}
                    <Card shadow="none" className="border border-primary-200 bg-primary-50/20">
                        <CardHeader className="px-5 pt-5 pb-3">
                            <p className="font-semibold text-default-700">Carry-Forward for Next Month</p>
                        </CardHeader>
                        <CardBody className="px-5 pt-0 pb-5 space-y-4">
                            <p className="text-sm text-default-500">
                                Pending refunds or charges recorded on the student profile will be
                                auto-applied to {invoice.student?.name}'s next month's invoice.
                            </p>

                            {pendingAdjustments.length > 0 ? (
                                <div className="p-3 bg-default-50 rounded-lg space-y-2">
                                    <p className="text-xs text-default-400 font-medium uppercase tracking-wide">Pending (applies next month)</p>
                                    {pendingAdjustments.map((adj) => (
                                        <div key={adj.id} className="flex items-center justify-between gap-2">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    <span className={adj.type === 'credit' ? 'text-success-600' : 'text-danger-600'}>
                                                        {adj.type === 'credit' ? '−' : '+'}RM{Number(adj.amount).toFixed(2)}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-default-500">{adj.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-default-400">No pending carry-forward adjustments.</p>
                            )}

                            <Button
                                as={Link}
                                href={route('admin.students.show', invoice.student?.id)}
                                color="primary"
                                variant="flat"
                                className="w-full font-semibold"
                                isDisabled={!invoice.student?.id}
                            >
                                Manage on Student Profile
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Send Invoice Action */}
                    <Card shadow="none" className={`border ${isDraft ? 'border-success-200' : 'border-default-200'}`}>
                        <CardHeader className="px-5 pt-5 pb-3">
                            <p className="font-semibold text-default-700">
                                {isDraft ? 'Finalize & Send' : 'Invoice Status'}
                            </p>
                        </CardHeader>
                        <CardBody className="px-5 pt-0 pb-5">
                            {isDraft ? (
                                <>
                                    <p className="text-sm text-default-500 mb-4">
                                        Once sent, the invoice moves to <strong>Pending</strong> and an email notification
                                        is dispatched to the parent. This cannot be undone.
                                    </p>
                                    <Button
                                        id="send-invoice-btn"
                                        color="success"
                                        className="w-full font-semibold text-white"
                                        startContent={<SendIcon />}
                                        onPress={handleSend}
                                    >
                                        Send Invoice to Parent
                                    </Button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-default-500">Current status</span>
                                        <Chip
                                            color={statusColorMap[invoice.status] ?? 'default'}
                                            size="sm"
                                            variant="flat"
                                        >
                                            {invoice.status}
                                        </Chip>
                                    </div>
                                    {invoice.notification_sent && (
                                        <p className="text-xs text-default-400">
                                            ✓ Notification was sent to the parent.
                                        </p>
                                    )}
                                    {invoice.status === 'Pending' && (
                                        <p className="text-xs text-warning-600">
                                            Awaiting payment from parent.
                                        </p>
                                    )}
                                    {invoice.status === 'Paid' && (
                                        <p className="text-xs text-success-600 font-medium">
                                            Payment received. Invoice closed.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
