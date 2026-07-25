import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Tooltip,
    Pagination,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import { useCallback, useMemo, useState } from 'react';

// Icons
const PlusIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
            <path d="M6 12h12" />
            <path d="M12 18V6" />
        </g>
    </svg>
);

const EditIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} strokeMiterlimit={10} />
        <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} strokeMiterlimit={10} />
        <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} strokeMiterlimit={10} />
    </svg>
);

const DeleteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15833 4.56665C7.5 4.56665 5.84167 4.64998 4.18333 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M15.7084 9.16669L15.1667 17.5834C15.075 19.0084 15 19.1667 12.4417 19.1667H7.55837C5.00004 19.1667 4.92504 19.0084 4.83337 17.5834L4.29171 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);




const FilterIcon = ({size = 24, width, height, ...props}) => (
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

const ChevronDownIcon = ({ strokeWidth = 1.5, ...otherProps }) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...otherProps}>
        <path d="M19.9201 8.95001L13.4001 15.47C12.6301 16.24 11.3701 16.24 10.6001 15.47L4.08008 8.95001" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={strokeWidth} />
    </svg>
);

const columns = [
    { name: "ID", uid: "id", sortable: true },
    { name: "PACKAGE NAME", uid: "title", sortable: true },
    { name: "MONTHLY FEE (RM)", uid: "monthly_fee", sortable: true },
    { name: "COACH RATE/SESSION (RM)", uid: "coach_rate_per_session", sortable: true },
    { name: "SESSIONS/MONTH", uid: "sessions_per_month", sortable: true },
    { name: "CLASSES", uid: "classes_count", sortable: false },
    { name: "ACTIONS", uid: "actions", sortable: false },
];

const INITIAL_VISIBLE_COLUMNS = ["title", "monthly_fee", "coach_rate_per_session", "sessions_per_month", "classes_count", "actions"];

