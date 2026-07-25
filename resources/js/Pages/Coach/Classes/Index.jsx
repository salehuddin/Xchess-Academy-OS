import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardBody, Chip, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Pagination, Tooltip, Button } from "@heroui/react";
import { useCallback } from 'react';

// Icons
const EyeIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 11.0083 18.3417 8.98333 17.5917 7.83333C15.6833 4.83333 12.9417 3.1 9.99999 3.1C7.05833 3.1 4.31666 4.83333 2.40833 7.83333C1.65833 8.98333 1.65833 11.0083 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

export default function Index({ auth, classes, impersonatedCoach }) {
    const urlParams = new URLSearchParams(window.location.search);
    const coachIdParam = urlParams.get('coach_id');
    const queryParamString = coachIdParam ? `?coach_id=${coachIdParam}` : '';

    const renderCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <span className="font-bold">{item.name}</span>
                        <span className="text-tiny text-default-500">{item.uid}</span>
                    </div>
                );
            case "schedule":
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{item.day}</span>
                        <span className="text-tiny text-default-500">
                            {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                        </span>
                    </div>
                );
            case "room":
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{item.room?.name || 'N/A'}</span>
                        <span className="text-tiny text-default-500">{item.mode}</span>
                    </div>
                );
            case "students":
                return (
                    <Chip size="sm" variant="flat">
                        {item.students_count} / {item.capacity || '∞'}
                    </Chip>
                );
            case "status":
                return (
                    <Chip 
                        size="sm" 
                        variant="flat" 
                        color={
                            item.status === 'Active' ? 'success' : 
                            item.status === 'Pending' ? 'warning' : 'default'
                        }
                    >
                        {item.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content="View Class Details">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                as={Link} 
                                href={route('coach.classes.show', item.id) + queryParamString}
                            >
                                <EyeIcon className="text-default-500" />
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return item[columnKey];
        }
    }, [queryParamString]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            My Classes
                        </h2>
                        {impersonatedCoach && (
                            <Chip color="warning" variant="flat" size="sm">
                                Viewing as: {impersonatedCoach.name}
                            </Chip>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="My Classes" />

            <Card className="shadow-sm">
                <Table 
                    aria-label="Classes table"
                    bottomContent={
                        classes.last_page > 1 ? (
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={classes.current_page}
                                    total={classes.last_page}
                                    onChange={(page) => {
                                        let params = { page };
                                        if (coachIdParam) params.coach_id = coachIdParam;
                                        router.get(route('coach.classes.index'), params, { preserveScroll: true });
                                    }}
                                />
                            </div>
                        ) : null
                    }
                >
                    <TableHeader>
                        <TableColumn key="name">CLASS NAME</TableColumn>
                        <TableColumn key="schedule">SCHEDULE</TableColumn>
                        <TableColumn key="room">ROOM / MODE</TableColumn>
                        <TableColumn key="students">STUDENTS</TableColumn>
                        <TableColumn key="status">STATUS</TableColumn>
                        <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody items={classes.data} emptyContent="You have no classes assigned.">
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </AuthenticatedLayout>
    );
}
