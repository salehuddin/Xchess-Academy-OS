import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardBody, Chip, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Pagination, Input, User as HeroUser, Button, Tooltip } from "@heroui/react";
import { useCallback, useState } from 'react';

// Icons
const SearchIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const EyeIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 11.0083 18.3417 8.98333 17.5917 7.83333C15.6833 4.83333 12.9417 3.1 9.99999 3.1C7.05833 3.1 4.31666 4.83333 2.40833 7.83333C1.65833 8.98333 1.65833 11.0083 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

export default function Index({ auth, students, filters, impersonatedCoach }) {
    const [search, setSearch] = useState(filters.search || '');

    const urlParams = new URLSearchParams(window.location.search);
    const coachIdParam = urlParams.get('coach_id');
    const queryParamString = coachIdParam ? `?coach_id=${coachIdParam}` : '';

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            let params = { search };
            if (coachIdParam) params.coach_id = coachIdParam;
            router.get(route('coach.students.index'), params, { preserveState: true });
        }
    };

    const renderCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <HeroUser
                        avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${item.name}&background=random`}}
                        description={item.student_uid}
                        name={item.name}
                    />
                );
            case "age":
                return (
                    <p className="text-bold text-sm">{item.age || '-'}</p>
                );
            case "classes":
                return (
                    <div className="flex flex-wrap gap-1">
                        {item.classes.map(c => (
                            <Chip key={c.id} size="sm" variant="flat">
                                {c.name}
                            </Chip>
                        ))}
                    </div>
                );
            case "status":
                return (
                    <Chip 
                        size="sm" 
                        variant="flat" 
                        color={
                            item.status === 'Active' ? 'success' : 
                            item.status === 'Suspended' ? 'danger' : 'default'
                        }
                    >
                        {item.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-end">
                        <Tooltip content="View Student Details">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                as={Link} 
                                href={route('coach.students.show', item.id) + queryParamString}
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
                            My Students
                        </h2>
                        {impersonatedCoach && (
                            <Chip color="warning" variant="flat" size="sm">
                                Viewing as: {impersonatedCoach.name}
                            </Chip>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            classNames={{
                                base: "w-full sm:max-w-[15rem] h-10",
                                mainWrapper: "h-full",
                                input: "text-small",
                                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                            }}
                            placeholder="Search students..."
                            size="sm"
                            startContent={<SearchIcon size={18} />}
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>
            }
        >
            <Head title="My Students" />

            <Card className="shadow-sm">
                <Table 
                    aria-label="Students table"
                    bottomContent={
                        students.last_page > 1 ? (
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={students.current_page}
                                    total={students.last_page}
                                    onChange={(page) => {
                                        let params = { page, search };
                                        if (coachIdParam) params.coach_id = coachIdParam;
                                        router.get(route('coach.students.index'), params, { preserveScroll: true });
                                    }}
                                />
                            </div>
                        ) : null
                    }
                >
                    <TableHeader>
                        <TableColumn key="name">STUDENT</TableColumn>
                        <TableColumn key="age">AGE</TableColumn>
                        <TableColumn key="classes">MY CLASSES</TableColumn>
                        <TableColumn key="status">STATUS</TableColumn>
                        <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody items={students.data} emptyContent="No students found in your classes.">
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