export default function Index({ auth, packages, filters }) {
    // Search & Sort State
    const [filterValue, setFilterValue] = useState(filters.search || '');
    const [sortDescriptor, setSortDescriptor] = useState({
        column: filters.sort || 'created_at',
        direction: filters.direction === 'asc' ? 'ascending' : 'descending',
    });
    const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    const [rowsPerPage, setRowsPerPage] = useState(packages.per_page || 10);
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));

    // Bulk Action State
    const [bulkActionType, setBulkActionType] = useState(null);

    const handleBulkActionOpen = (key) => {
        setBulkActionType(key);
        alert(`Bulk action ${key} is not yet implemented.`);
    };

    // Create/Edit Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        monthly_fee: '',
        coach_rate_per_session: '',
        sessions_per_month: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search Handler
    const onSearchChange = useCallback((value) => {
        if (value) {
            setFilterValue(value);
            router.get(route('admin.packages.index'), { search: value }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        } else {
            setFilterValue("");
            router.get(route('admin.packages.index'), {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }
    }, []);

    const onClear = useCallback(() => {
        setFilterValue("");
        router.get(route('admin.packages.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, []);

    const onRowsPerPageChange = useCallback((e) => {
        const perPage = Number(e.target.value);
        setRowsPerPage(perPage);
        router.get(route('admin.packages.index'), {
            ...filters,
            per_page: perPage,
            page: 1,
            search: filterValue,
        }, {
            preserveState: true,
            replace: true,
        });
    }, [filters, filterValue]);

    // Sort Handler
    const onSortChange = useCallback((descriptor) => {
        setSortDescriptor(descriptor);
        router.get(route('admin.packages.index'), {
            sort: descriptor.column,
            direction: descriptor.direction === 'ascending' ? 'asc' : 'desc',
            search: filterValue,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [filterValue]);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.packages.index'), { ...filters, page }, { preserveState: true });
    }, [filters]);

    // Modal Handlers
    const handleOpenCreate = () => {
        setEditingPackage(null);
        setFormData({ title: '', monthly_fee: '', coach_rate_per_session: '', sessions_per_month: '' });
        setErrors({});
        onOpen();
    };

    const handleOpenEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            title: pkg.title,
            monthly_fee: pkg.monthly_fee,
            coach_rate_per_session: pkg.coach_rate_per_session,
            sessions_per_month: pkg.sessions_per_month,
        });
        setErrors({});
        onOpen();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            },
        };

        if (editingPackage) {
            router.put(route('admin.packages.update', editingPackage.id), formData, options);
        } else {
            router.post(route('admin.packages.store'), formData, options);
        }
    };

    const handleOpenDelete = (pkg) => {
        setPackageToDelete(pkg);
        onDeleteOpen();
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.packages.destroy', packageToDelete.id), {
            onSuccess: () => {
                setIsDeleting(false);
                onDeleteClose();
                setPackageToDelete(null);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    // Table Content
    const renderCell = useCallback((pkg, columnKey) => {
        const cellValue = pkg[columnKey];

        switch (columnKey) {
            case "monthly_fee":
                return `RM ${Number(cellValue || 0).toFixed(2)}`;
            case "coach_rate_per_session":
                return `RM ${Number(cellValue || 0).toFixed(2)}`;
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content="Edit package">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleOpenEdit(pkg)}>
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete package">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleOpenDelete(pkg)}>
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    const headerColumns = useMemo(() => {
        if (visibleColumns === "all") return columns;

        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

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
                        placeholder="Search by package name..."
                        size="sm"
                        startContent={<SearchIcon className="text-default-300" />}
                        value={filterValue}
                        onClear={onClear}
                        onValueChange={onSearchChange}
                        variant="bordered"
                    />
                    <div className="flex gap-3">
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
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <Button color="primary" endContent={<PlusIcon />} onPress={handleOpenCreate}>
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {packages.total} packages</span>
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
    }, [filterValue, onSearchChange, onClear, visibleColumns, packages.total, rowsPerPage, onRowsPerPageChange, handleOpenCreate]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${packages.data.length} selected`}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={packages.current_page}
                    total={packages.last_page}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={packages.prev_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(packages.current_page - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={packages.next_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(packages.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [selectedKeys, packages.current_page, packages.last_page, packages.prev_page_url, packages.next_page_url, onPageChange, packages.data.length]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Packages</h2>
                        <p className="text-sm text-default-500">Manage learning packages & pricing</p>
                    </div>
                </div>
            }
        >
            <Head title="Packages" />

            <div>
                <Table
                    aria-label="Packages table"
                        isHeaderSticky
                        bottomContent={bottomContent}
                        bottomContentPlacement="outside"
                        classNames={{
                            wrapper: "bg-transparent shadow-none",
                        }}
                        selectedKeys={selectedKeys}
                        selectionMode="multiple"
                        topContent={topContent}
                        topContentPlacement="outside"
                        onSelectionChange={setSelectedKeys}
                        sortDescriptor={sortDescriptor}
                        onSortChange={onSortChange}
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
                        <TableBody items={packages.data} emptyContent={"No packages found"}>
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
                        <form onSubmit={handleSubmit}>
                            <ModalHeader className="flex flex-col gap-1">
                                {editingPackage ? 'Edit Package' : 'Add New Package'}
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Package Name"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    errorMessage={errors.title}
                                    isInvalid={!!errors.title}
                                    isRequired
                                />
                                <Input
                                    type="number"
                                    label="Sessions per Month"
                                    value={formData.sessions_per_month}
                                    onChange={(e) => setFormData({ ...formData, sessions_per_month: e.target.value })}
                                    errorMessage={errors.sessions_per_month}
                                    isInvalid={!!errors.sessions_per_month}
                                    isRequired
                                />
                                <Input
                                    type="number"
                                    label="Monthly Fee (RM)"
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">RM</span>
                                        </div>
                                    }
                                    value={formData.monthly_fee}
                                    onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                                    errorMessage={errors.monthly_fee}
                                    isInvalid={!!errors.monthly_fee}
                                    isRequired
                                />
                                <Input
                                    type="number"
                                    label="Coach Rate per Session (RM)"
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">RM</span>
                                        </div>
                                    }
                                    value={formData.coach_rate_per_session}
                                    onChange={(e) => setFormData({ ...formData, coach_rate_per_session: e.target.value })}
                                    errorMessage={errors.coach_rate_per_session}
                                    isInvalid={!!errors.coach_rate_per_session}
                                    isRequired
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" type="submit" isLoading={isSaving}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete this package?</p>
                                {packageToDelete && (
                                    <p className="font-bold">{packageToDelete.title}</p>
                                )}
                                <p className="text-sm text-gray-500">This action cannot be undone.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={handleDelete} isLoading={isDeleting}>
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
