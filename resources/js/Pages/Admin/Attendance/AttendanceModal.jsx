import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    User,
    Checkbox,
    Spinner,
    Chip,
    Select,
    SelectItem,
    Switch,
    Textarea
} from "@heroui/react";
import { useEffect, useState } from "react";
import { useForm, router, usePage } from "@inertiajs/react";
import axios from "axios";
import StudentDetailsModal from "../Students/StudentDetailsModal";

export default function AttendanceModal({ isOpen, onClose, session }) {
    const { auth } = usePage().props;
    const isCoach = auth?.user?.role === 'Coach';

    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [scheduleDetails, setScheduleDetails] = useState(null);

    // Student Details Modal State (admin only — coach role has no access to student details endpoint)
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        setIsStudentModalOpen(true);
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        attendances: [],
        topic: '',
        notes: '',
        coach_id: '',
    });

    useEffect(() => {
        if (isOpen && session) {
            fetchAttendanceDetails();
        } else {
            reset();
            setStudents([]);
            setScheduleDetails(null);
            clearErrors();
        }
    }, [isOpen, session]);

    const fetchAttendanceDetails = async () => {
        setLoading(true);
        try {
            // Check if we are impersonating a coach via URL query params
            const urlParams = new URLSearchParams(window.location.search);
            const coachIdParam = urlParams.get('coach_id');
            const queryParamString = coachIdParam ? `?coach_id=${coachIdParam}` : '';

            const endpoint = isCoach || coachIdParam
                ? route('coach.attendances.show', [session.id, session.date]) + queryParamString
                : route('admin.attendances.show', [session.id, session.date]);

            const response = await axios.get(endpoint, {
                headers: { Accept: 'application/json' }
            });

            const { schedule, students: fetchedStudents, coaches: fetchedCoaches } = response.data;

            setScheduleDetails(schedule);
            setStudents(fetchedStudents);
            setCoaches(fetchedCoaches);

            // Initialize form data
            setData({
                attendances: fetchedStudents.map(s => ({
                    student_id: s.id,
                    is_present: s.is_present
                })),
                topic: schedule.topic || '',
                notes: schedule.notes || '',
                coach_id: schedule.coach_id?.toString() || '',
            });

        } catch (error) {
            console.error("Failed to fetch attendance details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (isSelected) => {
        const updatedAttendances = data.attendances.map(a => ({ ...a, is_present: isSelected }));
        setData('attendances', updatedAttendances);
    };

    const handleAttendanceChange = (studentId, isPresent) => {
        const updatedAttendances = data.attendances.map(a =>
            a.student_id === studentId ? { ...a, is_present: isPresent } : a
        );
        setData('attendances', updatedAttendances);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const coachIdParam = urlParams.get('coach_id');
        const queryParamString = coachIdParam ? `?coach_id=${coachIdParam}` : '';

        const endpoint = isCoach || coachIdParam
            ? route('coach.attendances.store', [session.id, session.date]) + queryParamString
            : route('admin.attendances.store', [session.id, session.date]);

        post(endpoint, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            }
        });
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) return;

        // Coaches cannot delete attendance records once submitted (or they could, but let's restrict to admin for now,
        // or we need a route for it. Let's just not render the button for coaches, or provide a route).
        // If we want coaches to delete, we need a coach.attendances.destroy route. Let's assume Admin only for deletion.
        const urlParams = new URLSearchParams(window.location.search);
        const coachIdParam = urlParams.get('coach_id');

        if (isCoach && !coachIdParam) {
            alert('Please contact an administrator to delete an attendance record.');
            return;
        }

        router.delete(route('admin.attendances.destroy', [session.id, session.date]), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            }
        });
    };

    const presentCount = data.attendances.filter(a => a.is_present).length;

    if (!isOpen) return null;

    return (
        <>
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            backdrop="blur"
            isDismissable={false}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {loading ? "Loading..." : (
                                <div>
                                    <h3 className="text-xl font-bold">{scheduleDetails?.class_name}</h3>
                                    <div className="flex gap-2 text-sm text-default-500 font-normal">
                                        <span>{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{scheduleDetails?.start_time} - {scheduleDetails?.end_time}</span>
                                    </div>
                                </div>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Spinner size="lg" />
                                </div>
                            ) : (
                                <form id="attendance-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Coach"
                                            placeholder="Select coach"
                                            selectedKeys={data.coach_id ? [data.coach_id] : []}
                                            onChange={(e) => setData('coach_id', e.target.value)}
                                            errorMessage={errors.coach_id}
                                            isInvalid={!!errors.coach_id}
                                        >
                                            {coaches.map((coach) => (
                                                <SelectItem key={coach.id} value={coach.id}>
                                                    {coach.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <Input
                                            label="Topic"
                                            placeholder="Session topic"
                                            value={data.topic}
                                            onValueChange={(val) => setData('topic', val)}
                                            errorMessage={errors.topic}
                                            isInvalid={!!errors.topic}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-md font-semibold">Students ({presentCount}/{students.length} Present)</h4>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    size="sm"
                                                    isSelected={presentCount === students.length && students.length > 0}
                                                    onValueChange={handleSelectAll}
                                                >
                                                    Mark all present
                                                </Checkbox>
                                            </div>
                                        </div>
                                        <div className="border rounded-xl divide-y">
                                            {students.map((student) => {
                                                const attendance = data.attendances.find(a => a.student_id === student.id);
                                                const isPresent = attendance ? attendance.is_present : false;

                                                return (
                                                    <div key={student.id} className="p-3 flex justify-between items-center hover:bg-default-50 transition-colors">
                                                        <div
                                                            className={isCoach ? "" : "cursor-pointer hover:opacity-80 transition-opacity"}
                                                            onClick={() => !isCoach && handleStudentClick(student)}
                                                        >
                                                            <User
                                                                name={
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{student.name}</span>
                                                                        {student.status !== 'Active' && (
                                                                            <Chip size="sm" variant="flat" color="danger" className="h-4 text-[10px] px-1">
                                                                                {student.status}
                                                                            </Chip>
                                                                        )}
                                                                    </div>
                                                                }
                                                                description={student.student_uid}
                                                                avatarProps={{
                                                                    src: `https://ui-avatars.com/api/?name=${student.name}&background=random`
                                                                }}
                                                            />
                                                        </div>
                                                        <Checkbox
                                                            isSelected={isPresent}
                                                            onValueChange={(val) => handleAttendanceChange(student.id, val)}
                                                            color="success"
                                                        >
                                                            {isPresent ? "Present" : "Absent"}
                                                        </Checkbox>
                                                    </div>
                                                );
                                            })}
                                            {students.length === 0 && (
                                                <div className="p-4 text-center text-default-400">
                                                    No students enrolled in this class.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Textarea
                                            label="Notes"
                                            placeholder="Internal notes about this session..."
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            errorMessage={errors.notes}
                                            isInvalid={!!errors.notes}
                                            minRows={4}
                                        />
                                    </div>
                                </form>
                            )}
                        </ModalBody>
                        <ModalFooter className="justify-between">
                            {scheduleDetails?.is_delivered && (!isCoach || new URLSearchParams(window.location.search).get('coach_id')) ? (
                                <Button color="danger" variant="light" onPress={handleDelete}>
                                    Delete
                                </Button>
                            ) : <div />}
                            <div className="flex gap-2">
                                <Button variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" type="submit" form="attendance-form" isLoading={processing}>
                                    Save Attendance
                                </Button>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
        {!isCoach && (
            <StudentDetailsModal
                isOpen={isStudentModalOpen}
                onClose={() => setIsStudentModalOpen(false)}
                student={selectedStudent}
            />
        )}
        </>
    );
}
