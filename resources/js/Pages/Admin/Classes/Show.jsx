import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
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
    User as HeroUser,
    Tooltip,
    Chip,
    Snippet,
    Input,
    Switch,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { useCallback, useState, useMemo } from 'react';
import AttendanceModal from '../Attendance/AttendanceModal';
import StudentDetailsModal from '../Students/StudentDetailsModal';
import ParentDetailsModal from '../Students/ParentDetailsModal';

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

const PlusIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

const AttendanceIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M7.5 18C8.32843 18 9 17.3284 9 16.5C9 15.6716 8.32843 15 7.5 15C6.67157 15 6 15.6716 6 16.5C6 17.3284 6.67157 18 7.5 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M16.5 18C17.3284 18 18 17.3284 18 16.5C18 15.6716 17.3284 15 16.5 15C15.6716 15 15 15.6716 15 16.5C15 17.3284 15.6716 18 16.5 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M2 11V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M2 11L12 2L22 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

export default function Show({ chessClass, availableStudents, allClasses, attendanceCounts }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        student_id: '',
    });

    const [newScheduleDate, setNewScheduleDate] = useState('');
    const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showPastSchedules, setShowPastSchedules] = useState(false);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
    const [studentQuery, setStudentQuery] = useState('');

    // Student Details Modal State
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Parent Details Modal State
    const [isParentModalOpen, setIsParentModalOpen] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState(null);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsStudentModalOpen(true);
    };

    const handleParentClick = (parentId) => {
        if (!parentId) return;
        setIsStudentModalOpen(false);
        setSelectedParentId(parentId);
        setIsParentModalOpen(true);
    };

    const filteredAvailableStudents = useMemo(() => {
        if (!studentQuery) return availableStudents;
        const q = studentQuery.toLowerCase();
        return availableStudents.filter((student) =>
            student.name?.toLowerCase().includes(q) ||
            student.student_uid?.toLowerCase().includes(q) ||
            student.nric_passport?.toLowerCase().includes(q)
        );
    }, [availableStudents, studentQuery]);

    const handleAttendanceClick = (date) => {
        setSelectedSession({ id: chessClass.id, date });
        setIsAttendanceModalOpen(true);
    };

    const onAddSchedule = () => {
        if (!newScheduleDate) return;
        const currentSchedules = chessClass.schedules || [];
        if (currentSchedules.includes(newScheduleDate)) return;

        const updated = [...currentSchedules, newScheduleDate].sort();

        router.put(route('admin.classes.schedules.update', chessClass.id), {
            schedules: updated
        }, {
            preserveScroll: true,
            onStart: () => setIsUpdatingSchedule(true),
            onFinish: () => {
                setIsUpdatingSchedule(false);
                setNewScheduleDate('');
            }
        });
    };

    const onRemoveSchedule = (dateToRemove) => {
        if (!confirm('Are you sure you want to remove this schedule?')) return;

        const currentSchedules = chessClass.schedules || [];
        const updated = currentSchedules.filter(d => d !== dateToRemove);

        router.put(route('admin.classes.schedules.update', chessClass.id), {
            schedules: updated
        }, {
            preserveScroll: true,
            onStart: () => setIsUpdatingSchedule(true),
            onFinish: () => setIsUpdatingSchedule(false)
        });
    };

    const onClassSelect = (key) => {
        if (key) {
            router.get(route('admin.classes.show', key));
        }
    };

    const submitEnroll = (e) => {
        e.preventDefault();
        post(route('admin.classes.enroll', chessClass.id), {
            onSuccess: () => {
                reset('student_id');
                setStudentQuery('');
            },
        });
    };

    const renderStudentCell = useCallback((student, columnKey) => {
        const cellValue = student[columnKey];
        switch (columnKey) {
            case "name":
                return (
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity min-w-[200px]"
                        onClick={() => handleStudentClick(student)}
                    >
                        <HeroUser
                            avatarProps={{radius: "lg", src: student.avatar_url || `https://ui-avatars.com/api/?name=${student.name}&background=random`}}
                            description={student.student_uid}
                            name={cellValue}
                        >
                            {student.email}
                        </HeroUser>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content="Remove Student" color="danger">
                            <Link
                                href={route('admin.classes.unenroll', [chessClass.id, student.id])}
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
    }, [chessClass.id, handleStudentClick]);

    const scheduleItems = useMemo(() => {
        // Current date info for filtering
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Start of current month
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const startOfCurrentMonthString = startOfCurrentMonth.toISOString().slice(0, 10);

        let schedules = (chessClass.schedules || []);

        // Filter out past schedules unless showPastSchedules is true
        // "This month" means dates >= 1st of current month
        if (!showPastSchedules) {
            schedules = schedules.filter(date => date >= startOfCurrentMonthString);
        }

        // Sort schedules
        schedules = [...schedules].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.localeCompare(b);
            } else {
                return b.localeCompare(a);
            }
        });

        return schedules.map((date, i) => ({ id: i, date }));
    }, [chessClass.schedules, showPastSchedules, sortOrder]);

    const sessionMap = useMemo(() => {
        const map = new Map();
        (chessClass.class_sessions || []).forEach(session => {
            map.set(session.session_date, session);
        });
        return map;
    }, [chessClass.class_sessions]);

    const renderScheduleCell = useCallback((item, columnKey) => {
        // Safe date comparison using YYYY-MM-DD strings
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        const isPastOrToday = item.date <= todayString;
        const session = sessionMap.get(item.date);
        const attendeeCount = attendanceCounts && attendanceCounts[item.date] ? attendanceCounts[item.date] : 0;

        switch (columnKey) {
            case "date":
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                );
            case "attendance":
                if (session) {
                    return (
                        <div className="flex gap-2 items-center">
                            <span className="text-tiny text-success-600 font-medium">
                                Attended
                            </span>
                            <span className="text-tiny text-default-500">
                                ({attendeeCount}/{chessClass.students ? chessClass.students.length : 0} present)
                            </span>
                        </div>
                    );
                } else if (isPastOrToday) {
                    return <span className="text-tiny text-warning-600">Pending Attendance</span>;
                }
                return <span className="text-tiny text-default-300">-</span>;
            case "topic":
                return session ? (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium truncate max-w-[200px]">{session.topic || 'No Topic'}</span>
                        {session.coach && <span className="text-tiny text-default-400">Coach: {session.coach.name}</span>}
                    </div>
                ) : (
                    <span className="text-default-300">-</span>
                );
            case "notes":
                const plainNotes = session?.notes ? session.notes.replace(/<[^>]+>/g, '') : '';
                return plainNotes ? (
                    <Tooltip content={<div className="max-w-xs text-tiny p-2">{plainNotes}</div>}>
                        <span className="text-tiny text-default-500 truncate max-w-[200px] cursor-help italic block">
                            "{plainNotes.length > 40 ? plainNotes.substring(0, 40) + '...' : plainNotes}"
                        </span>
                    </Tooltip>
                ) : (
                    <span className="text-default-300">-</span>
                );
            case "actions":
                const hasSession = sessionMap.has(item.date);
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content="Take Attendance" color="primary">
                            <span
                                onClick={() => isPastOrToday && handleAttendanceClick(item.date)}
                                className={`text-lg text-primary cursor-pointer active:opacity-50 ${!isPastOrToday ? 'opacity-30 pointer-events-none' : ''}`}
                            >
                                <AttendanceIcon />
                            </span>
                        </Tooltip>
                        <Tooltip
                            content={hasSession ? "Cannot remove schedule with attendance records" : "Remove Schedule"}
                            color={hasSession ? "default" : "danger"}
                        >
                            <span
                                className={`text-lg ${hasSession ? 'text-default-300 cursor-not-allowed' : 'text-danger cursor-pointer active:opacity-50'}`}
                                onClick={() => !hasSession && onRemoveSchedule(item.date)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return item[columnKey];
        }
    }, [onRemoveSchedule, chessClass.id]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">
                            {chessClass.name || chessClass.package?.title || `Class #${chessClass.uid || chessClass.id}`} <span className="text-default-400 text-lg font-normal">#{chessClass.uid}</span>
                        </h2>
                        <p className="text-sm text-gray-500">Manage class students and schedules</p>
                    </div>
                    <div className="w-full md:w-96">
                        <Autocomplete
                            labelPlacement="outside"
                            placeholder="Go to Class..."
                            defaultItems={allClasses}
                            onSelectionChange={onClassSelect}
                            size="sm"
                            aria-label="Select Class"
                        >
                            {(item) => {
                                const startTime = item.start_time ? item.start_time.substring(0, 5) : '--:--';
                                const endTime = item.end_time ? item.end_time.substring(0, 5) : '--:--';
                                const coachLabel = item.coach ? `Coach: ${item.coach}` : 'Coach: Unassigned';
                                const scheduleLabel = item.day ? `${item.day} ${startTime}-${endTime}` : 'Schedule N/A';
                                const studentsLabel = `${item.students_count || 0} students`;
                                const nameLabel = item.name || `Class #${item.uid || item.id}`;

                                return (
                                    <AutocompleteItem key={item.id} textValue={nameLabel}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{nameLabel}</span>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        item.status === 'Active' ? 'success' :
                                                        item.status === 'Pending' ? 'warning' :
                                                        item.status === 'Paused' ? 'default' : 'danger'
                                                    }
                                                    className="h-5 text-tiny px-1 min-w-0"
                                                >
                                                    {item.status}
                                                </Chip>
                                            </div>
                                            <span className="text-tiny text-default-500">
                                                {coachLabel} · {scheduleLabel} · {studentsLabel}
                                            </span>
                                        </div>
                                    </AutocompleteItem>
                                );
                            }}
                        </Autocomplete>
                    </div>
                </div>
            }
        >
            <Head title={`Class #${chessClass.uid || chessClass.id}`} />

            <div className="space-y-6">
                {/* Class Info */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">Class Information</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <Chip size="sm" variant="flat" color={
                                    chessClass.status === 'Active' ? 'success' :
                                    chessClass.status === 'Pending' ? 'warning' :
                                    chessClass.status === 'Paused' ? 'default' : 'danger'
                                }>
                                    {chessClass.status}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mode</p>
                                <p className="text-md font-medium">{chessClass.mode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Package</p>
                                <p className="text-md font-medium">{chessClass.package?.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Coach</p>
                                <p className="text-md font-medium">{chessClass.coach?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Schedule</p>
                                <p className="text-md font-medium">{chessClass.day}</p>
                                <p className="text-small text-default-500">
                                    {chessClass.start_time?.substring(0, 5)} - {chessClass.end_time?.substring(0, 5)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Room</p>
                                <p className="text-md font-medium">{chessClass.room?.name || 'N/A'}</p>
                                <p className="text-small text-default-500 capitalize">{chessClass.room?.location || chessClass.room?.platform}</p>
                            </div>

                            {chessClass.mode === 'Online' && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Online Details</p>
                                    <div className="flex flex-col gap-2">
                                        {chessClass.zoom_link && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-small text-default-500">Link:</span>
                                                <a href={chessClass.zoom_link} target="_blank" rel="noreferrer" className="text-primary text-small hover:underline truncate max-w-[200px]">
                                                    {chessClass.zoom_link}
                                                </a>
                                            </div>
                                        )}
                                        {chessClass.meeting_id && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-small text-default-500">ID:</span>
                                                <Snippet symbol="" size="sm" variant="flat">{chessClass.meeting_id}</Snippet>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Enrollment Section */}
                <Card className="shadow-sm border border-gray-100">
                     <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Enrolled Students</p>
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={submitEnroll} className="mb-6 flex flex-col md:flex-row gap-4 items-end">
                            <Autocomplete
                                label="Enroll Student"
                                placeholder="Search by name, ID or MyKad / Passport..."
                                items={filteredAvailableStudents}
                                inputValue={studentQuery}
                                onInputChange={setStudentQuery}
                                selectedKey={data.student_id ? String(data.student_id) : null}
                                onSelectionChange={(key) => setData('student_id', key ?? '')}
                                errorMessage={errors.student_id}
                                isInvalid={!!errors.student_id}
                                className="max-w-md"
                            >
                                {(student) => (
                                    <AutocompleteItem key={String(student.id)} textValue={student.name}>
                                        <div className="flex gap-2 items-center">
                                            <div className="flex flex-col">
                                                <span className="text-small">{student.name}</span>
                                                <span className="text-tiny text-default-400">
                                                    {student.student_uid}{student.nric_passport ? ` · ${student.nric_passport}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </AutocompleteItem>
                                )}
                            </Autocomplete>
                            <Button
                                type="submit"
                                color="primary"
                                isDisabled={!data.student_id}
                                isLoading={processing}
                                startContent={<PlusIcon />}
                            >
                                Enroll
                            </Button>
                        </form>

                        <Table aria-label="Enrolled students table">
                            <TableHeader>
                                <TableColumn key="name">NAME</TableColumn>
                                <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody items={chessClass.students} emptyContent="No students enrolled.">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderStudentCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Schedules Section */}
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <p className="text-md font-semibold">Schedules</p>
                                <Chip size="sm" variant="flat" color="primary">
                                    {scheduleItems.length}
                                </Chip>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    size="sm"
                                    isSelected={showPastSchedules}
                                    onValueChange={setShowPastSchedules}
                                >
                                    <span className="text-tiny text-default-500">Show Past History</span>
                                </Switch>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button variant="flat" size="sm" className="min-w-[100px]">
                                        Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Sort Order"
                                    onAction={(key) => setSortOrder(key)}
                                    selectedKeys={[sortOrder]}
                                    selectionMode="single"
                                >
                                    <DropdownItem key="asc">Oldest First</DropdownItem>
                                    <DropdownItem key="desc">Newest First</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                            <Input
                                type="date"
                                size="sm"
                                className="w-36"
                                value={newScheduleDate}
                                onChange={(e) => setNewScheduleDate(e.target.value)}
                                aria-label="New Schedule Date"
                            />
                            <Button
                                onPress={onAddSchedule}
                                color="primary"
                                size="sm"
                                isLoading={isUpdatingSchedule}
                                isDisabled={!newScheduleDate}
                                startContent={!isUpdatingSchedule && <PlusIcon />}
                            >
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Schedules table">
                            <TableHeader>
                                <TableColumn key="date">DATE</TableColumn>
                                <TableColumn key="attendance">ATTENDANCE</TableColumn>
                                <TableColumn key="topic">TOPIC / COACH</TableColumn>
                                <TableColumn key="notes">NOTES</TableColumn>
                                <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody items={scheduleItems} emptyContent="No schedules found.">
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderScheduleCell(item, columnKey)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </div>
            {isAttendanceModalOpen && (
                <AttendanceModal
                    isOpen={isAttendanceModalOpen}
                    onClose={() => setIsAttendanceModalOpen(false)}
                    session={selectedSession}
                />
            )}

            <StudentDetailsModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                student={selectedStudent}
                onViewParent={() => handleParentClick(selectedStudent?.parent_id)}
            />

            <ParentDetailsModal
                isOpen={isParentModalOpen}
                onClose={() => setIsParentModalOpen(false)}
                parentId={selectedParentId}
                onStudentClick={(student) => {
                    setIsParentModalOpen(false);
                    setTimeout(() => {
                        handleStudentClick(student);
                    }, 100);
                }}
            />
        </AuthenticatedLayout>
    );
}
