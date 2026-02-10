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
    CardBody
} from "@heroui/react";
import { useCallback } from "react";

// Icons
const EyeIcon = (props) => (
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
            d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const columns = [
    { name: "ID", uid: "id" },
    { name: "STUDENT", uid: "student" },
    { name: "MONTH", uid: "month" },
    { name: "AMOUNT", uid: "amount" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
    Paid: "success",
    Pending: "warning",
    Partial: "primary",
    Overdue: "danger",
};

export default function Index({ auth, invoices }) {
    const renderCell = useCallback((invoice, columnKey) => {
        const cellValue = invoice[columnKey];

        switch (columnKey) {
            case "id":
                return <span className="font-bold">#{cellValue}</span>;
            case "student":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm capitalize">{invoice.student?.name}</p>
                        <p className="text-bold text-sm text-default-400">{invoice.student?.email}</p>
                    </div>
                );
            case "month":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">{invoice.month_year}</p>
                    </div>
                );
            case "amount":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">${invoice.total_amount}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[invoice.status] || "default"} size="sm" variant="flat">
                        {invoice.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-center">
                        <Tooltip content="View Invoice">
                            <Link
                                href={route('admin.invoices.show', invoice.id)}
                                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors"
                            >
                                <EyeIcon />
                            </Link>
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
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Invoices</h2>
                        <p className="text-sm text-gray-500">Manage student invoices and payments</p>
                    </div>
                </div>
            }
        >
            <Head title="Invoices" />

            <div>
                <Table
                    aria-label="Invoices table"
                    isHeaderSticky
                    bottomContent={
                        invoices.links && invoices.last_page > 1 && (
                            <div className="flex w-full justify-center px-4 py-4 border-t border-gray-100">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={invoices.current_page}
                                    total={invoices.last_page}
                                    onChange={(page) => router.get(route('admin.invoices.index', { page }), {}, { preserveState: true })}
                                />
                            </div>
                        )
                    }
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "max-h-[382px] bg-transparent shadow-none",
                    }}
                    selectionMode="none"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={invoices.data} emptyContent={"No invoices found."}>
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
