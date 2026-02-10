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
  ButtonGroup,
  Chip,
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
  Select,
  SelectItem,
  RadioGroup,
  Radio,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import StudentDetailsModal from './StudentDetailsModal';
import ParentDetailsModal from './ParentDetailsModal';

// Icons
export const SearchIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

export const ChevronDownIcon = ({strokeWidth = 1.5, ...otherProps}) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...otherProps}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={strokeWidth}
    />
  </svg>
);

export const EditIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
    <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
    <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
  </svg>
);

export const DeleteIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.25835 7.5 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
  </svg>
);

export const PlusIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M6 12h12" />
      <path d="M12 18V6" />
    </g>
  </svg>
);

export const FilterIcon = ({size = 24, width, height, ...props}) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={height || size}
    role="presentation"
    viewBox="0 0 24 24"
    width={width || size}
    {...props}
  >
    <path
      d="M3 6h18M6 12h12M10 18h4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

const statusColorMap = {
    Active: "success",
    Suspended: "danger",
    Inactive: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["student", "nric", "level", "preferred_language", "date_of_registration", "parent", "status", "actions"];
const LOCKED_COLUMNS = new Set(["student", "actions"]);

const columns = [
    {name: "STUDENT", uid: "student", sortable: true},
    {name: "ID / PASSPORT", uid: "nric", sortable: true},
    {name: "LEVEL", uid: "level", sortable: true},
    {name: "LANGUAGE", uid: "preferred_language", sortable: true},
    {name: "DATE REGISTERED", uid: "date_of_registration", sortable: true},
    {name: "PARENT", uid: "parent", sortable: true},
    {name: "STATUS", uid: "status", sortable: true},
    {name: "ACTIONS", uid: "actions", sortable: false},
];

const statusOptions = [
    {name: "Active", uid: "Active"},
    {name: "Suspended", uid: "Suspended"},
    {name: "Inactive", uid: "Inactive"},
];

export default function Index({ auth, students, filters, parents }) {
    // State
    const [filterValue, setFilterValue] = useState(filters.search || '');
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState(filters.status ? new Set(filters.status.split(',')) : "all");
    const [rowsPerPage, setRowsPerPage] = useState(students.per_page || 10);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: filters.sort || 'created_at',
        direction: filters.direction === 'asc' ? 'ascending' : 'descending',
    });

    // Filter Modal State
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const [parentStatus, setParentStatus] = useState(filters.parent_status || 'all');
    const [selectedParentFilter, setSelectedParentFilter] = useState(filters.parent_id ? Number(filters.parent_id) : null);
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Sync state with filters prop
    useEffect(() => {
        setParentStatus(filters.parent_status || 'all');
        setSelectedParentFilter(filters.parent_id ? Number(filters.parent_id) : null);
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
    }, [filters]);

    // Modal State
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Parent Modal State
    const { isOpen: isParentOpen, onOpen: onParentOpen, onClose: onParentClose } = useDisclosure();
    const [selectedParentId, setSelectedParentId] = useState(null);

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Bulk Action State
    const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();
    const [bulkActionType, setBulkActionType] = useState(null);
    const [bulkActionValue, setBulkActionValue] = useState("");
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Derived State
    const headerColumns = useMemo(() => {
        if (visibleColumns === "all") return columns;
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    // Handlers
    const onVisibleColumnsChange = useCallback((keys) => {
        const next = keys === "all" ? new Set(columns.map((c) => c.uid)) : new Set(keys);
        for (const lockedKey of LOCKED_COLUMNS) {
            next.add(lockedKey);
        }
        setVisibleColumns(next);
    }, []);

    const handleStudentClick = useCallback((student) => {
        setSelectedStudent(student);
        onOpen();
    }, [onOpen]);

    const handleParentClick = useCallback((parentId) => {
        if (!parentId) return;
        setSelectedParentId(parentId);
        onParentOpen();
    }, [onParentOpen]);

    const handleDeleteClick = useCallback((student) => {
        setStudentToDelete(student);
        onDeleteOpen();
    }, [onDeleteOpen]);

    const handleConfirmDelete = () => {
        if (!studentToDelete) return;

        setIsDeleting(true);
        router.delete(route('admin.students.destroy', studentToDelete.id), {
            onSuccess: () => {
                onDeleteClose();
                setStudentToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    const onSearchChange = useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue('');
            router.get(route('admin.students.index'), { ...filters, search: '' }, { preserveState: true, replace: true });
        }
    }, [filters]);

    // Debounce search
    const onSearchSubmit = (e) => {
        if(e.key === 'Enter') {
             router.get(route('admin.students.index'), { ...filters, search: filterValue }, { preserveState: true });
        }
    };

    const onClear = useCallback(()=>{
        setFilterValue('');
        router.get(route('admin.students.index'), { ...filters, search: '' }, { preserveState: true });
    },[filters]);

    const onStatusChange = useCallback((keys) => {
        setStatusFilter(keys);
        const status = Array.from(keys).join(',');
        router.get(route('admin.students.index'), { ...filters, status: status === 'all' ? '' : status }, { preserveState: true });
    }, [filters]);

    const onRowsPerPageChange = useCallback((e) => {
        const perPage = Number(e.target.value);
        setRowsPerPage(perPage);
        router.get(route('admin.students.index'), { ...filters, per_page: perPage, page: 1 }, { preserveState: true });
    }, [filters]);

    const onSortChange = useCallback((descriptor) => {
        setSortDescriptor(descriptor);
        const direction = descriptor.direction === 'ascending' ? 'asc' : 'desc';
        router.get(route('admin.students.index'), {
            ...filters,
            sort: descriptor.column,
            direction: direction
        }, { preserveState: true });
    }, [filters]);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.students.index'), { ...filters, page }, { preserveState: true });
    }, [filters]);

    const renderCell = useCallback((student, columnKey) => {
        const cellValue = student[columnKey];
        switch (columnKey) {
            case "student":
                return (
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity min-w-[200px]"
                        onClick={() => handleStudentClick(student)}
                    >
                        <User
                            avatarProps={{
                                radius: "lg",
                                src: `https://ui-avatars.com/api/?name=${student.name}&background=random`,
                                className: "flex-shrink-0"
                            }}
                            description={student.email}
                            name={
                                <div className="whitespace-normal break-words">
                                    {student.name}
                                </div>
                            }
                            classNames={{
                                base: "gap-3",
                                name: "whitespace-normal break-words",
                                description: "truncate w-full"
                            }}
                        >
                            {student.email}
                        </User>
                    </div>
                );
            case "nric":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{student.nric_passport || '-'}</p>
                        <p className="text-tiny text-default-400">{student.student_uid}</p>
                    </div>
                );
            case "level":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{student.current_level || '-'}</p>
                    </div>
                );
            case "preferred_language":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{student.preferred_language || '-'}</p>
                    </div>
                );
            case "date_of_registration": {
                const rawDate = student.date_of_registration || student.created_at;
                if (!rawDate) {
                    return <span>-</span>;
                }

                const dateCandidate =
                    typeof rawDate === "string" && rawDate.length === 10
                        ? new Date(`${rawDate}T00:00:00`)
                        : new Date(rawDate);

                const formatted = Number.isNaN(dateCandidate.getTime())
                    ? rawDate
                    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(dateCandidate);

                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{formatted}</p>
                    </div>
                );
            }
             case "parent":
                return (
                    <div
                        className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleParentClick(student.parent_id)}
                    >
                        <p className="text-bold text-sm capitalize">{student.parent?.name || '-'}</p>
                        <p className="text-tiny text-default-400">{student.parent?.phone || '-'}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip className="capitalize" color={statusColorMap[student.status]} size="sm" variant="flat">
                        {cellValue}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content="Edit Student">
                            <Link href={route('admin.students.edit', student.id)}>
                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                    <EditIcon />
                                </span>
                            </Link>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Student">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDeleteClick(student)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, [handleStudentClick]);

    const handleBulkActionOpen = (type) => {
        setBulkActionType(type);
        setBulkActionValue("");
        onBulkOpen();
    };

    const handleBulkSubmit = () => {
        setIsBulkProcessing(true);

        let ids = [];
        if (selectedKeys === "all") {
            ids = students.data.map(s => s.id);
        } else {
            ids = Array.from(selectedKeys);
        }

        router.post(route('admin.students.bulk-action'), {
            ids: ids,
            action: bulkActionType,
            value: bulkActionValue
        }, {
            onSuccess: () => {
                setIsBulkProcessing(false);
                onBulkClose();
                setSelectedKeys(new Set([]));
                setBulkActionType(null);
                setBulkActionValue("");
            },
            onError: () => {
                setIsBulkProcessing(false);
            }
        });
    };

    const handleApplyFilters = () => {
        const params = { ...filters, page: 1 };

        if (parentStatus !== 'all') {
            params.parent_status = parentStatus;
            if (parentStatus === 'specific' && selectedParentFilter) {
                params.parent_id = selectedParentFilter;
            } else {
                delete params.parent_id;
            }
        } else {
            delete params.parent_status;
            delete params.parent_id;
        }

        if (dateFrom) params.date_from = dateFrom; else delete params.date_from;
        if (dateTo) params.date_to = dateTo; else delete params.date_to;

        router.get(route('admin.students.index'), params, { preserveState: true });
        onFilterClose();
    };

    const removeFilter = (type) => {
        const params = { ...filters, page: 1 };
        if (type === 'parent') {
            delete params.parent_status;
            delete params.parent_id;
            setParentStatus('all');
            setSelectedParentFilter(null);
        } else if (type === 'date') {
            delete params.date_from;
            delete params.date_to;
            setDateFrom('');
            setDateTo('');
        }
        router.get(route('admin.students.index'), params, { preserveState: true });
    };

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
                        placeholder="Search by name..."
                        size="sm"
                        startContent={<SearchIcon className="text-default-300" />}
                        value={filterValue}
                        onClear={onClear}
                        onValueChange={onSearchChange}
                        onKeyDown={onSearchSubmit}
                        variant="bordered"
                    />
                    <div className="flex gap-3">
                        {selectedKeys.size > 0 || selectedKeys === "all" ? (
                            <Dropdown>
                                <DropdownTrigger className="hidden sm:flex">
                                    <Button endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat" color="primary">
                                        Bulk Actions
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label="Bulk Actions"
                                    onAction={(key) => handleBulkActionOpen(key)}
                                >
                                    <DropdownItem key="update_status">Change Status</DropdownItem>
                                    <DropdownItem key="update_level">Change Level</DropdownItem>
                                    <DropdownItem key="update_language">Change Language</DropdownItem>
                                    <DropdownItem key="delete" className="text-danger" color="danger">Delete</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        ) : null}
                        <Button
                            onPress={onFilterOpen}
                            startContent={<FilterIcon />}
                            variant="flat"
                            size="sm"
                        >
                            Filters
                        </Button>
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat">
                                    Status
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={statusFilter}
                                selectionMode="multiple"
                                onSelectionChange={onStatusChange}
                            >
                                {statusOptions.map((status) => (
                                    <DropdownItem key={status.uid} className="capitalize">
                                        {status.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} size="sm" variant="flat">
                                    Columns
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={onVisibleColumnsChange}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize" isDisabled={LOCKED_COLUMNS.has(column.uid)}>
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                        <ButtonGroup size="sm" color="primary">
                            <Button
                                as={Link}
                                href={route('admin.students.create')}
                                startContent={<PlusIcon />}
                                className="font-medium"
                            >
                                Add New
                            </Button>
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Button isIconOnly className="w-unit-8 min-w-unit-8">
                                        <ChevronDownIcon />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Create Actions">
                                    <DropdownItem
                                        key="bulk_create"
                                        description="Register multiple students at once"
                                        startContent={<PlusIcon />}
                                        onPress={() => router.visit(route('admin.students.bulk-create'))}
                                    >
                                        Bulk Register
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </ButtonGroup>
                    </div>
                </div>
                {(filters.parent_status || filters.date_from || filters.date_to) && (
                    <div className="flex gap-2 flex-wrap">
                        {filters.parent_status && (
                            <Chip onClose={() => removeFilter('parent')} variant="flat" color="primary">
                                Parent: {filters.parent_status === 'no_parent' ? 'None' : (filters.parent_status === 'specific' ? (parents?.find(p => p.id == filters.parent_id)?.name || 'Specific') : 'All')}
                            </Chip>
                        )}
                        {(filters.date_from || filters.date_to) && (
                            <Chip onClose={() => removeFilter('date')} variant="flat" color="primary">
                                Date: {filters.date_from || 'Any'} - {filters.date_to || 'Any'}
                            </Chip>
                        )}
                    </div>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {students.total} students</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            value={rowsPerPage}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [filterValue, statusFilter, visibleColumns, onSearchChange, onRowsPerPageChange, students.total, rowsPerPage, onClear, onStatusChange, onSearchSubmit, selectedKeys, filters, parents, onFilterOpen, onVisibleColumnsChange]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${students.data.length} selected`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={students.current_page}
                    total={students.last_page}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={students.prev_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(students.current_page - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={students.next_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(students.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [selectedKeys, students.current_page, students.last_page, students.prev_page_url, students.next_page_url, onPageChange, students.data.length]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Students</h2>
                        <p className="text-sm text-default-500">Manage your student database</p>
                    </div>
                </div>
            }
        >
            <Head title="Students" />

            <div>
                <Table
                    aria-label="Students table with custom cells, pagination and sorting"
                    isHeaderSticky
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "max-h-[382px] bg-transparent shadow-none",
                    }}
                    selectedKeys={selectedKeys}
                    selectionMode="multiple"
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSelectionChange={setSelectedKeys}
                    onSortChange={onSortChange}
                    onRowAction={() => {}}
                >
                    <TableHeader columns={headerColumns}>
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
                    <TableBody emptyContent="No students found" items={students.data}>
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Filter Modal */}
            <Modal isOpen={isFilterOpen} onClose={onFilterClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Filter Students</ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            {/* Parent Filter */}
                            <div className="flex flex-col gap-2">
                                <span className="text-small font-bold text-default-500">Parent Status</span>
                                <RadioGroup
                                    orientation="horizontal"
                                    value={parentStatus}
                                    onValueChange={setParentStatus}
                                >
                                    <Radio value="all">All</Radio>
                                    <Radio value="specific">Specific Parent</Radio>
                                    <Radio value="no_parent">No Parent</Radio>
                                </RadioGroup>
                                {parentStatus === 'specific' && (
                                    <Autocomplete
                                        label="Select Parent"
                                        placeholder="Search parent..."
                                        defaultItems={parents || []}
                                        selectedKey={selectedParentFilter}
                                        onSelectionChange={setSelectedParentFilter}
                                    >
                                        {(parent) => <AutocompleteItem key={parent.id}>{parent.name}</AutocompleteItem>}
                                    </Autocomplete>
                                )}
                            </div>

                            {/* Date Filter */}
                            <div className="flex flex-col gap-2">
                                <span className="text-small font-bold text-default-500">Registration Date</span>
                                <div className="flex gap-2">
                                    <Input
                                        type="date"
                                        label="From"
                                        placeholder=" "
                                        value={dateFrom}
                                        onValueChange={setDateFrom}
                                    />
                                    <Input
                                        type="date"
                                        label="To"
                                        placeholder=" "
                                        value={dateTo}
                                        onValueChange={setDateTo}
                                    />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onFilterClose}>
                            Close
                        </Button>
                        <Button color="primary" onPress={handleApplyFilters}>
                            Apply Filters
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <StudentDetailsModal
                isOpen={isOpen}
                onClose={onClose}
                student={selectedStudent}
                onViewParent={() => {
                    onClose();
                    handleParentClick(selectedStudent?.parent_id);
                }}
            />

            <ParentDetailsModal
                isOpen={isParentOpen}
                onClose={onParentClose}
                parentId={selectedParentId}
                onStudentClick={(student) => {
                    onParentClose();
                    // Small timeout to ensure modal closes before opening the new one
                    // and to let the state update properly
                    setTimeout(() => {
                        handleStudentClick(student);
                    }, 100);
                }}
            />

            <Modal
                isOpen={isBulkOpen}
                onClose={onBulkClose}
                size="sm"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {bulkActionType === 'delete' ? 'Delete Students' :
                                 bulkActionType === 'update_status' ? 'Update Status' :
                                 bulkActionType === 'update_level' ? 'Update Level' :
                                 'Update Language'}
                            </ModalHeader>
                            <ModalBody>
                                {bulkActionType === 'delete' ? (
                                    <p>Are you sure you want to delete the selected students? This action cannot be undone.</p>
                                ) : bulkActionType === 'update_status' ? (
                                    <Select
                                        label="Status"
                                        placeholder="Select a status"
                                        selectedKeys={bulkActionValue ? [bulkActionValue] : []}
                                        onChange={(e) => setBulkActionValue(e.target.value)}
                                    >
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status.uid} value={status.uid}>
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                ) : bulkActionType === 'update_level' ? (
                                    <Select
                                        label="Level"
                                        placeholder="Select a level"
                                        selectedKeys={bulkActionValue ? [bulkActionValue] : []}
                                        onChange={(e) => setBulkActionValue(e.target.value)}
                                    >
                                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <Select
                                        label="Language"
                                        placeholder="Select a language"
                                        selectedKeys={bulkActionValue ? [bulkActionValue] : []}
                                        onChange={(e) => setBulkActionValue(e.target.value)}
                                    >
                                        {['Bahasa Melayu', 'English', 'Mandarin', 'Tamil'].map((lang) => (
                                            <SelectItem key={lang} value={lang}>
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color={bulkActionType === 'delete' ? "danger" : "primary"}
                                    onPress={handleBulkSubmit}
                                    isLoading={isBulkProcessing}
                                >
                                    {bulkActionType === 'delete' ? 'Delete' : 'Update'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                size="sm"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Student</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to delete <b>{studentToDelete?.name}</b>?
                                    This action will move the student to the trash.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleConfirmDelete}
                                    isLoading={isDeleting}
                                >
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
