import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Textarea,
    Divider,
    Chip
} from "@heroui/react";

export default function Company({ auth, settings }) {
    const { flash = {} } = usePage().props;

    const form = useForm({
        company_name: settings.company_name || '',
        company_reg_no: settings.company_reg_no || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        company_bank_details: settings.company_bank_details || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('admin.settings.company.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Academy Profile & Company Info</h2>
                        <p className="text-sm text-gray-500">Configure company registration, branding, and billing info printed on PDF Invoices and Receipts</p>
                    </div>
                </div>
            }
        >
            <Head title="Company Info Settings" />

            <div className="space-y-6 max-w-5xl">
                {flash.success && (
                    <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Success! </strong>
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Sub-nav tabs */}
                <div className="flex items-center gap-2 border-b border-divider pb-3">
                    <Button size="sm" color="primary" variant="solid" className="font-bold">
                        Company Profile
                    </Button>
                    <Button size="sm" variant="flat" as={Link} href={route('admin.settings.services')}>
                        External Services (Chip, SMTP, WhatsApp)
                    </Button>
                </div>

                <Card className="shadow-sm">
                    <CardHeader className="flex justify-between items-center px-6 pt-6">
                        <div>
                            <h3 className="text-lg font-bold">Company & Billing Details</h3>
                            <p className="text-sm text-default-500">These details will be embedded automatically into official PDF Invoices and Receipts.</p>
                        </div>
                        <Chip color="primary" variant="flat" size="sm">PDF Dynamic Template</Chip>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Company / Academy Name</label>
                                    <Input
                                        placeholder="e.g. X Chess Academy"
                                        value={form.data.company_name}
                                        onChange={(e) => form.setData('company_name', e.target.value)}
                                        isInvalid={!!form.errors.company_name}
                                        errorMessage={form.errors.company_name}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">SSM / Registration Number</label>
                                    <Input
                                        placeholder="e.g. 202401012345 (SSM)"
                                        value={form.data.company_reg_no}
                                        onChange={(e) => form.setData('company_reg_no', e.target.value)}
                                        isInvalid={!!form.errors.company_reg_no}
                                        errorMessage={form.errors.company_reg_no}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Official Contact Email</label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. info@xchess-academy.com"
                                        value={form.data.company_email}
                                        onChange={(e) => form.setData('company_email', e.target.value)}
                                        isInvalid={!!form.errors.company_email}
                                        errorMessage={form.errors.company_email}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Official Phone Number</label>
                                    <Input
                                        placeholder="e.g. +60 12-345 6789"
                                        value={form.data.company_phone}
                                        onChange={(e) => form.setData('company_phone', e.target.value)}
                                        isInvalid={!!form.errors.company_phone}
                                        errorMessage={form.errors.company_phone}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Official Address</label>
                                <Textarea
                                    rows={3}
                                    placeholder="Enter physical address for invoices..."
                                    value={form.data.company_address}
                                    onChange={(e) => form.setData('company_address', e.target.value)}
                                    isInvalid={!!form.errors.company_address}
                                    errorMessage={form.errors.company_address}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Bank Account & Transfer Details</label>
                                <Textarea
                                    rows={3}
                                    placeholder="e.g. Maybank: 5140 1234 5678 (X Chess Academy Sdn Bhd)"
                                    value={form.data.company_bank_details}
                                    onChange={(e) => form.setData('company_bank_details', e.target.value)}
                                    isInvalid={!!form.errors.company_bank_details}
                                    errorMessage={form.errors.company_bank_details}
                                />
                                <span className="text-xs text-default-400 mt-1 block">This bank information will be printed on unpaid PDF invoices for manual transfers.</span>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button color="primary" type="submit" isLoading={form.processing} className="font-bold">
                                    Save Company Profile
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
