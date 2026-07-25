import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardBody, Chip, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, User as HeroUser } from "@heroui/react";
import { useCallback } from 'react';

export default function Show({ auth, chessClass, impersonatedCoach }) {
    const renderStudentCell = useCallback((student, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <HeroUser
                        avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${student.name}&background=random`}}
                        description={student.student_uid}
                        name={student.name}
                    />
                );
            case "status":
                return (
                    <Chip 
                        size="sm" 
                        variant="flat" 
                        color={
                            student.status === 'Active' ? 'success' : 
                            student.status === 'Suspended' ? 'danger' : 'default'
                        }
                    >
                        {student.status}
                    </Chip>
                );
            case "enrolled_date":
                return (
                    <span className="text-sm text-default-500">
                        {new Date(student.created_at).toLocaleDateString()}
                    </span>
                );
            default:
                return student[columnKey];
        }
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-foreground">
                                {chessClass.name}
                            </h2>
                            <p className="text-sm text-default-500">Class Details</p>
                        </div>
                        {impersonatedCoach && (
                            <Chip color="warning" variant="flat" size="sm">
                                Viewing as: {impersonatedCoach.name}
                            </Chip>
                        )}
                    </div>
                    <Link 
                        href={route('coach.classes.index') + (impersonatedCoach ? `?coach_id=${impersonatedCoach.id}` : '')}
                        className="text-sm text-primary hover:underline"
                    >
                        &larr; Back to Classes
                    </Link>
                </div>
            }
        >
            <Head title={`Class: ${chessClass.name}`} />

            <div className="space-y-6">
                <Card className="shadow-sm">
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
                                    chessClass.status === 'Pending' ? 'warning' : 'default'
                                }>
                                    {chessClass.status}
                                </Chip>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mode</p>
                                <p className="text-md font-medium">{chessClass.mode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Schedule</p>
                                <p className="text-md font-medium">{chessClass.day}</p>
                                <p className="text-small text-default-500">
                                    {chessClass.start_time?.substring(0, 5)} - {chessClass.end_time?.substring(0, 5)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Room / Location</p>
                                <p className="text-md font-medium">{chessClass.room?.name || 'N/A'}</p>
                                {chessClass.room?.location && (
                                    <p className="text-small text-default-500">{chessClass.room.location}</p>
                                )}
                            </div>

                            {chessClass.mode === 'Online' && chessClass.zoom_link && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Meeting Link</p>
                                    <a href={chessClass.zoom_link} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                                        {chessClass.zoom_link}
                                    </a>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">Enrolled Students ({chessClass.students.length})</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table aria-label="Students table">
                            <TableHeader>
                                <TableColumn key="name">STUDENT</TableColumn>
                                <TableColumn key="status">STATUS</TableColumn>
                                <TableColumn key="enrolled_date">ENROLLED</TableColumn>
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
            </div>
        </AuthenticatedLayout>
    );
}
