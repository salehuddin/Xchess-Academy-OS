import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Chip,
    Button,
    Input,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";

// Icons
const PlusIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
            <path d="M6 12h12" />
            <path d="M12 18V6" />
        </g>
    </svg>
);

export default function Index({ auth, tasks, users }) {
    const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: '',
        title: '',
        department: '',
        priority: 'Medium',
        user_id: '',
        status: 'Pending',
    });

    const openEditModal = (task) => {
        clearErrors();
        setData({
            id: task.id,
            title: task.title,
            department: task.department,
            priority: task.priority,
            user_id: task.user_id,
            status: task.status,
        });
        onEditOpen();
    };

    const handleCreate = (onClose) => {
        post(route('admin.tasks.store'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const handleUpdate = (onClose) => {
        put(route('admin.tasks.update', data.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const handleDelete = (task) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(route('admin.tasks.destroy', task.id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'In Progress': return 'primary';
            case 'Pending': return 'warning';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'default';
        }
    };

    const columns = ['Pending', 'In Progress', 'Completed'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Tasks</h2>
                        <p className="text-sm text-gray-500">Manage tasks and assignments</p>
                    </div>
                    <Button
                        color="primary"
                        onPress={() => { clearErrors(); reset(); onCreateOpen(); }}
                        startContent={<PlusIcon />}
                        className="font-medium"
                    >
                        Create Task
                    </Button>
                </div>
            }
        >
            <Head title="Tasks" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map((status) => (
                    <div key={status} className="bg-gray-100 p-4 rounded-xl min-h-[500px]">
                        <h3 className="font-bold text-lg mb-4 text-gray-700 flex justify-between items-center px-2">
                            {status}
                            <Chip size="sm" variant="flat" color={getStatusColor(status)}>
                                {tasks.filter(t => t.status === status).length}
                            </Chip>
                        </h3>
                        <div className="space-y-4">
                            {tasks.filter(task => task.status === status).map((task) => (
                                <Card key={task.id} className="w-full">
                                    <CardHeader className="flex justify-between items-start pb-0">
                                        <div className="flex flex-col">
                                            <p className="text-md font-bold">{task.title}</p>
                                            <p className="text-small text-default-500">{task.department}</p>
                                        </div>
                                        <Chip size="sm" variant="dot" color={getPriorityColor(task.priority)}>{task.priority}</Chip>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-small text-default-500">
                                            Assigned to: {task.user?.name || 'Unassigned'}
                                        </p>
                                    </CardBody>
                                    <CardFooter className="flex justify-end gap-2 pt-0">
                                        <Button size="sm" variant="light" onPress={() => openEditModal(task)}>
                                            Edit
                                        </Button>
                                        <Button size="sm" color="danger" variant="light" onPress={() => handleDelete(task)}>
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} backdrop="blur">
                <ModalContent className="bg-white">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create New Task</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Title"
                                    value={data.title}
                                    onValueChange={(val) => setData('title', val)}
                                    errorMessage={errors.title}
                                    isInvalid={!!errors.title}
                                    required
                                />
                                <Select
                                    label="Department"
                                    selectedKeys={data.department ? [data.department] : []}
                                    onChange={(e) => setData('department', e.target.value)}
                                    errorMessage={errors.department}
                                    isInvalid={!!errors.department}
                                    required
                                >
                                    <SelectItem key="Ops">Ops</SelectItem>
                                    <SelectItem key="Finance">Finance</SelectItem>
                                    <SelectItem key="Coaching">Coaching</SelectItem>
                                </Select>
                                <Select
                                    label="Priority"
                                    selectedKeys={data.priority ? [data.priority] : []}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    errorMessage={errors.priority}
                                    isInvalid={!!errors.priority}
                                    required
                                >
                                    <SelectItem key="High">High</SelectItem>
                                    <SelectItem key="Medium">Medium</SelectItem>
                                    <SelectItem key="Low">Low</SelectItem>
                                </Select>
                                <Select
                                    label="Assigned User"
                                    selectedKeys={data.user_id ? [String(data.user_id)] : []}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    errorMessage={errors.user_id}
                                    isInvalid={!!errors.user_id}
                                    required
                                >
                                    {users.map((user) => (
                                        <SelectItem key={String(user.id)} textValue={user.name}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Status"
                                    selectedKeys={data.status ? [data.status] : []}
                                    onChange={(e) => setData('status', e.target.value)}
                                    errorMessage={errors.status}
                                    isInvalid={!!errors.status}
                                    required
                                >
                                    <SelectItem key="Pending">Pending</SelectItem>
                                    <SelectItem key="In Progress">In Progress</SelectItem>
                                    <SelectItem key="Completed">Completed</SelectItem>
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => handleCreate(onClose)} isLoading={processing}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} backdrop="blur">
                <ModalContent className="bg-white">
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Edit Task</ModalHeader>
                            <ModalBody>
                                <Input
                                    label="Title"
                                    value={data.title}
                                    onValueChange={(val) => setData('title', val)}
                                    errorMessage={errors.title}
                                    isInvalid={!!errors.title}
                                    required
                                />
                                <Select
                                    label="Department"
                                    selectedKeys={data.department ? [data.department] : []}
                                    onChange={(e) => setData('department', e.target.value)}
                                    errorMessage={errors.department}
                                    isInvalid={!!errors.department}
                                    required
                                >
                                    <SelectItem key="Ops">Ops</SelectItem>
                                    <SelectItem key="Finance">Finance</SelectItem>
                                    <SelectItem key="Coaching">Coaching</SelectItem>
                                </Select>
                                <Select
                                    label="Priority"
                                    selectedKeys={data.priority ? [data.priority] : []}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    errorMessage={errors.priority}
                                    isInvalid={!!errors.priority}
                                    required
                                >
                                    <SelectItem key="High">High</SelectItem>
                                    <SelectItem key="Medium">Medium</SelectItem>
                                    <SelectItem key="Low">Low</SelectItem>
                                </Select>
                                <Select
                                    label="Assigned User"
                                    selectedKeys={data.user_id ? [String(data.user_id)] : []}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    errorMessage={errors.user_id}
                                    isInvalid={!!errors.user_id}
                                    required
                                >
                                    {users.map((user) => (
                                        <SelectItem key={String(user.id)} textValue={user.name}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Status"
                                    selectedKeys={data.status ? [data.status] : []}
                                    onChange={(e) => setData('status', e.target.value)}
                                    errorMessage={errors.status}
                                    isInvalid={!!errors.status}
                                    required
                                >
                                    <SelectItem key="Pending">Pending</SelectItem>
                                    <SelectItem key="In Progress">In Progress</SelectItem>
                                    <SelectItem key="Completed">Completed</SelectItem>
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={() => handleUpdate(onClose)} isLoading={processing}>
                                    Update
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </AuthenticatedLayout>
    );
}
