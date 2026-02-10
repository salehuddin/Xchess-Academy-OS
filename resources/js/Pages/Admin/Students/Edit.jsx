import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea
} from "@heroui/react";

export default function Edit({ student, parents }) {
    const { auth } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: student.name,
        nric_passport: student.nric_passport || '',
        preferred_language: student.preferred_language || 'English',
        date_of_registration: student.date_of_registration || '',
        current_level: student.current_level || '',
        recurring_discount: student.recurring_discount || 0,
        admin_notes: student.admin_notes || '',
        status: student.status,
        parent_id: student.parent_id,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.students.update', student.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Edit Student</h2>
                        <p className="text-sm text-default-500">Update details for {student.name} ({student.student_uid})</p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${student.name}`} />

            <Card className="w-full max-w-2xl mx-auto shadow-sm border border-divider">
                <CardBody className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            label="Full Name"
                            value={data.name}
                            onValueChange={(val) => setData('name', val)}
                            errorMessage={errors.name}
                            isInvalid={!!errors.name}
                            isRequired
                        />

                        <Input
                            label="MyKid / MyKad / Passport"
                            value={data.nric_passport}
                            onValueChange={(val) => setData('nric_passport', val)}
                            errorMessage={errors.nric_passport}
                            isInvalid={!!errors.nric_passport}
                            isRequired
                            maxLength={12}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Preferred Language"
                                selectedKeys={data.preferred_language ? [data.preferred_language] : []}
                                onChange={(e) => setData('preferred_language', e.target.value)}
                                errorMessage={errors.preferred_language}
                                isInvalid={!!errors.preferred_language}
                                isRequired
                            >
                                <SelectItem key="Bahasa Melayu" value="Bahasa Melayu">Bahasa Melayu</SelectItem>
                                <SelectItem key="English" value="English">English</SelectItem>
                                <SelectItem key="Mandarin" value="Mandarin">Mandarin</SelectItem>
                                <SelectItem key="Tamil" value="Tamil">Tamil</SelectItem>
                            </Select>

                            <Input
                                type="date"
                                label="Date Registered"
                                value={data.date_of_registration}
                                onValueChange={(val) => setData('date_of_registration', val)}
                                errorMessage={errors.date_of_registration}
                                isInvalid={!!errors.date_of_registration}
                                isRequired
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Current Level"
                                selectedKeys={data.current_level ? [data.current_level] : []}
                                onChange={(e) => setData('current_level', e.target.value)}
                                errorMessage={errors.current_level}
                                isInvalid={!!errors.current_level}
                            >
                                <SelectItem key="Beginner" value="Beginner">Beginner</SelectItem>
                                <SelectItem key="Intermediate" value="Intermediate">Intermediate</SelectItem>
                                <SelectItem key="Advanced" value="Advanced">Advanced</SelectItem>
                            </Select>

                            <Input
                                type="number"
                                label="Recurring Discount (Amount)"
                                value={String(data.recurring_discount)}
                                onValueChange={(val) => setData('recurring_discount', val)}
                                errorMessage={errors.recurring_discount}
                                isInvalid={!!errors.recurring_discount}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <Textarea
                            label="Admin Notes"
                            value={data.admin_notes}
                            onValueChange={(val) => setData('admin_notes', val)}
                            errorMessage={errors.admin_notes}
                            isInvalid={!!errors.admin_notes}
                        />

                        <Select
                            label="Status"
                            selectedKeys={data.status ? [data.status] : []}
                            onChange={(e) => setData('status', e.target.value)}
                            errorMessage={errors.status}
                            isInvalid={!!errors.status}
                        >
                            <SelectItem key="Active" value="Active">Active</SelectItem>
                            <SelectItem key="Pending" value="Pending">Pending</SelectItem>
                            <SelectItem key="Suspended" value="Suspended">Suspended</SelectItem>
                        </Select>

                        <Select
                            label="Parent / Guardian"
                            selectedKeys={data.parent_id ? [String(data.parent_id)] : []}
                            onChange={(e) => setData('parent_id', e.target.value)}
                            errorMessage={errors.parent_id}
                            isInvalid={!!errors.parent_id}
                            isRequired
                        >
                            {parents.map((parent) => (
                                <SelectItem key={String(parent.id)} textValue={`${parent.name} (${parent.email})`}>
                                    <div className="flex flex-col">
                                        <span className="text-small">{parent.name}</span>
                                        <span className="text-tiny text-default-400">{parent.email}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>

                        <div className="flex items-center justify-end gap-4 mt-4">
                            <Button
                                as={Link}
                                href={route('admin.students.index')}
                                color="danger"
                                variant="light"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={processing}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
