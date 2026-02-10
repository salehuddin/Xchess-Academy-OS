import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Chip
} from "@heroui/react";
import { useCallback } from 'react';

export default function Index({ payrolls }) {
    const { auth } = usePage().props;

    const statusColorMap = {
        Paid: "success",
        Processed: "primary",
        Pending: "warning",
    };

    const renderCell = useCallback((payroll, columnKey) => {
        const cellValue = payroll[columnKey];
        switch (columnKey) {
            case "month_year":
                return cellValue;
            case "total_sessions":
                return cellValue;
            case "base_rate":
                return `$${cellValue}`;
            case "total_amount":
                return `$${cellValue}`;
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[cellValue] || "default"} size="sm" variant="flat">
                        {cellValue}
                    </Chip>
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
                        <p className="text-sm text-gray-500">View your payment history</p>
                    </div>
                </div>
            }
        >
            <Head title="My Payrolls" />

            <div>
                <Table
                    aria-label="My Payrolls table"
                    isHeaderSticky
                    classNames={{
                        wrapper: "max-h-[382px] bg-transparent shadow-none",
                    }}
                    selectionMode="none"
                >
                    <TableHeader>
                        <TableColumn key="month_year">MONTH</TableColumn>
                        <TableColumn key="total_sessions">SESSIONS</TableColumn>
                        <TableColumn key="base_rate">RATE</TableColumn>
                        <TableColumn key="total_amount">TOTAL</TableColumn>
                        <TableColumn key="status">STATUS</TableColumn>
                    </TableHeader>
                    <TableBody items={payrolls} emptyContent="No payroll records found.">
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
