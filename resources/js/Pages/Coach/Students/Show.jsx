import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardBody, Chip, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, User as HeroUser } from "@heroui/react";
import { useCallback } from 'react';

export default function Show({ auth, student, attendances, impersonatedCoach }) {
    const renderAttendanceCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "date":
                return new Date(item.attendance_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
            case "class":
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{item.class?.name || 'Class'}</span>
                    </div>
                );
            case "status":
                return (
                    <Chip 
                        size="sm" 
                        variant="flat" 
                        color={item.is_present ? 'success' : 'danger'}
                    >
                        {item.is_present ? 'Present' : 'Absent'}
                    </Chip>
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
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-foreground">
                                {student.name}
                            </h2>
                            <p className="text-sm text-default-500">{student.student_uid}</p>
                        </div>
                        {impersonatedCoach && (
                            <Chip color="warning" variant="flat" size="sm">
                                Viewing as: {impersonatedCoach.name}
                            </Chip>
                        )}
                    </div>
                    <Link 
                        href={route('coach.students.index') + (impersonatedCoach ? `?coach_id=${impersonatedCoach.id}` : '')}
                        className="text-sm text-primary hover:underline"
                    >
                        &larr; Back to Students
                    </Link>
                </div>
            }
        >
            <Head title={`Student: ${student.name}`} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <Card className="shadow-sm">
                        <CardBody className="flex flex-col items-center p-6 text-center">
                            <HeroUser
                                avatarProps={{
                                    src: `https://ui-avatars.com/api/?name=${student.name}&background=random&size=128`,
                                    className: "w-24 h-24 text-large"
                                }}
                                name=""
                            />
                            <h3 className="text-xl font-bold mt-4">{student.name}</h3>
                            <p className="text-default-500 mb-4">{student.student_uid}{student.age ? ` · ${student.age}` : ''}</p>
                            
                            <Chip 
                                variant="flat" 
                                color={
                                    student.status === 'Active' ? 'success' : 
                                    student.status === 'Suspended' ? 'danger' : 'default'
                                }
                            >
                                {student.status}
                            </Chip>
                            
                            <div className="w-full mt-6 text-left border-t border-divider pt-4">
                                <p className="text-sm text-default-500 mb-2 font-semibold uppercase tracking-wider">Enrolled Classes (with you)</p>
                                <div className="flex flex-wrap gap-2">
                                    {student.classes.map(c => (
                                        <Chip key={c.id} size="sm" variant="flat" color="primary">
                                            {c.name}
                                        </Chip>
                                    ))}
                                    {student.classes.length === 0 && (
                                        <span className="text-sm text-default-400">No active enrollments</span>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="shadow-sm h-full">
                        <CardHeader className="flex gap-3">
                            <div className="flex flex-col">
                                <p className="text-md font-semibold">Recent Attendance</p>
                                <p className="text-small text-default-500">Showing records for your classes</p>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Table aria-label="Attendance history">
                                <TableHeader>
                                    <TableColumn key="date">DATE</TableColumn>
                                    <TableColumn key="class">CLASS</TableColumn>
                                    <TableColumn key="status">STATUS</TableColumn>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
