import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    User,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Spinner,
    Input
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, router } from "@inertiajs/react";

export default function ParentDetailsModal({ isOpen, onClose, parentId, onStudentClick }) {
    const [parent, setParent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && parentId) {
            fetchParentDetails();
            setIsEditing(false);
        } else {
            setParent(null);
            setIsEditing(false);
        }
    }, [isOpen, parentId]);

    const fetchParentDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('admin.parents.details', parentId));
            setParent(response.data);
            setEditForm({
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone || ''
            });
        } catch (error) {
            console.error("Failed to fetch parent details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(route('admin.parents.update-parent', parent.id), editForm);
            setParent({ ...parent, ...editForm });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update parent:", error);
            // Here you might want to show an error notification
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Parent / Guardian Details</h2>
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Spinner label="Loading parent details..." />
                                </div>
                            ) : parent ? (
                                <div className="space-y-6">
                                    {/* Parent Info */}
                                    <div className="bg-content2 p-4 rounded-lg">
                                        {isEditing ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Name"
                                                    size="sm"
                                                    value={editForm.name}
                                                    onValueChange={(val) => setEditForm({...editForm, name: val})}
                                                />
                                                <Input
                                                    label="Email"
                                                    size="sm"
                                                    value={editForm.email}
                                                    onValueChange={(val) => setEditForm({...editForm, email: val})}
                                                />
                                                <Input
                                                    label="Phone"
                                                    size="sm"
                                                    value={editForm.phone}
                                                    onValueChange={(val) => setEditForm({...editForm, phone: val})}
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Name</span>
                                                    <span className="text-medium font-semibold">{parent.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Email</span>
                                                    <span className="text-medium">{parent.email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Phone</span>
                                                    <span className="text-medium">{parent.phone || '-'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Children List */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-lg font-bold">Students</h3>
                                            <Button
                                                as={Link}
                                                href={route('admin.students.create', { parent_id: parent.id })}
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                            >
                                                Add Student
                                            </Button>
                                        </div>

                                        <Table aria-label="Students table" removeWrapper classNames={{ wrapper: "bg-transparent shadow-none" }}>
                                            <TableHeader>
                                                <TableColumn>NAME</TableColumn>
                                                <TableColumn>NRIC</TableColumn>
                                                <TableColumn>STATUS</TableColumn>
                                            </TableHeader>
                                            <TableBody emptyContent="No students found">
                                                {parent.students?.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell>
                                                            <div 
                                                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => {
                                                                    if (onStudentClick) {
                                                                        onStudentClick(student);
                                                                    }
                                                                }}
                                                            >
                                                                <User
                                                                    avatarProps={{
                                                                        radius: "lg",
                                                                        src: `https://ui-avatars.com/api/?name=${student.name}&background=random`
                                                                    }}
                                                                    name={
                                                                        <span className="text-primary underline">
                                                                            {student.name}
                                                                        </span>
                                                                    }
                                                                    description={student.current_level}
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{student.nric_passport}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                className="capitalize"
                                                                color={student.status === 'Active' ? 'success' : student.status === 'Suspended' ? 'danger' : 'warning'}
                                                                size="sm"
                                                                variant="flat"
                                                            >
                                                                {student.status}
                                                            </Chip>
                                                        </TableCell>
                                                    </TableRow>
                                                )) || []}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-default-500">
                                    Parent details not found.
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {!isEditing ? (
                                <>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Close
                                    </Button>
                                    {parent && (
                                        <Button color="primary" onPress={() => setIsEditing(true)}>
                                            Edit
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => {
                                            setIsEditing(false);
                                            setEditForm({
                                                name: parent.name,
                                                email: parent.email,
                                                phone: parent.phone || ''
                                            });
                                        }}
                                        isDisabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        onPress={handleSave}
                                        isLoading={saving}
                                    >
                                        Save
                                    </Button>
                                </>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
