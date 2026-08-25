import { router, useForm } from '@inertiajs/react';
import {
    Button,
    Chip,
    Input,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react';

const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

function PendingRow({ student, adjustment }) {
    const { data, setData, put, processing, errors } = useForm({
        type: adjustment.type,
        amount: String(adjustment.amount),
        reason: adjustment.reason ?? '',
    });

    const save = (e) => {
        e.preventDefault();
        put(route('admin.students.adjustments.update', [student.id, adjustment.id]), {
            preserveScroll: true,
        });
    };

    const remove = () => {
        if (confirm('Remove this pending adjustment? It will not be applied to the next invoice.')) {
            router.delete(route('admin.students.adjustments.destroy', [student.id, adjustment.id]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <form onSubmit={save} className="p-3 border border-default-200 rounded-lg space-y-2 bg-content1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Select
                    aria-label="Adjustment type"
                    size="sm"
                    selectedKeys={[data.type]}
                    onSelectionChange={(keys) => setData('type', Array.from(keys)[0])}
                    className="w-full"
                >
                    <SelectItem key="credit" value="credit">Credit (refund)</SelectItem>
                    <SelectItem key="charge" value="charge">Charge (extra)</SelectItem>
                </Select>
                <Input
                    aria-label="Adjustment amount"
                    type="number"
                    size="sm"
                    min="0"
                    step="0.01"
                    value={data.amount}
                    onValueChange={(val) => setData('amount', val)}
                    errorMessage={errors.amount}
                    isInvalid={!!errors.amount}
                    startContent={<span className="text-default-400 text-sm pointer-events-none">RM</span>}
                />
            </div>
            <Input
                aria-label="Adjustment reason"
                size="sm"
                value={data.reason}
                onValueChange={(val) => setData('reason', val)}
                errorMessage={errors.reason}
                isInvalid={!!errors.reason}
                placeholder="Reason e.g. refund for cancelled class"
            />
            <div className="flex justify-end gap-2">
                <Button size="sm" variant="light" color="danger" type="button" onPress={remove}>
                    Remove
                </Button>
                <Button size="sm" color="primary" variant="flat" type="submit" isLoading={processing}>
                    Save
                </Button>
            </div>
        </form>
    );
}

export default function CarryForwardAdjustments({ student, pendingAdjustments = [], appliedAdjustments = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'credit',
        amount: '',
        reason: '',
    });

    const create = (e) => {
        e.preventDefault();
        post(route('admin.students.adjustments.store', student.id), {
            preserveScroll: true,
            onSuccess: () => reset('amount', 'reason'),
        });
    };

    return (
        <div className="space-y-4">
            {/* Record new carry-forward */}
            <form onSubmit={create} className="p-4 border border-primary-200 rounded-lg bg-primary-50/20 space-y-3">
                <p className="text-sm text-default-600">
                    Record a <strong>refund credit</strong> or <strong>additional charge</strong>. It will be
                    auto-applied to {student.name}&rsquo;s next generated invoice.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select
                        label="Type"
                        selectedKeys={[data.type]}
                        onSelectionChange={(keys) => setData('type', Array.from(keys)[0])}
                        className="w-full"
                    >
                        <SelectItem key="credit" value="credit">Credit (refund)</SelectItem>
                        <SelectItem key="charge" value="charge">Charge (extra)</SelectItem>
                    </Select>
                    <Input
                        label="Amount (RM)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.amount}
                        onValueChange={(val) => setData('amount', val)}
                        errorMessage={errors.amount}
                        isInvalid={!!errors.amount}
                    />
                </div>
                <Input
                    label="Reason"
                    value={data.reason}
                    onValueChange={(val) => setData('reason', val)}
                    errorMessage={errors.reason}
                    isInvalid={!!errors.reason}
                    placeholder="Reason e.g. missed session on Dec 5"
                />
                <Button
                    type="submit"
                    color="primary"
                    isLoading={processing}
                    className="w-full font-semibold"
                >
                    Record for Next Invoice
                </Button>
            </form>

            {/* Pending list (editable) */}
            {pendingAdjustments.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-default-400 font-medium uppercase tracking-wide">
                        Pending (applies to next invoice)
                    </p>
                    {pendingAdjustments.map((adj) => (
                        <PendingRow key={adj.id} student={student} adjustment={adj} />
                    ))}
                </div>
            )}

            {/* Applied history */}
            {appliedAdjustments.length > 0 && (
                <div>
                    <p className="text-xs text-default-400 font-medium uppercase tracking-wide mb-2">
                        Applied History
                    </p>
                    <Table aria-label="Applied adjustments history" shadow="none">
                        <TableHeader>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>AMOUNT</TableColumn>
                            <TableColumn>REASON</TableColumn>
                            <TableColumn>INVOICE</TableColumn>
                        </TableHeader>
                        <TableBody items={appliedAdjustments}>
                            {(adj) => (
                                <TableRow key={adj.id}>
                                    <TableCell>
                                        <Chip size="sm" variant="flat" color={adj.type === 'credit' ? 'success' : 'danger'}>
                                            {adj.type === 'credit' ? 'Credit' : 'Charge'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell className={adj.type === 'credit' ? 'text-success-600' : 'text-danger-600'}>
                                        {adj.type === 'credit' ? '−' : '+'}{formatRM(adj.amount)}
                                    </TableCell>
                                    <TableCell>{adj.reason}</TableCell>
                                    <TableCell>
                                        {adj.invoice
                                            ? `${adj.invoice.invoice_number} · ${adj.invoice.month_year}`
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
