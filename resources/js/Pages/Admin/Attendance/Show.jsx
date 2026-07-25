import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Checkbox,
    Card,
    CardBody,
    User,
    Chip,
    Select,
    SelectItem,
    Textarea
} from "@heroui/react";
import { useCallback } from 'react';

// Icons
const CalendarIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M8 2v4M16 2v4M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} strokeMiterlimit={10} />
        <path d="M15.695 13.7h.009M15.695 16.7h.009M11.995 13.7h.01M11.995 16.7h.01M8.294 13.7h.01M8.294 16.7h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
);

const ClockIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const ArrowLeftIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} strokeMiterlimit={10} />
    </svg>
);

export default function Show({ auth, schedule, students, coaches }) {
    const { data, setData, post, processing, errors } = useForm({
        topic: schedule.topic || '',
        notes: schedule.notes || '',
        coach_id: schedule.coach_id ? String(schedule.coach_id) : '',
        attendances: students.map(student => ({
            student_id: student.id,
            is_present: student.is_present || false,
        })),
    });

    const handleToggle = (studentId) => {
        const index = data.attendances.findIndex(a => a.student_id === studentId);
        if (index !== -1) {
            const newAttendances = [...data.attendances];
            newAttendances[index].is_present = !newAttendances[index].is_present;
            setData('attendances', newAttendances);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.attendances.store', [schedule.id, schedule.date]));
    };

    const renderCell = useCallback((student, columnKey) => {
        const attendance = data.attendances.find(a => a.student_id === student.id);

        switch (columnKey) {
            case "student":
                return (
                    <User
                        avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${student.name}&background=random`}}
                        description={student.student_uid}
                        name={student.name}
                    >
                        {student.email}
                    </User>
                );
            case "status":
                return (
                    <div className="flex justify-end pr-4">
                        <Checkbox
                            isSelected={attendance?.is_present}
                            onValueChange={() => handleToggle(student.id)}
                            color="success"
                            classNames={{
                                label: "text-small",
                            }}
                        >
                            {attendance?.is_present ? 'Present' : 'Absent'}
                        </Checkbox>
                    </div>
                );
            default:
                return null;
        }
    }, [data.attendances]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Class Attendance</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Link href={route('admin.classes.show', schedule.id)} className="hover:text-primary transition-colors">{schedule.class_name}</Link>
                            <span className="text-gray-300">/</span>
                            <span className="font-medium text-gray-700">{schedule.date}</span>
                        </div>
                    </div>
                    <Button
                        as={Link}
                        href={route('admin.classes.show', schedule.id)}
                        variant="flat"
                        color="default"
                        startContent={<ArrowLeftIcon />}
                        size="sm"
                    >
                        Back to Class
                    </Button>
                </div>
            }
        >
            <Head title={`Attendance - ${schedule.class_name}`} />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* Session Details Card */}
                <Card className="shadow-sm border border-gray-100">
                    <CardBody className="gap-6">
                         <div className="flex flex-wrap gap-6 items-center justify-between pb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{schedule.class_name}</h3>
                                <p className="text-sm text-gray-500">{schedule.room_name}</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Chip
                                    startContent={<CalendarIcon className="w-4 h-4" />}
                                    variant="flat"
                                    color="primary"
                                    className="pl-2"
                                >
                                    {schedule.date}
                                </Chip>
                                <Chip
                                    startContent={<ClockIcon className="w-4 h-4" />}
                                    variant="flat"
                                    color="secondary"
                                    className="pl-2"
                                >
                                    {schedule.start_time} - {schedule.end_time}
                                </Chip>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Session Topic"
                                placeholder="Enter session topic"
                                value={data.topic}
                                onValueChange={(val) => setData('topic', val)}
                                errorMessage={errors.topic}
                                isInvalid={!!errors.topic}
                                variant="bordered"
                            />
                            <Select
                                label="Coach"
                                placeholder="Select coach"
                                selectedKeys={data.coach_id ? [data.coach_id] : []}
                                onChange={(e) => setData('coach_id', e.target.value)}
                                errorMessage={errors.coach_id}
                                isInvalid={!!errors.coach_id}
                                variant="bordered"
                            >
                                {coaches.map((coach) => (
                                    <SelectItem key={String(coach.id)} textValue={coach.name}>
                                        {coach.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <div className="md:col-span-2">
                                <Textarea
                                    label="Session Notes"
                                    placeholder="Add session notes..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    errorMessage={errors.notes}
                                    isInvalid={!!errors.notes}
                                    minRows={6}
                                />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Students Table */}
                <Card className="shadow-sm border border-gray-100">
                    <CardBody className="p-0">
                        <Table
                            aria-label="Students list"
                            shadow="none"
                            classNames={{
                                wrapper: "min-h-[400px] shadow-none p-0",
                                th: "bg-gray-50 text-gray-600 font-semibold px-6",
                                td: "px-6 py-4"
                            }}
                        >
                            <TableHeader columns={[{name: "STUDENT", uid: "student"}, {name: "STATUS", uid: "status"}]}>
                                {(column) => (
                                    <TableColumn key={column.uid} align={column.uid === "status" ? "end" : "start"}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={students}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50/50 sticky bottom-0 z-10">
                            <Button
                                color="primary"
                                type="submit"
                                isLoading={processing}
                                className="font-medium px-8"
                                size="lg"
                            >
                                Save Attendance
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </form>
        </AuthenticatedLayout>
    );
}
