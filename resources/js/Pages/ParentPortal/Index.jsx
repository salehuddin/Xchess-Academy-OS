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
} from "@heroui/react";

const StatusChip = ({ status }) => {
    const color =
        status === 'Paid' ? 'success' :
        status === 'Pending' ? 'warning' :
        'default';

    return (
        <Chip size="sm" color={color} variant="flat">
            {status}
        </Chip>
    );
};

export default function Index({ token, parent, students, invoices, schedule, range }) {
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
                                        <div className="font-medium text-foreground">{s.name}</div>
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

                <Tabs aria-label="Parent portal sections" variant="underlined">
                    <Tab key="invoices" title="Invoices">
                        <Card>
                            <CardHeader className="flex flex-col items-start gap-1">
                                <div className="text-lg font-semibold text-foreground">Invoice History</div>
                                <div className="text-sm text-default-500">All invoices for your students</div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
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
                                        {(invoices ?? []).map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell>{inv.month_year}</TableCell>
                                                <TableCell>{inv.student_name ?? '-'}</TableCell>
                                                <TableCell>
                                                    <StatusChip status={inv.status} />
                                                </TableCell>
                                                <TableCell>RM {Number(inv.total_amount).toFixed(2)}</TableCell>
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
                            <CardBody>
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
                                        {(schedule ?? []).map((s, idx) => (
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
        </GuestLayout>
    );
}

