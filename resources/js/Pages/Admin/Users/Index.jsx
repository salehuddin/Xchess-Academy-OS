import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User as UserAvatar,
    Pagination,
    Select,
    SelectItem,
    Button,
    Chip,
    Input,
    Checkbox,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";

// Standard SVG Icons
const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const PlusIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
        <path d="M7.08331 4.14165L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14165" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M15.2083 7.625L14.6667 16.0167C14.575 17.2583 14.5 18.3333 12.2917 18.3333H7.70833C5.5 18.3333 5.425 17.2583 5.33333 16.0167L4.79167 7.625" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M8.59998 13.75H11.3916" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M7.89998 10H12.1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

export default function Index({ users, roles, filters }) {
    const { flash = {}, auth } = usePage().props;
    const authUser = auth.user;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState(filters.role || '');
    const rowsPerPage = filters?.per_page || 10;

    // Modals state
    const createModal = useDisclosure();
    const editModal = useDisclosure();
    const deleteModal = useDisclosure();

    const [selectedUser, setSelectedUser] = useState(null);

    // Create Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'Admin',
        is_coach: false,
        hourly_rate: 0,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'Admin',
        is_coach: false,
        hourly_rate: 0,
    });

    // Search and Filter Handlers
    const handleSearchChange = (val) => {
        setSearch(val);
        router.get(
            route('admin.users.index'),
            { search: val, role: selectedRoleFilter, per_page: rowsPerPage, page: 1 },
            { preserveState: true }
        );
    };

    const handleRoleFilterChange = (keys) => {
        const val = Array.from(keys)[0] || '';
        setSelectedRoleFilter(val);
        router.get(
            route('admin.users.index'),
            { search, role: val, per_page: rowsPerPage, page: 1 },
            { preserveState: true }
        );
    };

    const onRowsPerPageChange = (e) => {
        const perPage = Number(e.target.value);
        router.get(
            route('admin.users.index'),
            { search, role: selectedRoleFilter, per_page: perPage, page: 1 },
            { preserveState: true }
        );
    };

    // Modal Handlers
    const openEditModal = (user) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            is_coach: !!user.is_coach,
            hourly_rate: user.hourly_rate || 0,
        });
        editForm.clearErrors();
        editModal.onOpen();
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        deleteModal.onOpen();
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                createModal.onClose();
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                editModal.onClose();
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        router.delete(route('admin.users.destroy', selectedUser.id), {
            onSuccess: () => {
                deleteModal.onClose();
            },
        });
    };

    const renderRoleChips = (user) => {
        const chips = [];
        switch (user.role) {
            case 'Admin':
                chips.push(<Chip key="role" size="sm" color="danger" variant="flat">Admin</Chip>);
                break;
            case 'Ops':
                chips.push(<Chip key="role" size="sm" color="primary" variant="flat">Ops</Chip>);
                break;
            case 'Finance':
                chips.push(<Chip key="role" size="sm" color="warning" variant="flat">Finance</Chip>);
                break;
            case 'Coach':
                chips.push(<Chip key="role" size="sm" color="secondary" variant="flat">Coach</Chip>);
                break;
            default:
                chips.push(<Chip key="role" size="sm" color="default" variant="flat">{user.role}</Chip>);
        }

        if (user.is_coach && user.role !== 'Coach') {
            chips.push(<Chip key="is_coach" size="sm" color="secondary" variant="dot">+ Coach</Chip>);
        }

        return <div className="flex items-center gap-1.5 flex-wrap">{chips}</div>;
    };

    const columns = [
        { name: "USER", uid: "user" },
        { name: "ROLE & CAPABILITIES", uid: "role" },
        { name: "HOURLY RATE", uid: "hourly_rate" },
        { name: "CREATED DATE", uid: "created" },
        { name: "ACTIONS", uid: "actions" },
    ];

    const renderCell = useCallback((user, columnKey) => {
        switch (columnKey) {
            case "user":
                return (
                    <UserAvatar
                        avatarProps={{ radius: "lg", src: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random` }}
                        description={user.email}
                        name={user.name}
                    >
                        {user.email}
                    </UserAvatar>
                );
            case "role":
                return renderRoleChips(user);
            case "hourly_rate":
                return (
                    <span className="font-mono text-sm">RM{Number(user.hourly_rate || 0).toFixed(2)}/hr</span>
                );
            case "created":
                return (
                    <span className="text-xs text-default-500 whitespace-nowrap">
                        {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(user.created_at))}
                    </span>
                );
            case "actions":
                return (
                    <div className="relative flex items-center justify-center gap-2">
                        <Tooltip content="Edit User">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => openEditModal(user)}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>
                        {user.id !== authUser.id && (
                            <Tooltip color="danger" content="Delete User">
                                <span
                                    className="text-lg text-danger cursor-pointer active:opacity-50"
                                    onClick={() => openDeleteModal(user)}
                                >
                                    <DeleteIcon />
                                </span>
                            </Tooltip>
                        )}
                    </div>
                );
            default:
                return user[columnKey];
        }
    }, [authUser.id]);

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
                        placeholder="Search by name or email..."
                        size="sm"
                        startContent={<SearchIcon className="text-default-300" />}
                        value={search}
                        onClear={() => handleSearchChange('')}
                        onValueChange={handleSearchChange}
                    />
                    <div className="flex gap-3 items-center">
                        <Select
                            size="sm"
                            placeholder="All Roles"
                            className="w-36"
                            selectedKeys={selectedRoleFilter ? [selectedRoleFilter] : []}
                            onSelectionChange={handleRoleFilterChange}
                        >
                            {roles.map((r) => (
                                <SelectItem key={r} textValue={r}>{r}</SelectItem>
                            ))}
                        </Select>
                        <Button
                            color="primary"
                            size="sm"
                            startContent={<PlusIcon />}
                            onPress={createModal.onOpen}
                            className="font-medium"
                        >
                            Add New User
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {users.total} users</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small ml-1"
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
    }, [search, selectedRoleFilter, users.total, rowsPerPage, roles]);

    return (
        <AuthenticatedLayout
            user={authUser}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">User Management</h2>
                        <p className="text-sm text-gray-500">Manage system users, staff roles, and dual-role coaches</p>
                    </div>
                </div>
            }
        >
            <Head title="User Management" />

            <div className="space-y-6">
                {flash.success && (
                    <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Success! </strong>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash.error && (
                    <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span>{flash.error}</span>
                    </div>
                )}

                <Table
                    aria-label="Users table"
                    isHeaderSticky
                    topContent={topContent}
                    topContentPlacement="outside"
                    bottomContent={
                        users.last_page > 1 ? (
                            <div className="flex w-full justify-center px-4 py-4 border-t border-gray-100">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={users.current_page}
                                    total={users.last_page}
                                    onChange={(page) => {
                                        router.get(route('admin.users.index', { ...filters, page }), {}, { preserveState: true });
                                    }}
                                />
                            </div>
                        ) : null
                    }
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "bg-transparent shadow-none",
                    }}
                    selectionMode="none"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={users.data} emptyContent={"No users found."}>
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create User Modal */}
            <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="lg">
                <ModalContent>
                    <form onSubmit={handleCreateSubmit}>
                        <ModalHeader className="font-bold">Add New System User</ModalHeader>
                        <ModalBody className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Full Name</label>
                                <Input
                                    placeholder="e.g. Alex Morgan"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    isInvalid={!!createForm.errors.name}
                                    errorMessage={createForm.errors.name}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="e.g. alex@xchess-academy.com"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    isInvalid={!!createForm.errors.email}
                                    errorMessage={createForm.errors.email}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Password</label>
                                <Input
                                    type="password"
                                    placeholder="Minimum 8 characters"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    isInvalid={!!createForm.errors.password}
                                    errorMessage={createForm.errors.password}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Primary Role</label>
                                    <Select
                                        selectedKeys={[createForm.data.role]}
                                        onSelectionChange={(keys) => createForm.setData('role', Array.from(keys)[0])}
                                        required
                                    >
                                        {roles.map((r) => (
                                            <SelectItem key={r} textValue={r}>{r}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Hourly Rate (RM)</label>
                                    <Input
                                        type="number"
                                        step="0.50"
                                        placeholder="0.00"
                                        value={createForm.data.hourly_rate}
                                        onChange={(e) => createForm.setData('hourly_rate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Checkbox
                                    isSelected={createForm.data.is_coach}
                                    onValueChange={(val) => createForm.setData('is_coach', val)}
                                >
                                    <span className="text-sm font-medium">Also acts as a Coach (Teaches classes & earns session pay)</span>
                                </Checkbox>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={createModal.onClose}>Cancel</Button>
                            <Button color="primary" type="submit" isLoading={createForm.processing}>Create User</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* Edit User Modal */}
            <Modal isOpen={editModal.isOpen} onClose={editModal.onClose} size="lg">
                <ModalContent>
                    <form onSubmit={handleEditSubmit}>
                        <ModalHeader className="font-bold">Edit User: {selectedUser?.name}</ModalHeader>
                        <ModalBody className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Full Name</label>
                                <Input
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    isInvalid={!!editForm.errors.name}
                                    errorMessage={editForm.errors.name}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Email Address</label>
                                <Input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    isInvalid={!!editForm.errors.email}
                                    errorMessage={editForm.errors.email}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-default-700 mb-1">Reset Password (Optional)</label>
                                <Input
                                    type="password"
                                    placeholder="Leave blank to keep existing password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    isInvalid={!!editForm.errors.password}
                                    errorMessage={editForm.errors.password}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Primary Role</label>
                                    <Select
                                        selectedKeys={[editForm.data.role]}
                                        onSelectionChange={(keys) => editForm.setData('role', Array.from(keys)[0])}
                                        isDisabled={selectedUser?.id === authUser.id}
                                    >
                                        {roles.map((r) => (
                                            <SelectItem key={r} textValue={r}>{r}</SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-default-700 mb-1">Hourly Rate (RM)</label>
                                    <Input
                                        type="number"
                                        step="0.50"
                                        value={editForm.data.hourly_rate}
                                        onChange={(e) => editForm.setData('hourly_rate', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Checkbox
                                    isSelected={editForm.data.is_coach}
                                    onValueChange={(val) => editForm.setData('is_coach', val)}
                                >
                                    <span className="text-sm font-medium">Also acts as a Coach (Teaches classes & earns session pay)</span>
                                </Checkbox>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={editModal.onClose}>Cancel</Button>
                            <Button color="primary" type="submit" isLoading={editForm.processing}>Save Changes</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* Delete User Modal */}
            <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
                <ModalContent>
                    <ModalHeader className="font-bold text-danger-600">Delete User Account</ModalHeader>
                    <ModalBody>
                        <p className="text-sm">
                            Are you sure you want to delete the user account for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
                        </p>
                        <p className="text-xs text-default-500 mt-2">This action cannot be undone.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={deleteModal.onClose}>Cancel</Button>
                        <Button color="danger" onPress={handleDeleteSubmit}>Confirm Delete</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AuthenticatedLayout>
    );
}
