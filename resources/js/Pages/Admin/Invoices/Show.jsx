import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Textarea,
    Chip,
    Divider
} from "@heroui/react";

export default function Show({ invoice }) {
    const { auth } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        manual_adjustment: invoice.manual_adjustment,
        finance_remarks: invoice.finance_remarks || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.invoices.update', invoice.id));
    };

    const handleSend = () => {
        if (confirm('Are you sure you want to send this invoice to the parent?')) {
            router.post(route('admin.invoices.send', invoice.id));
        }
    };

    const statusColorMap = {
        Draft: "default",
        Pending: "warning",
        Paid: "success",
        Overdue: "danger",
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Invoice #{invoice.id}</h2>
                        <p className="text-sm text-gray-500">Manage invoice details, manual adjustments, and PDF exports</p>
                    </div>
                    <a href={route('admin.invoices.pdf', invoice.id)} target="_blank" rel="noreferrer">
                        <Button color="secondary" variant="flat" className="font-bold">
                            📄 Download PDF Invoice
                        </Button>
                    </a>
                </div>
            }
        >
            <Head title={`Invoice #${invoice.id}`} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Details */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <p className="text-md font-semibold">Invoice Details</p>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Month</p>
                                <p className="text-md font-medium">{invoice.month_year}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <Chip className="capitalize mt-1" color={statusColorMap[invoice.status] || "default"} size="sm" variant="flat">
                                    {invoice.status}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Student</p>
                                <p className="text-md font-medium">{invoice.student?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Parent</p>
                                <p className="text-md font-medium">{invoice.student?.parent?.name}</p>
                            </div>
                        </div>

                        <Divider className="my-4" />

                        <div>
                            <p className="text-md font-semibold mb-4">Breakdown</p>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Base Amount</span>
                                    <span className="font-medium">${invoice.base_amount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">${invoice.tax_amount}</span>
                                </div>
                                <div className="flex justify-between text-success">
                                    <span>Recurring Discount</span>
                                    <span>-${invoice.recurring_discount_val}</span>
                                </div>
                                <div className="flex justify-between text-danger">
                                    <span>Manual Adjustment</span>
                                    <span>-${data.manual_adjustment}</span>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Amount</span>
                                    <span>${invoice.total_amount}</span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Actions / Manual Adjustment */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader>
                        <p className="text-md font-semibold">Manual Adjustment & Actions</p>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                type="number"
                                label="Manual Adjustment (Deduction)"
                                placeholder="0.00"
                                value={String(data.manual_adjustment)}
                                onValueChange={(val) => setData('manual_adjustment', val)}
                                description="Enter amount to deduct from total."
                                errorMessage={errors.manual_adjustment}
                                isInvalid={!!errors.manual_adjustment}
                                step="0.01"
                            />

                            <Textarea
                                label="Finance Remarks"
                                placeholder="Reason for adjustment..."
                                value={data.finance_remarks}
                                onValueChange={(val) => setData('finance_remarks', val)}
                                errorMessage={errors.finance_remarks}
                                isInvalid={!!errors.finance_remarks}
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    color="primary"
                                    isLoading={processing}
                                >
                                    Save Adjustment
                                </Button>
                            </div>
                        </form>

                        <Divider className="my-6" />

                        <div>
                            <p className="text-md font-semibold mb-2">Finalize</p>
                            <p className="text-sm text-gray-500 mb-4">
                                Once finalized, the invoice will be marked as Pending and sent to the parent.
                            </p>
                            <Button
                                onPress={handleSend}
                                isDisabled={invoice.status !== 'Draft'}
                                color={invoice.status === 'Draft' ? "success" : "default"}
                                className="w-full text-white"
                            >
                                {invoice.status === 'Draft' ? 'Send Invoice' : `Sent (${invoice.status})`}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
