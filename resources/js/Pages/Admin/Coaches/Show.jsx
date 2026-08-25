import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PayrollDetailModal from '@/Components/PayrollDetailModal';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Autocomplete,
    AutocompleteItem,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Chip,
    Tooltip
} from "@heroui/react";
import { useCallback, useMemo, useState } from 'react';

const EditIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
        <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
        <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
    </svg>
);

const EyeIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M15.58 12c0 1.98-1.6 3.58-3.58 3.58S8.42 13.98 8.42 12s1.6-3.58 3.58-3.58 3.58 1.6 3.58 3.58Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M12 20.27c3.53 0 6.82-2.08 9.11-5.68.9-1.41.9-3.78 0-5.19-2.29-3.6-5.58-5.68-9.11-5.68-3.53 0-6.82 2.08-9.11 5.68-.9 1.41-.9 3.78 0 5.19 2.29 3.6 5.58 5.68 9.11 5.68Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    </svg>
);

export default function Show({ coach, classes, sessions, coachOptions, payrolls }) {
    const { auth } = usePage().props;
    const [detailPayroll, setDetailPayroll] = useState(null);

    const statusColorMap = {
        Active: "success",
        Pending: "warning",
        Paused: "default",
        Stopped: "danger",
    };

    const payrollStatusColorMap = {
        Paid: "success",
        Processed: "primary",
        Draft: "warning",
    };

    const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

    const formatMonth = (yearMonth) => {
        if (!yearMonth) return '—';
        const [year, month] = yearMonth.split('-');
        const date = new Date(Number(year), Number(month) - 1, 1);
        return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'long' });
    };

    const availability = coach.coach_profile?.availability || [];

    const classColumns = useMemo(() => ([
        { name: "CLASS", uid: "name" },
        { name: "PACKAGE", uid: "package" },
        { name: "DAY", uid: "day" },
        { name: "TIME", uid: "time" },
        { name: "ROOM", uid: "room" },
        { name: "MODE", uid: "mode" },
        { name: "STATUS", uid: "status" },
        { name: "ACTIONS", uid: "actions" },
    ]), []);

    const sessionColumns = useMemo(() => ([
        { name: "DATE", uid: "date" },
        { name: "CLASS", uid: "class_name" },
        { name: "COACH", uid: "coach_name" },
        { name: "TIME", uid: "time" },
        { name: "ROOM", uid: "room_name" },
        { name: "TOPIC", uid: "topic" },
    ]), []);

    const payrollColumns = useMemo(() => ([
        { name: "MONTH", uid: "month_year" },
        { name: "SESSIONS", uid: "total_sessions" },
        { name: "AVG RATE", uid: "base_rate" },
        { name: "TOTAL", uid: "total_amount" },
        { name: "STATUS", uid: "status" },
        { name: "ACTIONS", uid: "actions" },
    ]), []);

    const renderClassCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{item.name || `Class #${item.id}`}</p>
                        <p className="text-xs text-default-500">#{item.id}</p>
                    </div>
                );
            case "time":
                return `${item.start_time || '-'} - ${item.end_time || '-'}`;
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[item.status] || "default"} size="sm" variant="flat">
                        {item.status || 'N/A'}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="View Class">
                            <Link href={route('admin.classes.show', item.id)} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <EyeIcon />
                            </Link>
                        </Tooltip>
                    </div>
                );
            default:
                return item[columnKey] || 'N/A';
        }
    }, [statusColorMap]);

    const renderSessionCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "class_name":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{item.class_name || 'N/A'}</p>
                        <p className="text-xs text-default-500">#{item.class_id}</p>
                    </div>
                );
            case "time":
                return `${item.start_time || '-'} - ${item.end_time || '-'}`;
            case "topic":
                return item.topic || '—';
            default:
                return item[columnKey] || 'N/A';
        }
    }, []);

    const renderPayrollCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "month_year":
                return <p className="font-medium text-sm">{formatMonth(item.month_year)}</p>;
            case "total_sessions":
                return (
                    <p className="font-semibold text-sm">
                        {item.total_sessions} <span className="text-xs text-default-400 font-normal">sessions</span>
                    </p>
                );
            case "base_rate":
                return <p className="text-sm text-default-600">{formatRM(item.base_rate)}</p>;
            case "total_amount":
                return <p className="font-bold text-sm text-success-600">{formatRM(item.total_amount)}</p>;
            case "status":
                return (
                    <Chip className="capitalize" color={payrollStatusColorMap[item.status] || "default"} size="sm" variant="flat">
                        {item.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="flex items-center gap-2 justify-center">
                        <Tooltip content="View Details">
                            <button
                                className="text-default-400 hover:text-default-600 transition-colors"
                                onClick={() => setDetailPayroll(item)}
                                aria-label="View payroll details"
                            >
                                <EyeIcon />
                            </button>
                        </Tooltip>
                    </div>
                );
            default:
                return item[columnKey] || 'N/A';
        }
    }, [payrollStatusColorMap]);

    const onCoachSelect = (key) => {
        if (key && String(key) !== String(coach.id)) {
            router.get(route('admin.coaches.show', key));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Coach Details</h2>
                        <p className="text-sm text-default-500">Profile, assigned classes, and attendance for {coach.name}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                        <div className="w-full md:w-72">
                            <Autocomplete
                                labelPlacement="outside"
                                placeholder="Go to Coach..."
                                defaultItems={coachOptions}
                                defaultSelectedKey={String(coach.id)}
                                onSelectionChange={onCoachSelect}
                                size="sm"
                                aria-label="Select Coach"
                            >
                                {(item) => (
                                    <AutocompleteItem key={item.id} textValue={item.name}>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{item.name}</span>
                                            <span className="text-tiny text-default-500">
                                                {item.level || 'Level N/A'} · {item.classes_count || 0} classes
                                            </span>
                                        </div>
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>
                        </div>
                        <div className="flex gap-2">
                            <Button as={Link} href={route('admin.coaches.index')} variant="flat">
                                Back to Coaches
                            </Button>
                            <Button as={Link} href={route('admin.coaches.edit', coach.id)} color="primary" startContent={<EditIcon />}>
                                Edit Coach
                            </Button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Coach: ${coach.name}`} />

            <div className="space-y-6">
                <Card className="shadow-sm border border-divider">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Profile</p>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-default-500">Name</p>
                                <p className="text-md font-medium">{coach.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Email</p>
                                <p className="text-md font-medium">{coach.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Role</p>
                                <Chip className="capitalize mt-1" color={coach.role === 'Admin' ? "warning" : "primary"} size="sm" variant="flat">
                                    {coach.role}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Phone</p>
                                <p className="text-md font-medium">{coach.coach_profile?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">MyKad (NRIC)</p>
                                <p className="text-md font-medium">{coach.coach_profile?.nric || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Level</p>
                                <p className="text-md font-medium">{coach.coach_profile?.level || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Bank Name</p>
                                <p className="text-md font-medium">{coach.coach_profile?.bank_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Bank Account Name</p>
                                <p className="text-md font-medium">{coach.coach_profile?.bank_account_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-default-500">Bank Account Number</p>
                                <p className="text-md font-medium">{coach.coach_profile?.bank_account_number || 'N/A'}</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-sm text-default-500">Availability</p>
                                {availability.length === 0 ? (
                                    <p className="text-md font-medium">No availability slots</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {availability.map((slot, index) => (
                                            <Chip key={`${slot.day || 'day'}-${index}`} size="sm" variant="flat">
                                                {slot.day || 'Day'} {slot.start || '--:--'} - {slot.end || '--:--'}
                                            </Chip>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-divider">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Assigned Classes</p>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Assigned classes table">
                            <TableHeader columns={classColumns}>
                                {(column) => (
                                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={classes} emptyContent="No classes assigned">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => (
                                            <TableCell>
                                                {renderClassCell(item, columnKey)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-divider">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Class Sessions Delivered</p>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Class sessions delivered table">
                            <TableHeader columns={sessionColumns}>
                                {(column) => (
                                    <TableColumn key={column.uid}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={sessions} emptyContent="No class sessions delivered yet">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => (
                                            <TableCell>
                                                {renderSessionCell(item, columnKey)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-divider">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Payroll History</p>
                        <Button as={Link} href={route('admin.payrolls.index')} variant="flat" size="sm">
                            View All Payrolls
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Payroll history table">
                            <TableHeader columns={payrollColumns}>
                                {(column) => (
                                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={payrolls} emptyContent="No payroll records yet">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => (
                                            <TableCell>
                                                {renderPayrollCell(item, columnKey)}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>

            <PayrollDetailModal
                isOpen={!!detailPayroll}
                onClose={() => setDetailPayroll(null)}
                url={detailPayroll ? route('admin.payrolls.show', detailPayroll.id) : null}
                canEdit
            />
        </AuthenticatedLayout>
    );
}
