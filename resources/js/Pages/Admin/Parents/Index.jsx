import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback, useMemo, useEffect } from 'react';
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@heroui/react";

import ParentDetailsModal from '../Students/ParentDetailsModal';
import StudentDetailsModal from '../Students/StudentDetailsModal';

// Icons (Reusing from Index.jsx or redefining if not exported)
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
    {name: "PARENT", uid: "parent", sortable: true},
    {name: "PHONE", uid: "phone", sortable: true},
    {name: "STUDENTS", uid: "students_count", sortable: false},
    {name: "ACTIONS", uid: "actions", sortable: false},
];

export default function Index({ auth, parents, filters }) {
    const [filterValue, setFilterValue] = useState(filters.search || '');
    const [rowsPerPage, setRowsPerPage] = useState(parents.per_page || 10);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: filters.sort || 'created_at',
        direction: filters.direction === 'asc' ? 'ascending' : 'descending',
    });

    // Create/Edit Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingParent, setEditingParent] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [parentToDelete, setParentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // View Modal State
    const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
    const [viewingParentId, setViewingParentId] = useState(null);

    // Student View Modal State
    const { isOpen: isStudentViewOpen, onOpen: onStudentViewOpen, onClose: onStudentViewClose } = useDisclosure();
    const [viewingStudent, setViewingStudent] = useState(null);

    const onRowsPerPageChange = useCallback((e) => {
        const perPage = Number(e.target.value);
        setRowsPerPage(perPage);
        router.get(route('admin.parents.index'), { ...filters, per_page: perPage, page: 1 }, { preserveState: true });
    }, [filters]);

    // Handlers
    const onSearchChange = useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue('');
            router.get(route('admin.parents.index'), { ...filters, search: '' }, { preserveState: true, replace: true });
        }
    }, [filters]);

    const onSearchSubmit = (e) => {
        if(e.key === 'Enter') {
             router.get(route('admin.parents.index'), { ...filters, search: filterValue }, { preserveState: true });
        }
    };

    const onClear = useCallback(()=>{
        setFilterValue('');
        router.get(route('admin.parents.index'), { ...filters, search: '' }, { preserveState: true });
    },[filters]);

    const onSortChange = useCallback((descriptor) => {
        setSortDescriptor(descriptor);
        const direction = descriptor.direction === 'ascending' ? 'asc' : 'desc';
        router.get(route('admin.parents.index'), {
            ...filters,
            sort: descriptor.column,
            direction: direction
        }, { preserveState: true });
    }, [filters]);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.parents.index'), { ...filters, page }, { preserveState: true });
    }, [filters]);

    // Modal Handlers
    const handleAdd = () => {
        setEditingParent(null);
        setFormData({ name: '', email: '', phone: '' });
        setErrors({});
        onOpen();
    };

    const handleEdit = (parent) => {
        setEditingParent(parent);
        setFormData({ name: parent.name, email: parent.email, phone: parent.phone });
        setErrors({});
        onOpen();
    };

    const handleDelete = (parent) => {
        setParentToDelete(parent);
        onDeleteOpen();
    };

    const handleView = (parent) => {
        setViewingParentId(parent.id);
        onViewOpen();
    };

    const handleStudentView = (student) => {
        setViewingStudent(student);
        onViewClose();
        onStudentViewOpen();
    };

    const handleBackToParent = () => {
        if (viewingStudent?.parent_id) {
            setViewingParentId(viewingStudent.parent_id);
        } else if (viewingStudent?.parent?.id) {
            setViewingParentId(viewingStudent.parent.id);
        }
        onStudentViewClose();
        onViewOpen();
    };

    const handleSave = () => {
        setIsSaving(true);
        setErrors({});

        const options = {
            onSuccess: () => {
                setIsSaving(false);
                onClose();
            },
            onError: (err) => {
                setIsSaving(false);
                setErrors(err);
            }
        };

        if (editingParent) {
            router.put(route('admin.parents.update', editingParent.id), formData, options);
        } else {
            router.post(route('admin.parents.store'), formData, options);
        }
    };

    const handleConfirmDelete = () => {
        if (!parentToDelete) return;
        setIsDeleting(true);
        router.delete(route('admin.parents.destroy', parentToDelete.id), {
            onSuccess: () => {
                onDeleteClose();
                setParentToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    const renderCell = useCallback((parent, columnKey) => {
        const cellValue = parent[columnKey];
        switch (columnKey) {
            case "parent":
                return (
                    <div className="cursor-pointer" onClick={() => handleView(parent)}>
                        <User
                            avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${parent.name}&background=random`}}
                            description={parent.email}
                            name={parent.name}
                        >
                            {parent.email}
                        </User>
                    </div>
                );
            case "phone":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{parent.phone || '-'}</p>
                    </div>
                );
            case "students_count":
                return (
                     <div className="flex flex-col">
                        <p className="text-bold text-sm">{parent.students_count} Students</p>
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content="Edit Parent">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(parent)}>
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Parent">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(parent)}>
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
                        placeholder="Search by name, email or phone..."
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
                            onPress={handleAdd}
                            color="primary"
                            startContent={<PlusIcon />}
                            className="font-medium"
                            size="sm"
                        >
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {parents.total} parents</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            value={rowsPerPage}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, onSearchChange, onSearchSubmit, onClear, parents.total, onRowsPerPageChange, rowsPerPage, handleAdd]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {parents.total} parents
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={parents.current_page}
                    total={parents.last_page}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={parents.prev_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(parents.current_page - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={parents.next_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(parents.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [parents.current_page, parents.last_page, parents.prev_page_url, parents.next_page_url, onPageChange, parents.total]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Parents</h2>
                        <p className="text-sm text-default-500">Manage student parents</p>
                    </div>
                </div>
            }
        >
            <Head title="Parents" />

            <div>
                <Table
                    aria-label="Parents table"
                    isHeaderSticky
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "bg-transparent shadow-none",
                    }}
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSortChange={onSortChange}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.uid}
                                align={column.uid === "actions" ? "center" : "start"}
                                allowsSorting={column.sortable}
                            >
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody emptyContent="No parents found" items={parents.data}>
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">{editingParent ? 'Edit Parent' : 'Add New Parent'}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Name"
                                    placeholder="Enter parent name"
                                    value={formData.name}
                                    onValueChange={(val) => setFormData({...formData, name: val})}
                                    errorMessage={errors.name}
                                    isInvalid={!!errors.name}
                                />
                                <Input
                                    label="Email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onValueChange={(val) => setFormData({...formData, email: val})}
                                    errorMessage={errors.email}
                                    isInvalid={!!errors.email}
                                />
                                <Input
                                    label="Phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onValueChange={(val) => setFormData({...formData, phone: val})}
                                    errorMessage={errors.phone}
                                    isInvalid={!!errors.phone}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleSave} isLoading={isSaving}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Parent</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete <b>{parentToDelete?.name}</b>?</p>
                                <p className="text-small text-default-500">This action cannot be undone. Parents with associated students cannot be deleted.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="danger" onPress={handleConfirmDelete} isLoading={isDeleting}>Delete</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* View Modal */}
            <ParentDetailsModal
                isOpen={isViewOpen}
                onClose={onViewClose}
                parentId={viewingParentId}
                onStudentClick={handleStudentView}
            />

            {/* Student View Modal */}
            {viewingStudent && (
                <StudentDetailsModal
                    isOpen={isStudentViewOpen}
                    onClose={onStudentViewClose}
                    student={viewingStudent}
                    onViewParent={handleBackToParent}
                />
            )}
        </AuthenticatedLayout>
    );
}
