import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tooltip
} from "@heroui/react";
import { useState, useCallback } from 'react';
import StudentDetailsModal from '../Students/StudentDetailsModal';

// Icons
const PlusIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M6 12H18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M12 18V6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const DeleteIcon = (props) => (
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
            d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15833 4.56665C7.5 4.56665 5.84167 4.64998 4.18333 4.81665L2.5 4.98332"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M8.58333 3.97498L8.79167 2.73331C8.94167 1.83331 9.05833 1.16665 10.6583 1.16665H13.3417C14.9333 1.16665 15.0583 1.88331 15.2083 2.73331L15.4167 3.97498"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M15.7083 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M8.60834 13.75H11.3833"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M7.91669 10.4167H12.0834"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const columns = [
    { name: "DATE", uid: "date" },
    { name: "INVOICE", uid: "invoice" },
    { name: "STUDENT", uid: "student" },
    { name: "AMOUNT", uid: "amount" },
    { name: "METHOD", uid: "method" },
    { name: "NOTES", uid: "notes" },
    { name: "ACTIONS", uid: "actions" },
];

export default function Index({ auth, payments = [], invoices = [] }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { data, setData, post, processing, errors, reset } = useForm({
        invoice_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash',
        transaction_id: '',
        notes: '',
    });

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Student Details Modal State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsStudentModalOpen(true);
    };

    const pages = Math.ceil(payments.length / rowsPerPage) || 1;

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return payments.slice(start, end);
    }, [page, payments, rowsPerPage]);

    const handleClose = () => {
        reset();
        onOpenChange(false);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.payments.store'), {
            onSuccess: () => handleClose(),
        });
    };

    const handleDelete = (payment) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(route('admin.payments.destroy', payment.id));
        }
    };

    const handleInvoiceSelection = (invoiceId) => {
        const invoice = invoices.find(inv => String(inv.id) === String(invoiceId));
        if (invoice) {
            setData((prev) => ({
                ...prev,
                invoice_id: invoiceId,
                amount: invoice.amount, // Pre-fill amount with invoice total
            }));
        }
    };

    const renderCell = useCallback((payment, columnKey) => {
        const cellValue = payment[columnKey];

        switch (columnKey) {
            case "date":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">{payment.payment_date}</p>
                    </div>
                );
            case "invoice":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">#{payment.invoice?.invoice_number}</p>
                    </div>
                );
            case "student":
                return (
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleStudentClick(payment.invoice?.student)}
                        title="View student details"
                    >
                        <p className="font-bold text-sm capitalize">{payment.invoice?.student?.name}</p>
                    </div>
                );
            case "amount":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm">${payment.amount}</p>
                    </div>
                );
            case "method":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm capitalize">{payment.payment_method}</p>
                        {payment.transaction_id && (
                            <p className="text-tiny text-default-400">{payment.transaction_id}</p>
                        )}
                    </div>
                );
            case "notes":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-sm truncate max-w-xs">{payment.notes || "-"}</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-center">
                        <Tooltip color="danger" content="Delete payment">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50 hover:opacity-75 transition-opacity" onClick={() => handleDelete(payment)}>
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [handleStudentClick]);

    const topContent = (
        <div className="flex justify-between items-center pb-2">
            <span className="text-default-400 text-small">Total {payments.length} payments</span>
            <label className="flex items-center text-default-400 text-small">
                Rows per page:
                <select
                    className="bg-transparent outline-none text-default-400 text-small ml-1"
                    onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(1);
                    }}
                    value={rowsPerPage}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </label>
        </div>
    );

    const bottomContent = pages > 1 ? (
        <div className="flex w-full justify-center px-4 py-4 border-t border-gray-100">
            <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(p) => setPage(p)}
            />
        </div>
    ) : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Payments</h2>
                        <p className="text-sm text-gray-500">Record and track payments</p>
                    </div>
                    <Button color="primary" onPress={onOpen} startContent={<PlusIcon />}>
                        Record Payment
                    </Button>
                </div>
            }
        >
            <Head title="Payments" />

            <div>
                <Table
                    aria-label="Payments table"
                    isHeaderSticky
                    topContent={topContent}
                    topContentPlacement="outside"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "bg-transparent shadow-none",
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
                    <TableBody items={items} emptyContent={"No payments recorded yet."}>
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose} backdrop="blur">
                <ModalContent className="bg-white">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Record Payment</ModalHeader>
                            <ModalBody>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <Select
                                            label="Invoice"
                                            selectedKeys={data.invoice_id ? [String(data.invoice_id)] : []}
                                            onChange={(e) => handleInvoiceSelection(e.target.value)}
                                            errorMessage={errors.invoice_id}
                                            isInvalid={!!errors.invoice_id}
                                            required
                                        >
                                            {invoices.map((invoice) => (
                                                <SelectItem key={String(invoice.id)} textValue={`#${invoice.invoice_number} - ${invoice.student?.name} ($${invoice.amount})`}>
                                                    #{invoice.invoice_number} - {invoice.student?.name} (${invoice.amount})
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                    <div>
                                        <Input
                                            type="number"
                                            label="Amount"
                                            value={data.amount}
                                            onValueChange={(val) => setData('amount', val)}
                                            errorMessage={errors.amount}
                                            isInvalid={!!errors.amount}
                                            startContent={
                                                <div className="pointer-events-none flex items-center">
                                                    <span className="text-default-400 text-small">$</span>
                                                </div>
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="date"
                                            label="Payment Date"
                                            value={data.payment_date}
                                            onValueChange={(val) => setData('payment_date', val)}
                                            errorMessage={errors.payment_date}
                                            isInvalid={!!errors.payment_date}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Select
                                            label="Payment Method"
                                            selectedKeys={data.payment_method ? [data.payment_method] : []}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            errorMessage={errors.payment_method}
                                            isInvalid={!!errors.payment_method}
                                            required
                                        >
                                            <SelectItem key="Cash">Cash</SelectItem>
                                            <SelectItem key="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem key="Credit Card">Credit Card</SelectItem>
                                            <SelectItem key="Cheque">Cheque</SelectItem>
                                        </Select>
                                    </div>
                                    <div>
                                        <Input
                                            label="Transaction ID (Optional)"
                                            value={data.transaction_id}
                                            onValueChange={(val) => setData('transaction_id', val)}
                                            errorMessage={errors.transaction_id}
                                            isInvalid={!!errors.transaction_id}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Notes (Optional)"
                                            value={data.notes}
                                            onValueChange={(val) => setData('notes', val)}
                                            errorMessage={errors.notes}
                                            isInvalid={!!errors.notes}
                                        />
                                    </div>
                                    <div className="hidden">
                                        <button type="submit"></button>
                                    </div>
                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleCreate} isLoading={processing}>
                                    Record Payment
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <StudentDetailsModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                student={selectedStudent}
            />
        </AuthenticatedLayout>
    );
}
