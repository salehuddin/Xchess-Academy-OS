import { Link } from '@inertiajs/react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Tabs,
    Tab,
    Card,
    CardBody,
    Chip,
    User,
    Spinner
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentDetailsModal({ isOpen, onClose, student: initialStudent, onViewParent }) {
    const [student, setStudent] = useState(initialStudent);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialStudent) {
            setStudent(initialStudent);
            fetchStudentDetails(initialStudent.id);
        } else {
            setStudent(null);
        }
    }, [isOpen, initialStudent]);

    const fetchStudentDetails = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(route('admin.students.details', id));
            setStudent(response.data);
        } catch (error) {
            console.error("Failed to fetch student details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!student && !loading) return null;

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
                            {loading ? "Loading..." : (
                                <div className="flex items-center gap-3">
                                    <User
                                        avatarProps={{
                                            src: `https://ui-avatars.com/api/?name=${student.name}&background=random`,
                                            size: "lg"
                                        }}
                                        name={
                                            <span className="text-lg font-bold">{student.name}</span>
                                        }
                                        description={
                                            <div className="flex gap-2 items-center">
                                                <span className="text-small text-default-500">{student.student_uid}</span>
                                                <Chip size="sm" variant="flat" color={student.status === 'Active' ? 'success' : 'danger'}>
                                                    {student.status}
                                                </Chip>
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Spinner />
                                </div>
                            ) : (
                                <Tabs aria-label="Student Details" color="primary" variant="underlined">
                                    <Tab key="details" title="Details">
                                        <Card shadow="none" className="border-none bg-transparent">
                                            <CardBody className="px-0 gap-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-small font-bold text-default-500 uppercase">Personal Information</h4>
                                                        <div className="mt-2 space-y-2">
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">ID / Passport</span>
                                                                <span className="text-small">{student.nric_passport || '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">Date Registered</span>
                                                                <span className="text-small">{student.date_of_registration || '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">Preferred Language</span>
                                                                <span className="text-small">{student.preferred_language || '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">Current Level</span>
                                                                <span className="text-small">{student.current_level || '-'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-small font-bold text-default-500 uppercase">Parent / Guardian</h4>
                                                            {student.parent_id && onViewParent && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="primary"
                                                                    className="h-6 px-2 min-w-0"
                                                                    onPress={onViewParent}
                                                                >
                                                                    View
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 space-y-2">
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">Name</span>
                                                                <span className="text-small">{student.parent?.name || '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">Email</span>
                                                                <span className="text-small">{student.parent?.email || '-'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-tiny text-default-400 block">Phone</span>
                                                                <span className="text-small">{student.parent?.phone || '-'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {student.admin_notes && (
                                                    <div className="mt-2">
                                                        <h4 className="text-small font-bold text-default-500 uppercase">Admin Notes</h4>
                                                        <p className="text-small mt-1 p-2 bg-default-50 rounded-lg">
                                                            {student.admin_notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </Tab>
                                    <Tab key="classes" title="Classes">
                                        {student.classes && student.classes.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {student.classes.map((cls) => (
                                                    <div key={cls.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-default-50 transition-colors">
                                                        <div className="flex flex-col gap-1">
                                                            <Link
                                                                href={route('admin.classes.show', cls.id)}
                                                                className="font-bold text-primary hover:underline text-small"
                                                            >
                                                                {cls.name}
                                                            </Link>
                                                            <div className="flex items-center gap-2">
                                                                <Chip size="sm" variant="flat" color={cls.status === 'Active' ? 'success' : 'default'} className="h-5 text-tiny">
                                                                    {cls.status}
                                                                </Chip>
                                                                <span className="text-tiny text-default-500">
                                                                    {cls.day}, {cls.start_time?.substring(0, 5)} - {cls.end_time?.substring(0, 5)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-small font-semibold">{cls.package?.title}</p>
                                                            <p className="text-tiny text-default-400">
                                                                {cls.package?.monthly_fee ? new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(cls.package.monthly_fee) : '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center text-default-500">
                                                <p>No enrolled classes found.</p>
                                            </div>
                                        )}
                                    </Tab>
                                    <Tab key="invoices" title="Invoices">
                                        <div className="py-4 text-center text-default-500">
                                            <p>Invoice history will appear here.</p>
                                        </div>
                                    </Tab>
                                </Tabs>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            {student && (
                                <Button color="primary" onPress={() => window.location.href = route('admin.students.edit', student.id)}>
                                    Edit Student
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
