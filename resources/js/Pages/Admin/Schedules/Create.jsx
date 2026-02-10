import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem
} from "@heroui/react";

export default function Create({ classes, rooms, preselectedClassId }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        class_id: preselectedClassId ? String(preselectedClassId) : '',
        room_id: '',
        start_time: '',
        end_time: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.schedules.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Schedule a Session</h2>
                        <p className="text-sm text-gray-500">Create a new class session</p>
                    </div>
                </div>
            }
        >
            <Head title="Schedule Session" />

            <Card className="w-full max-w-2xl mx-auto shadow-sm border border-gray-100">
                <CardBody className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Select
                                label="Select Class"
                                selectedKeys={data.class_id ? [String(data.class_id)] : []}
                                onChange={(e) => setData('class_id', e.target.value)}
                                errorMessage={errors.class_id}
                                isInvalid={!!errors.class_id}
                                required
                            >
                                {classes.map((c) => (
                                    <SelectItem key={String(c.id)} textValue={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Select
                                label="Select Room"
                                selectedKeys={data.room_id ? [String(data.room_id)] : []}
                                onChange={(e) => setData('room_id', e.target.value)}
                                errorMessage={errors.room_id}
                                isInvalid={!!errors.room_id}
                                required
                            >
                                {rooms.map((room) => (
                                    <SelectItem key={String(room.id)} textValue={`${room.name} (Capacity: ${room.capacity})`}>
                                        {room.name} (Capacity: {room.capacity})
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="datetime-local"
                                label="Start Time"
                                value={data.start_time}
                                onValueChange={(val) => setData('start_time', val)}
                                errorMessage={errors.start_time}
                                isInvalid={!!errors.start_time}
                                required
                            />

                            <Input
                                type="datetime-local"
                                label="End Time"
                                value={data.end_time}
                                onValueChange={(val) => setData('end_time', val)}
                                errorMessage={errors.end_time}
                                isInvalid={!!errors.end_time}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-4">
                            <Button
                                as={Link}
                                href={route('admin.attendances.index')}
                                color="danger"
                                variant="light"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={processing}
                            >
                                Schedule Session
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
