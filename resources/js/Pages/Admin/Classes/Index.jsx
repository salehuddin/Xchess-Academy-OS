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
  Chip,
  Select,
  SelectItem,
  RadioGroup,
  Radio
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

const EyeIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
    <path d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z" fill="currentColor" />
    <path d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916ZM9.99999 13.6333C7.99166 13.6333 6.36666 12.0083 6.36666 10C6.36666 7.99165 7.99166 6.36665 9.99999 6.36665C12.0083 6.36665 13.6333 7.99165 13.6333 10C13.6333 12.0083 12.0083 13.6333 9.99999 13.6333Z" fill="currentColor" />
  </svg>
);

const columns = [
    {name: "UID", uid: "uid", sortable: true},
    {name: "CLASS NAME", uid: "name", sortable: true},
    {name: "PACKAGE", uid: "package", sortable: false},
    {name: "COACH", uid: "coach", sortable: false},
    {name: "DAY & TIME", uid: "day_time", sortable: false},
    {name: "ROOM", uid: "room", sortable: false},
    {name: "STATUS", uid: "status", sortable: true},
    {name: "ACTIONS", uid: "actions", sortable: false},
];

const INITIAL_FORM_DATA = {
    name: '',
    status: 'Active',
    mode: 'Physical',
    package_id: '',
    coach_id: '',
    day: '',
    start_time: '09:00',
    end_time: '10:00',
    room_id: '',
    zoom_link: '',
    meeting_id: '',
    link_expiry: ''
};

