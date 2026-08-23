import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import CarryForwardAdjustments from '@/Components/CarryForwardAdjustments';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Chip,
    Tooltip
} from "@heroui/react";
import { useCallback } from 'react';

// Icons
const DeleteIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M15.7084 9.16669L15.1667 17.5667C15.0834 18.875 15.0001 19.8334 12.6751 19.8334H7.32508C5.00008 19.8334 4.91675 18.875 4.83341 17.5667L4.29175 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M10.3333 16.5H13.6666" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M9.5 12.5H14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

const EyeIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M15.58 12c0 1.98-1.6 3.58-3.58 3.58S8.42 13.98 8.42 12s1.6-3.58 3.58-3.58 3.58 1.6 3.58 3.58Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M12 20.27c3.53 0 6.82-2.08 9.11-5.68.9-1.41.9-3.78 0-5.19-2.29-3.6-5.58-5.68-9.11-5.68-3.53 0-6.82 2.08-9.11 5.68-.9 1.41-.9 3.78 0 5.19 2.29 3.6 5.58 5.68 9.11 5.68Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

const EditIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M11.4 18.1612L11.1528 15.6891C11.0969 15.1299 11.4428 14.6192 11.979 14.5008L14.4423 13.9566C14.7876 13.8803 15.1388 14.0725 15.2818 14.3985L16.4883 17.147C16.7135 17.6599 16.292 18.2323 15.7533 18.1672L12.5593 17.7806C12.0881 17.7236 11.6967 17.4168 11.5229 16.9749L11.4 18.1612Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" strokeMiterlimit="10"/>
    <path d="M16.0366 17.2718L21.328 6.68798C21.6578 6.02844 21.3789 5.2284 20.7093 4.90488C20.0397 4.58136 19.2328 4.88775 18.9031 5.54728L13.8152 15.7226" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" strokeMiterlimit="10"/>
    <path d="M15.1182 15.1764L18.9031 5.54728" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" strokeMiterlimit="10"/>
    <path d="M2 12C2 17.5228 6.47715 22 12 22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

const PlusIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

