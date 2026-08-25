import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import PayrollDetailModal from '@/Components/PayrollDetailModal';
import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Chip,
    Tooltip
} from "@heroui/react";
import { useCallback, useState } from 'react';

const statusColorMap = {
    Paid: "success",
    Processed: "primary",
    Draft: "warning",
};

const EyeIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M15.58 12c0 1.98-1.6 3.58-3.58 3.58S8.42 13.98 8.42 12s1.6-3.58 3.58-3.58 3.58 1.6 3.58 3.58Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M12 20.27c3.53 0 6.82-2.08 9.11-5.68.9-1.41.9-3.78 0-5.19-2.29-3.6-5.58-5.68-9.11-5.68-3.53 0-6.82 2.08-9.11 5.68-.9 1.41-.9 3.78 0 5.19 2.29 3.6 5.58 5.68 9.11 5.68Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    </svg>
);

const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

const formatMonth = (yearMonth) => {
    if (!yearMonth) return '—';
    const [year, month] = yearMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'long' });
};

export default function Index({ payrolls }) {
    const { auth } = usePage().props;
    const [detailPayroll, setDetailPayroll] = useState(null);

    const renderCell = useCallback((payroll, columnKey) => {
        const cellValue = payroll[columnKey];
        switch (columnKey) {
            case "month_year":
                return <p className="font-medium text-sm">{formatMonth(cellValue)}</p>;
            case "total_sessions":
                return (
                    <p className="font-semibold text-sm">
                        {cellValue} <span className="text-xs text-default-400 font-normal">sessions</span>
                    </p>
                );
            case "base_rate":
                return <p className="text-sm text-default-600">{formatRM(cellValue)}</p>;
            case "total_amount":
                return <p className="font-bold text-sm text-success-600">{formatRM(cellValue)}</p>;
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[cellValue] || "default"} size="sm" variant="flat">
                        {cellValue}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Tooltip content="View Details">
                            <button
                                id={`view-payroll-${payroll.id}`}
                                className="text-default-400 hover:text-default-600 transition-colors"
                                onClick={() => setDetailPayroll(payroll)}
                                aria-label="View payroll details"
                            >
                                <EyeIcon />
                            </button>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">My Payrolls</h2>
                        <p className="text-sm text-gray-500">View your monthly payment history</p>
                    </div>
                </div>
            }
        >
            <Head title="My Payrolls" />

            <Card shadow="none" className="border border-default-200">
                <CardBody className="p-0">
                    <Table
                        aria-label="My Payrolls table"
                        isHeaderSticky
                        classNames={{
                            wrapper: "bg-transparent shadow-none rounded-none",
                            th: "bg-default-50 text-default-600 font-semibold text-xs uppercase tracking-wide",
                            td: "py-3.5",
                        }}
                        selectionMode="none"
                    >
                        <TableHeader>
                            <TableColumn key="month_year">MONTH</TableColumn>
                            <TableColumn key="total_sessions">SESSIONS</TableColumn>
                            <TableColumn key="base_rate">AVG RATE</TableColumn>
                            <TableColumn key="total_amount">TOTAL</TableColumn>
                            <TableColumn key="status">STATUS</TableColumn>
                            <TableColumn key="actions">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody items={payrolls} emptyContent="No payroll records found yet.">
                            {(item) => (
                                <TableRow key={item.id} className="hover:bg-default-50 transition-colors">
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            <PayrollDetailModal
                isOpen={!!detailPayroll}
                onClose={() => setDetailPayroll(null)}
                url={detailPayroll ? route('coach.payrolls.show', detailPayroll.id) : null}
            />
        </AuthenticatedLayout>
    );
}
