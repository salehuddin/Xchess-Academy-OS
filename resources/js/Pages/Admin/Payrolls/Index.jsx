import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    CardBody
} from "@heroui/react";
import { useCallback } from "react";

// Icons
const CheckIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 20 20"
        width="1em"
        {...props}
    >
        <path
            d="M16.6666 5.83331L7.49992 15L3.33325 10.8333"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const DollarIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 20 20"
        width="1em"
        {...props}
    >
        <path
            d="M10 2.5V17.5M5.83333 5.83333H12.5C13.8807 5.83333 15 6.95262 15 8.33333C15 9.71404 13.8807 10.8333 12.5 10.8333H7.5C6.11929 10.8333 5 11.9526 5 13.3333C5 14.714 6.11929 15.8333 7.5 15.8333H14.1667"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const columns = [
    { name: "ID", uid: "id" },
    { name: "COACH", uid: "coach" },
    { name: "MONTH", uid: "month" },
    { name: "SESSIONS", uid: "sessions" },
    { name: "RATE", uid: "rate" },
    { name: "TOTAL", uid: "total" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
    Paid: "success",
    Processed: "primary",
    Draft: "warning",
};

export default function Index({ auth, payrolls }) {
    const approve = (id) => {
        if (confirm('Are you sure you want to mark this payroll as processed?')) {
            router.put(route('admin.payrolls.approve', id));
        }
    };

    const markPaid = (id) => {
        if (confirm('Are you sure you want to mark this payroll as paid?')) {
            router.put(route('admin.payrolls.paid', id));
        }
    };

    const renderCell = useCallback((payroll, columnKey) => {
        const cellValue = payroll[columnKey];

        switch (columnKey) {
            case "id":
                return <span className="font-bold">#{cellValue}</span>;
            case "coach":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm capitalize">{payroll.coach?.name}</p>
                        <p className="text-bold text-sm text-default-400">{payroll.coach?.email}</p>
                    </div>
                );
            case "month":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">{payroll.month_year}</p>
                    </div>
                );
            case "sessions":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">{payroll.total_sessions}</p>
                    </div>
                );
            case "rate":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">${payroll.base_rate}</p>
                    </div>
                );
            case "total":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm text-success">${payroll.total_amount}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[payroll.status] || "default"} size="sm" variant="flat">
                        {payroll.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-center">
                        {payroll.status === 'Draft' && (
                            <Tooltip content="Approve Payroll">
                                <span className="text-lg text-primary cursor-pointer active:opacity-50 hover:opacity-75 transition-opacity" onClick={() => approve(payroll.id)}>
                                    <CheckIcon />
                                </span>
                            </Tooltip>
                        )}
                        {payroll.status === 'Processed' && (
                            <Tooltip content="Mark as Paid">
                                <span className="text-lg text-success cursor-pointer active:opacity-50 hover:opacity-75 transition-opacity" onClick={() => markPaid(payroll.id)}>
                                    <DollarIcon />
                                </span>
                            </Tooltip>
                        )}
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
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Coach Payrolls</h2>
                        <p className="text-sm text-gray-500">Manage coach salaries and payments</p>
                    </div>
                </div>
            }
        >
            <Head title="Coach Payrolls" />

            <Card className="w-full shadow-sm border border-gray-100">
                <CardBody className="p-0">
                    <Table
                        aria-label="Payrolls table"
                        shadow="none"
                        classNames={{
                            wrapper: "min-h-[400px] shadow-none p-0",
                            th: "bg-gray-50 text-gray-600 font-semibold px-6",
                            td: "px-6 py-4"
                        }}
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={payrolls} emptyContent={"No payrolls found."}>
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