export default function Show({ student, availableClasses, attendances = [], pendingAdjustments = [], appliedAdjustments = [] }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        class_id: '',
        student_id: student.id,
    });

    const submitEnroll = (e) => {
        e.preventDefault();
        if (!data.class_id) return;

        post(route('admin.classes.enroll', data.class_id), {
            onSuccess: () => reset('class_id'),
        });
    };

    const statusColorMap = {
        Active: "success",
        Pending: "warning",
        Suspended: "danger",
        Paid: "success",
    };

    const renderClassCell = useCallback((c, columnKey) => {
        const cellValue = c[columnKey];
        switch (columnKey) {
            case "id":
                return `#${c.id}`;
            case "package":
                return c.package?.title;
            case "coach":
                return c.coach?.name;
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content="View Class">
                            <Link href={route('admin.classes.show', c.id)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <EyeIcon />
                            </Link>
                        </Tooltip>
                        <Tooltip content="Unenroll Student" color="danger">
                            <Link
                                href={route('admin.classes.unenroll', [c.id, student.id])}
                                method="delete"
                                as="button"
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                            >
                                <DeleteIcon />
                            </Link>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [student.id]);

    const renderAttendanceCell = useCallback((att, columnKey) => {
        switch (columnKey) {
            case "date":
                return att.date || 'N/A';
            case "class_name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{att.class_name || 'N/A'}</p>
                        {att.package && <p className="text-xs text-default-500">{att.package}</p>}
                    </div>
                );
            case "time":
                return `${att.start_time || '-'} - ${att.end_time || '-'}`;
            case "is_present":
                return (
                    <Chip className="capitalize" color={att.is_present ? "success" : "danger"} size="sm" variant="flat">
                        {att.is_present ? 'Present' : 'Absent'}
                    </Chip>
                );
            default:
                return att[columnKey] || 'N/A';
        }
    }, []);

    const renderInvoiceCell = useCallback((inv, columnKey) => {
        const cellValue = inv[columnKey];
        switch (columnKey) {
            case "id":
                return `#${inv.id}`;
            case "month_year":
                return inv.month_year;
            case "total_amount":
                return `$${inv.total_amount}`;
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[inv.status] || "default"} size="sm" variant="flat">
                        {cellValue}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content="View Invoice">
                            <Link href={route('admin.invoices.show', inv.id)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
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
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Student Details</h2>
                        <p className="text-sm text-default-500">Manage profile, enrollments, and invoices for {student.name}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Student: ${student.name}`} />

            <div className="space-y-6">
                {/* Profile Info */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Profile</p>
                        <Button
                            as={Link}
                            href={route('admin.students.edit', student.id)}
                            color="primary"
                            size="sm"
                            startContent={<EditIcon />}
                        >
                            Edit Student
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-default-500">Name</p>
                                <p className="text-md font-medium">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">UID</p>
                                <p className="text-md font-medium">{student.student_uid}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Status</p>
                                <Chip className="capitalize mt-1" color={statusColorMap[student.status] || "default"} size="sm" variant="flat">
                                    {student.status}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Current Level</p>
                                <p className="text-md font-medium">{student.current_level || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Parent</p>
                                <p className="text-md font-medium">{student.parent?.name} ({student.parent?.email})</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Recurring Discount</p>
                                <p className="text-md font-medium">${student.recurring_discount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">ID (MyKid/Passport)</p>
                                <p className="text-md font-medium">{student.nric_passport || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Date of Birth</p>
                                <p className="text-md font-medium">
                                    {student.date_of_birth
                                        ? `${new Date(student.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}${student.age ? ` (${student.age})` : ''}`
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Preferred Language</p>
                                <p className="text-md font-medium">{student.preferred_language || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Date Registered</p>
                                <p className="text-md font-medium">{student.date_of_registration || 'N/A'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-sm text-default-500">Admin Notes</p>
                                <p className="text-md font-medium whitespace-pre-wrap">{student.admin_notes || 'No notes.'}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Enrolled Classes */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Enrolled Classes</p>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={submitEnroll} className="mb-6 flex flex-col md:flex-row gap-4 items-end">
                            <Select
                                label="Enroll in Class"
                                labelPlacement="outside"
                                placeholder="Select a class"
                                selectedKeys={data.class_id ? [String(data.class_id)] : []}
                                onChange={(e) => setData('class_id', e.target.value)}
                                errorMessage={errors.class_id}
                                isInvalid={!!errors.class_id}
                                className="max-w-md"
                            >
                                {availableClasses.map((c) => (
                                    <SelectItem key={String(c.id)} textValue={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={!data.class_id}
                                isLoading={processing}
                                startContent={<PlusIcon />}
                            >
                                Enroll
                            </Button>
                        </form>

                        <Table aria-label="Enrolled classes table">
                            <TableHeader>
                                <TableColumn key="id">CLASS ID</TableColumn>
                                <TableColumn key="package">PACKAGE</TableColumn>
                                <TableColumn key="coach">COACH</TableColumn>
                                <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody items={student.classes} emptyContent="No enrolled classes.">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderClassCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Attendance History */}
                <Card className="shadow-sm border border-divider">
                    <CardHeader>
                        <p className="text-md font-semibold">Attendance History</p>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Attendance history table">
                            <TableHeader>
                                <TableColumn key="date">DATE</TableColumn>
                                <TableColumn key="class_name">CLASS</TableColumn>
                                <TableColumn key="time">TIME</TableColumn>
                                <TableColumn key="is_present">STATUS</TableColumn>
                            </TableHeader>
                            <TableBody items={attendances} emptyContent="No attendance records found.">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderAttendanceCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Invoices & Adjustments side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <Card className="shadow-sm border border-divider">
                        <CardHeader>
                            <p className="text-md font-semibold">Invoices History</p>
                        </CardHeader>
                        <CardBody>
                            <Table aria-label="Invoices history table">
                                <TableHeader>
                                    <TableColumn key="id">ID</TableColumn>
                                    <TableColumn key="month_year">MONTH</TableColumn>
                                    <TableColumn key="total_amount">AMOUNT</TableColumn>
                                    <TableColumn key="status">STATUS</TableColumn>
                                    <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody items={student.invoices} emptyContent="No invoices found.">
                                    {(item) => (
                                        <TableRow key={item.id}>
                                            {(columnKey) => <TableCell>{renderInvoiceCell(item, columnKey)}</TableCell>}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm border border-divider">
                        <CardHeader>
                            <p className="text-md font-semibold">Carry-Forward Adjustments</p>
                        </CardHeader>
                        <CardBody>
                            <CarryForwardAdjustments
                                student={student}
                                pendingAdjustments={pendingAdjustments}
                                appliedAdjustments={appliedAdjustments}
                            />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