const TimeInput = ({ label, value, onChange, isInvalid, errorMessage, isRequired }) => {
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: '09', minute: '00' };
        const [h, m] = timeStr.split(':').map(Number);
        return {
            hour: String(h).padStart(2, '0'),
            minute: String(m).padStart(2, '0')
        };
    };

    const { hour, minute } = parseTime(value);

    const updateTime = (newH, newM) => {
        // Ensure we have valid values before updating
        if (!newH) newH = '09';
        if (!newM) newM = '00';
        const timeStr = `${newH}:${newM}`;
        onChange(timeStr);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-small text-foreground-500 after:content-['*'] after:text-danger after:ml-0.5">{label}</span>
            <div className="flex gap-2">
                <Select
                    aria-label="Hour"
                    selectedKeys={[hour]}
                    onSelectionChange={(keys) => updateTime(Array.from(keys)[0], minute)}
                    classNames={{ trigger: "min-w-[70px]" }}
                    isInvalid={isInvalid}
                >
                    {Array.from({length: 24}, (_, i) => i).map(h => (
                        <SelectItem key={String(h).padStart(2, '0')} value={String(h).padStart(2, '0')}>
                            {String(h).padStart(2, '0')}
                        </SelectItem>
                    ))}
                </Select>
                <Select
                    aria-label="Minute"
                    selectedKeys={[minute]}
                    onSelectionChange={(keys) => updateTime(hour, Array.from(keys)[0])}
                    classNames={{ trigger: "min-w-[70px]" }}
                    isInvalid={isInvalid}
                >
                    {['00', '15', '30', '45'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                </Select>
            </div>
            {isInvalid && <div className="text-tiny text-danger">{errorMessage}</div>}
        </div>
    );
};

export default function Index({ auth, classes, coaches, packages, rooms, filters }) {
    const [filterValue, setFilterValue] = useState(filters.search || '');
    const [rowsPerPage, setRowsPerPage] = useState(classes.per_page || 10);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: filters.sort || 'created_at',
        direction: filters.direction === 'asc' ? 'ascending' : 'descending',
    });

    const onRowsPerPageChange = useCallback((e) => {
        const perPage = Number(e.target.value);
        setRowsPerPage(perPage);
        router.get(route('admin.classes.index'), { ...filters, per_page: perPage, page: 1 }, { preserveState: true });
    }, [filters]);

    // Create/Edit Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Delete Modal State
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [classToDelete, setClassToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Derived State
    const filteredRooms = useMemo(() => {
        if (!formData.mode) return [];
        return rooms.filter(r => r.mode.toLowerCase() === formData.mode.toLowerCase());
    }, [rooms, formData.mode]);

    // Handlers
    const onSearchChange = useCallback((value) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue('');
            router.get(route('admin.classes.index'), { ...filters, search: '' }, { preserveState: true, replace: true });
        }
    }, [filters]);

    const onSearchSubmit = (e) => {
        if(e.key === 'Enter') {
             router.get(route('admin.classes.index'), { ...filters, search: filterValue }, { preserveState: true });
        }
    };

    const onClear = useCallback(()=>{
        setFilterValue('');
        router.get(route('admin.classes.index'), { ...filters, search: '' }, { preserveState: true });
    },[filters]);

    const onSortChange = useCallback((descriptor) => {
        setSortDescriptor(descriptor);
        const direction = descriptor.direction === 'ascending' ? 'asc' : 'desc';
        router.get(route('admin.classes.index'), {
            ...filters,
            sort: descriptor.column,
            direction: direction
        }, { preserveState: true });
    }, [filters]);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.classes.index'), { ...filters, page }, { preserveState: true });
    }, [filters]);

    // Modal Handlers
    const handleAdd = () => {
        setEditingClass(null);
        setFormData(INITIAL_FORM_DATA);
        setErrors({});
        onOpen();
    };

    const handleEdit = (chessClass) => {
        setEditingClass(chessClass);
        setFormData({
            name: chessClass.name || '',
            status: chessClass.status || 'Active',
            mode: chessClass.mode || 'Physical',
            package_id: chessClass.package_id?.toString() || '',
            coach_id: chessClass.coach_id?.toString() || '',
            day: chessClass.day || '',
            start_time: chessClass.start_time?.substring(0, 5) || '',
            end_time: chessClass.end_time?.substring(0, 5) || '',
            room_id: chessClass.room_id?.toString() || '',
            zoom_link: chessClass.zoom_link || '',
            meeting_id: chessClass.meeting_id || '',
            link_expiry: chessClass.link_expiry || ''
        });
        setErrors({});
        onOpen();
    };

    const handleDelete = (chessClass) => {
        setClassToDelete(chessClass);
        onDeleteOpen();
    };

    const handleSave = (e) => {
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
            }
        };

        if (editingClass) {
            router.put(route('admin.classes.update', editingClass.id), formData, options);
        } else {
            router.post(route('admin.classes.store'), formData, options);
        }
    };

    const handleConfirmDelete = () => {
        if (!classToDelete) return;
        setIsDeleting(true);
        router.delete(route('admin.classes.destroy', classToDelete.id), {
            onSuccess: () => {
                onDeleteClose();
                setClassToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    const renderCell = useCallback((chessClass, columnKey) => {
        const cellValue = chessClass[columnKey];
        switch (columnKey) {
            case "uid":
                return (
                     <div className="flex flex-col">
                        <p className="text-bold text-sm">{chessClass.uid || '#' + chessClass.id}</p>
                    </div>
                );
            case "name":
                return (
                     <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{chessClass.name}</p>
                    </div>
                );
            case "package":
                return (
                     <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">{chessClass.package?.title || 'N/A'}</p>
                        <p className="text-tiny text-default-500">{chessClass.package?.sessions_per_month || 0} sessions/mo</p>
                    </div>
                );
            case "coach":
                return (
                    <User
                        avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${chessClass.coach?.name || 'Unassigned'}&background=random`}}
                        description={chessClass.coach?.email}
                        name={chessClass.coach?.name || 'Unassigned'}
                    >
                        {chessClass.coach?.email}
                    </User>
                );
            case "day_time":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{chessClass.day}</p>
                        <p className="text-tiny text-default-500">
                            {chessClass.start_time?.substring(0, 5)} - {chessClass.end_time?.substring(0, 5)}
                        </p>
                    </div>
                );
            case "room":
                 return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{chessClass.room?.name || 'N/A'}</p>
                        <p className="text-tiny text-default-500 capitalize">{chessClass.mode}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip size="sm" variant="flat" color={
                        chessClass.status === 'Active' ? 'success' :
                        chessClass.status === 'Pending' ? 'warning' :
                        chessClass.status === 'Paused' ? 'default' : 'danger'
                    }>
                        {chessClass.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                         <Tooltip content="Manage Class">
                            <Link href={route('admin.classes.show', chessClass.id)}>
                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                    <EyeIcon />
                                </span>
                            </Link>
                        </Tooltip>
                        <Tooltip content="Edit Class">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEdit(chessClass)}>
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete Class">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(chessClass)}>
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
                        placeholder="Search by coach or package..."
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
                            Add New Class
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {classes.total} classes</span>
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
    }, [filterValue, onSearchChange, onSearchSubmit, onClear, classes.total, onRowsPerPageChange, rowsPerPage, handleAdd]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {classes.total} classes
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={classes.current_page}
                    total={classes.last_page}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={classes.prev_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(classes.current_page - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={classes.next_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(classes.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [classes.current_page, classes.last_page, classes.prev_page_url, classes.next_page_url, onPageChange, classes.total]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Classes</h2>
                        <p className="text-sm text-default-500">Manage classes and assignments</p>
                    </div>
                </div>
            }
        >
            <Head title="Classes" />

            <div>
                <Table
                    aria-label="Classes table"
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
                    <TableBody emptyContent="No classes found" items={classes.data}>
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSave}>
                            <ModalHeader className="flex flex-col gap-1">{editingClass ? 'Edit Class' : 'Add New Class'}</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Class Name"
                                    placeholder="Enter class name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    errorMessage={errors.name}
                                    isInvalid={!!errors.name}
                                    isRequired
                                    className="mb-2"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Status"
                                        selectedKeys={formData.status ? [formData.status] : []}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        errorMessage={errors.status}
                                        isInvalid={!!errors.status}
                                        isRequired
                                    >
                                        <SelectItem key="Active">Active</SelectItem>
                                        <SelectItem key="Pending">Pending</SelectItem>
                                        <SelectItem key="Paused">Paused</SelectItem>
                                        <SelectItem key="Stopped">Stopped</SelectItem>
                                    </Select>

                                    <RadioGroup
                                        label="Mode"
                                        orientation="horizontal"
                                        value={formData.mode}
                                        onValueChange={(val) => setFormData({...formData, mode: val, room_id: ''})}
                                        errorMessage={errors.mode}
                                        isInvalid={!!errors.mode}
                                        isRequired
                                    >
                                        <Radio value="Physical">Physical</Radio>
                                        <Radio value="Online">Online</Radio>
                                    </RadioGroup>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Package"
                                        placeholder="Select a package"
                                        selectedKeys={formData.package_id ? [formData.package_id.toString()] : []}
                                        onChange={(e) => setFormData({...formData, package_id: e.target.value})}
                                        errorMessage={errors.package_id}
                                        isInvalid={!!errors.package_id}
                                        isRequired
                                    >
                                        {packages.map((pkg) => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                {pkg.title}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Coach (Optional)"
                                        placeholder="Select a coach"
                                        selectedKeys={formData.coach_id ? [formData.coach_id.toString()] : []}
                                        onChange={(e) => setFormData({...formData, coach_id: e.target.value})}
                                        errorMessage={errors.coach_id}
                                        isInvalid={!!errors.coach_id}
                                    >
                                        {coaches.map((coach) => (
                                            <SelectItem key={coach.id} value={coach.id}>
                                                {coach.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Select
                                        label="Day"
                                        placeholder="Select day"
                                        selectedKeys={formData.day ? [formData.day] : []}
                                        onChange={(e) => setFormData({...formData, day: e.target.value})}
                                        errorMessage={errors.day}
                                        isInvalid={!!errors.day}
                                        isRequired
                                    >
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                            <SelectItem key={day}>{day}</SelectItem>
                                        ))}
                                    </Select>

                                    <TimeInput
                                        label="Start Time"
                                        value={formData.start_time}
                                        onChange={(val) => setFormData({...formData, start_time: val})}
                                        errorMessage={errors.start_time}
                                        isInvalid={!!errors.start_time}
                                        isRequired
                                    />

                                    <TimeInput
                                        label="End Time"
                                        value={formData.end_time}
                                        onChange={(val) => setFormData({...formData, end_time: val})}
                                        errorMessage={errors.end_time}
                                        isInvalid={!!errors.end_time}
                                        isRequired
                                    />
                                </div>

                                <Select
                                    label="Room"
                                    placeholder={formData.mode ? `Select ${formData.mode} room` : "Select room"}
                                    selectedKeys={formData.room_id ? [formData.room_id.toString()] : []}
                                    onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                                    errorMessage={errors.room_id}
                                    isInvalid={!!errors.room_id}
                                    isRequired
                                    isDisabled={!formData.mode}
                                >
                                    {filteredRooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id} textValue={room.name}>
                                            {room.name} ({room.location || room.platform})
                                        </SelectItem>
                                    ))}
                                </Select>

                                {formData.mode === 'Online' && (
                                    <>
                                        <Input
                                            label="Zoom Link"
                                            placeholder="Enter meeting link"
                                            value={formData.zoom_link}
                                            onChange={(e) => setFormData({...formData, zoom_link: e.target.value})}
                                            errorMessage={errors.zoom_link}
                                            isInvalid={!!errors.zoom_link}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Meeting ID"
                                                placeholder="Enter meeting ID"
                                                value={formData.meeting_id}
                                                onChange={(e) => setFormData({...formData, meeting_id: e.target.value})}
                                                errorMessage={errors.meeting_id}
                                                isInvalid={!!errors.meeting_id}
                                            />
                                            <Input
                                                type="date"
                                                label="Link Expiry"
                                                value={formData.link_expiry}
                                                onChange={(e) => setFormData({...formData, link_expiry: e.target.value})}
                                                errorMessage={errors.link_expiry}
                                                isInvalid={!!errors.link_expiry}
                                            />
                                        </div>
                                    </>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" isLoading={isSaving}>
                                    Save
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Class</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to delete this class?</p>
                                <p className="text-small text-default-500">This action cannot be undone.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>Cancel</Button>
                                <Button color="danger" onPress={handleConfirmDelete} isLoading={isDeleting}>Delete</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </AuthenticatedLayout>
    );
}
