import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Chip,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
} from "@heroui/react";

const StatusChip = ({ status }) => {
    const color =
        status === 'Paid' ? 'success' :
        status === 'Pending' ? 'warning' :
        status === 'Overdue' ? 'danger' :
        'default';

    return (
        <Chip size="sm" color={color} variant="flat">
            {status}
        </Chip>
    );
};

export default function Invoice({ token, parent, invoice }) {
    const { flash = {} } = usePage().props;
    const { post, processing } = useForm();
    const backUrl = route('portal.parent', token);

    // Read payment query status
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const paymentStatus = urlParams?.get('payment');

    const handlePayNow = (e) => {
        e.preventDefault();
        post(route('portal.invoice.checkout', [token, invoice.id]));
    };

    return (
        <GuestLayout variant="page" title={`Invoice · ${parent.name}`}>
            <Head title={`Invoice ${invoice?.month_year ?? ''}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Link href={backUrl} className="text-primary hover:underline font-medium">
                        ← Back to Portal
                    </Link>
                    <StatusChip status={invoice.status} />
                </div>

                {/* Query Alerts */}
                {paymentStatus === 'success' && (
                    <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Payment Completed! </strong>
                        <span>Thank you! Your payment is being verified and reconciled automatically.</span>
                    </div>
                )}
                {paymentStatus === 'failed' && (
                    <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Payment Failed. </strong>
                        <span>The Chip checkout session could not be completed. Please try again or contact finance.</span>
                    </div>
                )}
                {flash.error && (
                    <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Notice: </strong>
                        <span>{flash.error}</span>
                    </div>
                )}

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <div className="text-lg font-bold text-foreground">
                                Invoice #{invoice.id} · {invoice.month_year}
                            </div>
                            <div className="text-sm text-default-500">
                                Student: {invoice.student?.name}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <a href={route('portal.invoice.pdf', [token, invoice.id])} target="_blank" rel="noreferrer">
                                <Button size="sm" variant="flat" color="default" className="font-bold">
                                    📄 PDF Invoice
                                </Button>
                            </a>
                            {invoice.status === 'Paid' && (
                                <a href={route('portal.invoice.receipt-pdf', [token, invoice.id])} target="_blank" rel="noreferrer">
                                    <Button size="sm" variant="flat" color="success" className="font-bold">
                                        🧾 Official Receipt PDF
                                    </Button>
                                </a>
                            )}
                            {invoice.status !== 'Paid' && (
                                <form onSubmit={handlePayNow}>
                                    <Button
                                        color="primary"
                                        size="md"
                                        type="submit"
                                        isLoading={processing}
                                        className="font-bold text-white shadow-sm"
                                    >
                                        Pay RM{invoice.total_amount} via Chip
                                    </Button>
                                </form>
                            )}
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="space-y-6">
                        <Table aria-label="Invoice breakdown" removeWrapper>
                            <TableHeader>
                                <TableColumn>ITEM</TableColumn>
                                <TableColumn align="right">AMOUNT (RM)</TableColumn>
                            </TableHeader>
                            <TableBody>
                                <TableRow key="base">
                                    <TableCell>Base Tuition Fee</TableCell>
                                    <TableCell className="text-right">RM{invoice.base_amount}</TableCell>
                                </TableRow>
                                <TableRow key="tax">
                                    <TableCell>Tax</TableCell>
                                    <TableCell className="text-right">RM{invoice.tax_amount}</TableCell>
                                </TableRow>
                                <TableRow key="discount">
                                    <TableCell>Recurring Student Discount</TableCell>
                                    <TableCell className="text-right text-success-600">-RM{invoice.recurring_discount_val}</TableCell>
                                </TableRow>
                                {invoice.adjustments?.filter((adj) => Number(adj.amount) > 0).map((adj) => (
                                    <TableRow key={`adj-${adj.id}`}>
                                        <TableCell>
                                            {adj.type === 'charge' ? 'Additional Charge' : 'Credit / Refund'}
                                            {adj.reason ? <span className="block text-xs text-default-400">{adj.reason}</span> : null}
                                        </TableCell>
                                        <TableCell className={`text-right ${adj.type === 'credit' ? 'text-success-600' : 'text-danger-600'}`}>
                                            {adj.type === 'credit' ? '-' : '+'}RM{Number(adj.amount).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow key="total">
                                    <TableCell>
                                        <span className="font-bold text-base">Total Payable</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="font-bold text-lg text-primary">RM{invoice.total_amount}</span>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Card className="bg-content2 shadow-none border border-divider">
                                <CardBody className="space-y-1">
                                    <div className="text-xs text-default-500 font-medium">Due Date</div>
                                    <div className="font-medium text-foreground">{invoice.due_date ?? '-'}</div>
                                </CardBody>
                            </Card>
                            <Card className="bg-content2 shadow-none border border-divider">
                                <CardBody className="space-y-1">
                                    <div className="text-xs text-default-500 font-medium">Remarks / Deductions Note</div>
                                    <div className="font-medium text-foreground">
                                        {invoice.finance_remarks ?? 'None'}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </GuestLayout>
    );
}
