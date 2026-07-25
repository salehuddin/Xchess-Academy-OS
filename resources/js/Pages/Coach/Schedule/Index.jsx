import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardBody, Chip, Button, Input, Select, SelectItem, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Tooltip } from "@heroui/react";
import { useState, useCallback, useMemo } from 'react';
import AttendanceModal from '../../Admin/Attendance/AttendanceModal';

// Icons
const AttendanceIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M7.5 18C8.32843 18 9 17.3284 9 16.5C9 15.6716 8.32843 15 7.5 15C6.67157 15 6 15.6716 6 16.5C6 17.3284 6.67157 18 7.5 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M16.5 18C17.3284 18 18 17.3284 18 16.5C18 15.6716 17.3284 15 16.5 15C15.6716 15 15 15.6716 15 16.5C15 17.3284 15.6716 18 16.5 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M2 11V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M2 11L12 2L22 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

export default function Index({ auth, schedules, filters, impersonatedCoach }) {
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [month, setMonth] = useState(filters.month);

    const handleAttendanceClick = (session) => {
        setSelectedSession({ id: session.id, date: session.date });
        setIsAttendanceModalOpen(true);
    };

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setMonth(newMonth);
        
        const urlParams = new URLSearchParams(window.location.search);
        const coachIdParam = urlParams.get('coach_id');
        
        let queryParams = { month: newMonth };
        if (coachIdParam) {
            queryParams.coach_id = coachIdParam;
        }

        router.get(route('coach.schedule.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Calculate dynamic stats for the current view
    const stats = useMemo(() => {
        const total = schedules.length;
        const delivered = schedules.filter(s => s.is_delivered).length;
        
        // Count pending past/today sessions
        const todayStr = new Date().toISOString().slice(0, 10);
        const pending = schedules.filter(s => !s.is_delivered && s.date <= todayStr).length;

        return { total, delivered, pending };
    }, [schedules]);

    const renderCell = useCallback((item, columnKey) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const isPastOrToday = item.date <= todayStr;

        switch (columnKey) {
            case "date":
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-tiny text-default-500">
                            {item.start_time} - {item.end_time}
                        </span>
                    </div>
                );
            case "class":
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{item.class_name}</span>
                        <span className="text-tiny text-default-500">{item.room_name}</span>
                    </div>
                );
            case "status":
                if (item.is_delivered) {
                    return <Chip size="sm" color="success" variant="flat">Submitted</Chip>;
                }
                if (isPastOrToday) {
                    return <Chip size="sm" color="warning" variant="flat">Pending</Chip>;
                }
                return <Chip size="sm" color="default" variant="flat">Upcoming</Chip>;
            case "topic":
                return item.topic ? (
                    <span className="text-sm truncate max-w-[150px] block" title={item.topic}>
                        {item.topic}
                    </span>
                ) : (
                    <span className="text-default-300">-</span>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content={isPastOrToday ? (item.is_delivered ? "View/Edit Attendance" : "Take Attendance") : "Cannot take attendance for future dates"}>
                            <Button
                                isIconOnly
                                size="sm"
                                variant={item.is_delivered ? "flat" : "solid"}
                                color={isPastOrToday ? (item.is_delivered ? "default" : "primary") : "default"}
                                isDisabled={!isPastOrToday}
                                onPress={() => handleAttendanceClick(item)}
                            >
                                <AttendanceIcon />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return item[columnKey];
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            My Schedule
                        </h2>
                        {impersonatedCoach && (
                            <Chip color="warning" variant="flat" size="sm">
                                Viewing as: {impersonatedCoach.name}
                            </Chip>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="month"
                            size="sm"
                            value={month}
                            onChange={handleMonthChange}
                            aria-label="Filter by month"
                        />
                    </div>
                </div>
            }
        >
            <Head title="My Schedule" />

            <div className="flex flex-col gap-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="shadow-sm">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-500 font-medium">Total Sessions</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="shadow-sm">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-500 font-medium">Delivered</p>
                                <p className="text-2xl font-bold text-success">{stats.delivered}</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="shadow-sm">
                        <CardBody className="flex flex-row items-center justify-between">
                            <div>
                                <p className="text-sm text-default-500 font-medium">Action Required</p>
                                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <Table aria-label="Schedule table">
                        <TableHeader>
                            <TableColumn key="date">DATE & TIME</TableColumn>
                            <TableColumn key="class">CLASS</TableColumn>
                            <TableColumn key="topic">TOPIC</TableColumn>
                            <TableColumn key="status">STATUS</TableColumn>
                            <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody items={schedules} emptyContent="No sessions found for this month.">
                            {(item) => (
                                <TableRow key={`${item.id}-${item.date}`}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {isAttendanceModalOpen && (
                <AttendanceModal
                    isOpen={isAttendanceModalOpen}
                    onClose={() => setIsAttendanceModalOpen(false)}
                    session={selectedSession}
                />
            )}
        </AuthenticatedLayout>
    );
}
