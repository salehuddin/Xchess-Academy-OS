import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Select,
    SelectItem,
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
    Snippet
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

const PlusIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

export default function Show({ chessClass, availableStudents, allClasses }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        student_id: '',
    });

    const onClassSelect = (key) => {
        if (key) {
            router.get(route('admin.classes.show', key));
        }
    };

    const submitEnroll = (e) => {
        e.preventDefault();
        post(route('admin.classes.enroll', chessClass.id), {
            onSuccess: () => reset('student_id'),
        });
    };

    const renderStudentCell = useCallback((student, columnKey) => {
        const cellValue = student[columnKey];
        switch (columnKey) {
            case "name":
                return (
                    <HeroUser
                        avatarProps={{radius: "lg", src: student.avatar_url || `https://ui-avatars.com/api/?name=${student.name}&background=random`}}
                        description={student.student_uid}
                        name={cellValue}
                    >
                        {student.email}
                    </HeroUser>
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
    }, [chessClass.id]);

    const renderScheduleCell = useCallback((schedule, columnKey) => {
        switch (columnKey) {
            case "date":
                return new Date(schedule.start_time).toLocaleDateString();
            case "time":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{new Date(schedule.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="text-tiny text-default-400">to {new Date(schedule.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                );
            case "room":
                return schedule.room?.name || 'N/A';
            default:
                return schedule[columnKey];
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">
                            {chessClass.name} <span className="text-default-400 text-lg font-normal">#{chessClass.uid}</span>
                        </h2>
                        <p className="text-sm text-gray-500">Manage class students and schedules</p>
                    </div>
                    <div className="w-full md:w-64">
                        <Autocomplete
                            labelPlacement="outside"
                            placeholder="Go to Class..."
                            defaultItems={allClasses}
                            onSelectionChange={onClassSelect}
                            size="sm"
                            aria-label="Select Class"
                        >
                            {(item) => <AutocompleteItem key={item.id} textValue={item.name}>{item.name}</AutocompleteItem>}
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
                            <Select
                                label="Enroll Student"
                                placeholder="Select a student"
                                selectedKeys={data.student_id ? [String(data.student_id)] : []}
                                onChange={(e) => setData('student_id', e.target.value)}
                                errorMessage={errors.student_id}
                                isInvalid={!!errors.student_id}
                                className="max-w-md"
                            >
                                {availableStudents.map((student) => (
                                    <SelectItem key={String(student.id)} textValue={`${student.name} (${student.student_uid})`}>
                                        <div className="flex gap-2 items-center">
                                            <div className="flex flex-col">
                                                <span className="text-small">{student.name}</span>
                                                <span className="text-tiny text-default-400">{student.student_uid}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </Select>
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
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-md font-semibold">Schedules</p>
                        <Button
                            as={Link}
                            href={route('admin.schedules.create', { class_id: chessClass.id })}
                            color="primary"
                            size="sm"
                            startContent={<PlusIcon />}
                        >
                            Add Schedule
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Schedules table">
                            <TableHeader>
                                <TableColumn key="date">DATE</TableColumn>
                                <TableColumn key="time">TIME</TableColumn>
                                <TableColumn key="room">ROOM</TableColumn>
                            </TableHeader>
                            <TableBody items={chessClass.schedules || []} emptyContent="No schedules found.">
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
        </AuthenticatedLayout>
    );
}
