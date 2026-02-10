import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useCallback } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Pagination,
  Select,
  SelectItem,
  Button,
  Card,
  CardBody
} from "@heroui/react";

function RoleSelect({ userId, currentRole, roles, disabled }) {
    const { data, setData, put, processing } = useForm({
        role: currentRole,
    });

    const handleSelectionChange = (e) => {
        setData('role', e.target.value);
    };

    const handleSubmit = () => {
         put(route('admin.users.role.update', userId), {
            preserveScroll: true,
        });
    }

    return (
        <div className="flex items-center gap-2">
            <Select
                aria-label="Select role"
                size="sm"
                className="w-32"
                selectedKeys={data.role ? [data.role] : []}
                onChange={handleSelectionChange}
                isDisabled={disabled || processing}
                variant="bordered"
            >
                {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                        {role}
                    </SelectItem>
                ))}
            </Select>
            <Button
                size="sm"
                color="primary"
                variant="flat"
                isDisabled={disabled || processing || data.role === currentRole}
                onPress={handleSubmit}
            >
                Save
            </Button>
        </div>
    );
}

export default function Index({ users, roles }) {
    const authUser = usePage().props.auth.user;

    const columns = [
        {name: "USER", uid: "user"},
        {name: "ROLE", uid: "role"},
        {name: "CREATED", uid: "created"},
    ];

    const renderCell = useCallback((user, columnKey) => {
        switch (columnKey) {
            case "user":
                return (
                    <User
                        avatarProps={{radius: "lg", src: `https://ui-avatars.com/api/?name=${user.name}&background=random`}}
                        description={user.email}
                        name={user.name}
                    >
                        {user.email}
                    </User>
                );
            case "role":
                return (
                    <RoleSelect
                        userId={user.id}
                        currentRole={user.role}
                        roles={roles}
                        disabled={user.id === authUser.id}
                    />
                );
            case "created":
                 return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm text-default-400">
                             {new Date(user.created_at).toLocaleDateString()}
                        </p>
                    </div>
                );
            default:
                return user[columnKey];
        }
    }, [roles, authUser.id]);

    return (
        <AuthenticatedLayout
            user={authUser}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">User Management</h2>
                        <p className="text-sm text-gray-500">Manage system users and roles</p>
                    </div>
                </div>
            }
        >
            <Head title="User Management" />

            <div>
                <Table
                    aria-label="Users table"
                    isHeaderSticky
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
                                        router.get(route('admin.users.index', { page }), {}, { preserveState: true });
                                    }}
                                />
                            </div>
                        ) : null
                    }
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "max-h-[382px] bg-transparent shadow-none",
                    }}
                    selectionMode="none"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid} align={column.uid === "role" ? "start" : "start"}>
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
        </AuthenticatedLayout>
    );
}
