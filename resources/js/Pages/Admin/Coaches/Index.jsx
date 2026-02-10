import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  User,
  Pagination,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip
} from "@heroui/react";

// Icons
const SearchIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

const EditIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
    <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
    <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
  </svg>
);

const DeleteIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.25835 7.5 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
  </svg>
);

const PlusIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

const columns = [
    {name: "NAME", uid: "name"},
    {name: "ROLE", uid: "role"},
    {name: "PHONE", uid: "phone"},
    {name: "LEVEL", uid: "level"},
    {name: "HOURLY RATE", uid: "hourly_rate"},
    {name: "ACTIONS", uid: "actions"},
];

export default function Index({ auth, coaches, filters }) {
    const [filterValue, setFilterValue] = useState(filters.search || '');

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [coachToDelete, setCoachToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Handlers
    const onSearchChange = useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue('');
            router.get(route('admin.coaches.index'), { search: '' }, { preserveState: true, replace: true });
        }
    }, []);

    const onSearchSubmit = (e) => {
        if(e.key === 'Enter') {
             router.get(route('admin.coaches.index'), { search: filterValue }, { preserveState: true });
        }
    };

    const onClear = useCallback(()=>{
        setFilterValue('');
        router.get(route('admin.coaches.index'), { search: '' }, { preserveState: true });
    },[]);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.coaches.index'), { search: filterValue, page }, { preserveState: true });
    }, [filterValue]);

    const handleDelete = (coach) => {
        setCoachToDelete(coach);
        onDeleteOpen();
    };

    const handleConfirmDelete = () => {
        if (!coachToDelete) return;
        setIsDeleting(true);
        router.delete(route('admin.coaches.destroy', coachToDelete.id), {
            onSuccess: () => {
                onDeleteClose();
                setCoachToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    const renderCell = useCallback((coach, columnKey) => {
        const cellValue = coach[columnKey];
        switch (columnKey) {
            case "name":
                return (
                    <User
                        avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${coach.name}&background=random`}}
                        description={coach.email}
                        name={coach.name}
                    >
                        {coach.email}
                    </User>
                );
            case "role":
                return (
                    <Chip size="sm" variant="flat" color={coach.role === 'Admin' ? 'warning' : 'primary'}>
                        {coach.role}
                    </Chip>
                );
            case "phone":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{coach.coach_profile?.phone || '-'}</p>
                    </div>
                );
            case "level":
                return (
                     <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{coach.coach_profile?.level || '-'}</p>
                    </div>
                );
            case "hourly_rate":
                return (
                     <div className="flex flex-col">
                        <p className="text-bold text-sm">
                            RM {coach.coach_profile?.hourly_rate || coach.hourly_rate || '0.00'}
                        </p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit Coach">
                            <Link href={route('admin.coaches.edit', coach.id)}>
                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                    <EditIcon />
                                </span>
                            </Link>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Coach">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(coach)}>
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[44%]",
                            inputWrapper: "border-1",
                        }}
                        placeholder="Search by name, email, phone..."
                        size="sm"
                        startContent={<SearchIcon className="text-default-300" />}
                        value={filterValue}
                        onClear={onClear}
                        onValueChange={onSearchChange}
                        onKeyDown={onSearchSubmit}
                        variant="bordered"
                    />
                    <div className="flex gap-3">
                        <Button
                            as={Link}
                            href={route('admin.coaches.create')}
                            color="primary"
                            startContent={<PlusIcon />}
                            className="font-medium"
                            size="sm"
                        >
                            Add New Coach
                        </Button>
                    </div>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onSearchSubmit, onClear]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {coaches.total} coaches
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={coaches.current_page}
                    total={coaches.last_page}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={coaches.prev_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(coaches.current_page - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={coaches.next_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(coaches.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [coaches.current_page, coaches.last_page, coaches.prev_page_url, coaches.next_page_url, onPageChange, coaches.total]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Coaches</h2>
                        <p className="text-sm text-default-500">Manage coach profiles and assignments</p>
                    </div>
                </div>
            }
        >
            <Head title="Coaches" />

            <div>
                <Table
                    aria-label="Coaches table"
                    isHeaderSticky
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "max-h-[382px] bg-transparent shadow-none",
                    }}
                    topContent={topContent}
                    topContentPlacement="outside"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.uid}
                                align={column.uid === "actions" ? "center" : "start"}
                            >
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody emptyContent="No coaches found" items={coaches.data}>
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Coach</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete <b>{coachToDelete?.name}</b>?</p>
                                <p className="text-small text-default-500">This action cannot be undone. All associated data will be removed.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={handleConfirmDelete} isLoading={isDeleting}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </AuthenticatedLayout>
    );
}
