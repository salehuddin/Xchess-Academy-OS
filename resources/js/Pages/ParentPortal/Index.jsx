import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tabs,
    Tab,
    Button,
    Select,
    SelectItem,
} from "@heroui/react";
import { useMemo, useState } from "react";
import StudentDetailsModal from "./StudentDetailsModal";

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

const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

export default function Index({ token, parent, students, invoices, schedule, summary, next_session, contact, range }) {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

    const [invoiceStudentFilter, setInvoiceStudentFilter] = useState(new Set());
    const [scheduleStudentFilter, setScheduleStudentFilter] = useState(new Set());

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsStudentModalOpen(true);
    };

    const invoiceStudentId = [...invoiceStudentFilter][0] ?? null;
    const filteredInvoices = useMemo(() => {
        if (!invoiceStudentId) return invoices ?? [];
        return (invoices ?? []).filter((inv) => String(inv.student_id) === invoiceStudentId);
    }, [invoices, invoiceStudentId]);

    const scheduleStudentId = [...scheduleStudentFilter][0] ?? null;
    const filteredSchedule = useMemo(() => {
        if (!scheduleStudentId) return schedule ?? [];
        return (schedule ?? []).filter((s) => (s.student_ids ?? []).map(String).includes(scheduleStudentId));
    }, [schedule, scheduleStudentId]);

    return (
        <GuestLayout variant="page" title={`Parent Portal · ${parent.name}`}>
            <Head title="Parent Portal" />

            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-col items-start gap-1">
                        <div className="text-xl font-semibold text-foreground">Welcome, {parent.name}</div>
                        <div className="text-sm text-default-500">
                            Students: {students?.length ?? 0}
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {(students ?? []).map((s) => (
                                <Card key={s.id} className="bg-content2">
                                    <CardBody className="space-y-1">
                                        <button
                                            type="button"
                                            onClick={() => handleStudentClick(s)}
                                            className="text-left font-medium text-foreground hover:text-primary hover:underline"
                                        >
                                            {s.name}
                                        </button>
                                        <div className="text-xs text-default-500">{s.student_uid}</div>
                                        <div>
                                            <Chip size="sm" variant="flat">
                                                {s.status}
                                            </Chip>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardBody className="space-y-1">
                            <div className="text-xs text-default-500 font-medium uppercase">Pending Invoices</div>
                            <div className="text-xl font-bold text-warning-600">{summary?.pending_count ?? 0}</div>
                            <div className="text-sm text-default-600">{formatRM(summary?.pending_amount)}</div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="space-y-1">
                            <div className="text-xs text-default-500 font-medium uppercase">Overdue Invoices</div>
                            <div className="text-xl font-bold text-danger-600">{summary?.overdue_count ?? 0}</div>
                            <div className="text-sm text-default-600">{formatRM(summary?.overdue_amount)}</div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="space-y-1">
                            <div className="text-xs text-default-500 font-medium uppercase">Next Session</div>
                            {next_session ? (
                                <>
                                    <div className="text-sm font-semibold text-foreground">{next_session.date} · {next_session.start_time}</div>
                                    <div className="text-sm text-default-600">{next_session.class_name}</div>
                                    <div className="text-xs text-default-500">{(next_session.students ?? []).join(', ')}</div>
                                </>
                            ) : (
                                <div className="text-sm text-default-500">No upcoming sessions</div>
                            )}
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="space-y-2">
                            <div className="text-xs text-default-500 font-medium uppercase">Need Help?</div>
                            <div className="flex flex-wrap gap-2">
                                {contact?.support_email && (
                                    <a href={`mailto:${contact.support_email}`}>
                                        <Button size="sm" variant="flat" color="primary">
                                            Contact Support
                                        </Button>
                                    </a>
                                )}
                                {contact?.whatsapp_url && (
                                    <a href={contact.whatsapp_url} target="_blank" rel="noreferrer">
                                        <Button size="sm" variant="flat" color="success">
                                            WhatsApp
                                        </Button>
                                    </a>
                                )}
                            </div>
                            {contact?.support_phone && (
                                <div className="text-xs text-default-400">
                                    <a href={`tel:${contact.support_phone}`} className="hover:underline">
                                        {contact.support_phone}
                                    </a>
                                </div>
                            )}
                            {contact?.support_hours && (
                                <div className="text-xs text-default-400">{contact.support_hours}</div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <Tabs aria-label="Parent portal sections" variant="underlined">
                    <Tab key="invoices" title="Invoices">
                        <Card>
                            <CardHeader className="flex flex-col items-start gap-1">
                                <div className="text-lg font-semibold text-foreground">Invoice History</div>
                                <div className="text-sm text-default-500">All invoices for your students</div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Select
                                        aria-label="Filter invoices by student"
                                        placeholder="All Students"
                                        size="sm"
                                        className="max-w-xs"
                                        selectedKeys={invoiceStudentFilter}
                                        onSelectionChange={setInvoiceStudentFilter}
                                    >
                                        {(students ?? []).map((s) => (
                                            <SelectItem key={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                                <Table aria-label="Invoices table" removeWrapper>
                                    <TableHeader>
                                        <TableColumn>MONTH</TableColumn>
                                        <TableColumn>STUDENT</TableColumn>
                                        <TableColumn>STATUS</TableColumn>
                                        <TableColumn>AMOUNT</TableColumn>
                                        <TableColumn>DUE</TableColumn>
                                        <TableColumn>VIEW</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No invoices found.">
                                        {filteredInvoices.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell>{inv.month_year}</TableCell>
                                                <TableCell>{inv.student_name ?? '-'}</TableCell>
                                                <TableCell>
                                                    <StatusChip status={inv.status} />
                                                </TableCell>
                                                <TableCell>{formatRM(inv.total_amount)}</TableCell>
                                                <TableCell>{inv.due_date ?? '-'}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={inv.view_url}
                                                        className="text-primary hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="schedule" title="Schedule">
                        <Card>
                            <CardHeader className="flex flex-col items-start gap-1">
                                <div className="text-lg font-semibold text-foreground">Upcoming Schedule</div>
                                <div className="text-sm text-default-500">
                                    {range?.start_date} to {range?.end_date}
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Select
                                        aria-label="Filter schedule by student"
                                        placeholder="All Students"
                                        size="sm"
                                        className="max-w-xs"
                                        selectedKeys={scheduleStudentFilter}
                                        onSelectionChange={setScheduleStudentFilter}
                                    >
                                        {(students ?? []).map((s) => (
                                            <SelectItem key={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </Select>
                                </div>
                                <Table aria-label="Schedule table" removeWrapper>
                                    <TableHeader>
                                        <TableColumn>DATE</TableColumn>
                                        <TableColumn>TIME</TableColumn>
                                        <TableColumn>CLASS</TableColumn>
                                        <TableColumn>STUDENT(S)</TableColumn>
                                        <TableColumn>COACH</TableColumn>
                                        <TableColumn>ROOM</TableColumn>
                                    </TableHeader>
                                    <TableBody emptyContent="No upcoming sessions in this range.">
                                        {filteredSchedule.map((s, idx) => (
                                            <TableRow key={`${s.class_uid}-${s.date}-${idx}`}>
                                                <TableCell>{s.date}</TableCell>
                                                <TableCell>{s.start_time}–{s.end_time}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-foreground">{s.class_name}</div>
                                                        {s.topic ? (
                                                            <div className="text-xs text-default-500">{s.topic}</div>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{(s.students ?? []).join(', ')}</TableCell>
                                                <TableCell>{s.coach_name}</TableCell>
                                                <TableCell>{s.room_name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>

            <StudentDetailsModal
                token={token}
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                student={selectedStudent}
            />
        </GuestLayout>
    );
}
