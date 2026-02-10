import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Button,
    Select,
    SelectItem,
    Input,
    RadioGroup,
    Radio
} from "@heroui/react";
import { useMemo } from 'react';

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

export default function Create({ coaches, packages, rooms }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
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
    });

    const filteredRooms = useMemo(() => {
        if (!data.mode) return [];
        return rooms.filter(r => r.mode.toLowerCase() === data.mode.toLowerCase());
    }, [rooms, data.mode]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.classes.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Create New Class</h2>
                        <p className="text-sm text-gray-500">Assign a coach to a package to create a class</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Class" />

            <Card className="w-full max-w-2xl mx-auto shadow-sm border border-gray-100">
                <CardBody className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            label="Class Name"
                            placeholder="Enter class name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            errorMessage={errors.name}
                            isInvalid={!!errors.name}
                            isRequired
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label="Status"
                                selectedKeys={data.status ? [data.status] : []}
                                onChange={(e) => setData('status', e.target.value)}
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
                                value={data.mode}
                                onValueChange={(val) => {
                                    setData(prev => ({...prev, mode: val, room_id: ''}));
                                }}
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
                                selectedKeys={data.package_id ? [String(data.package_id)] : []}
                                onChange={(e) => setData('package_id', e.target.value)}
                                errorMessage={errors.package_id}
                                isInvalid={!!errors.package_id}
                                isRequired
                            >
                                {packages.map((pkg) => (
                                    <SelectItem key={String(pkg.id)} textValue={pkg.title}>
                                        {pkg.title}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                label="Coach (Optional)"
                                placeholder="Select a coach"
                                selectedKeys={data.coach_id ? [String(data.coach_id)] : []}
                                onChange={(e) => setData('coach_id', e.target.value)}
                                errorMessage={errors.coach_id}
                                isInvalid={!!errors.coach_id}
                            >
                                {coaches.map((coach) => (
                                    <SelectItem key={String(coach.id)} textValue={coach.name}>
                                        {coach.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Select
                                label="Day"
                                placeholder="Select day"
                                selectedKeys={data.day ? [data.day] : []}
                                onChange={(e) => setData('day', e.target.value)}
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
                                value={data.start_time}
                                onChange={(val) => setData('start_time', val)}
                                errorMessage={errors.start_time}
                                isInvalid={!!errors.start_time}
                                isRequired
                            />

                            <TimeInput
                                label="End Time"
                                value={data.end_time}
                                onChange={(val) => setData('end_time', val)}
                                errorMessage={errors.end_time}
                                isInvalid={!!errors.end_time}
                                isRequired
                            />
                        </div>

                        <Select
                            label="Room"
                            placeholder={data.mode ? `Select ${data.mode} room` : "Select room"}
                            selectedKeys={data.room_id ? [String(data.room_id)] : []}
                            onChange={(e) => setData('room_id', e.target.value)}
                            errorMessage={errors.room_id}
                            isInvalid={!!errors.room_id}
                            isRequired
                            isDisabled={!data.mode}
                        >
                            {filteredRooms.map((room) => (
                                <SelectItem key={String(room.id)} value={room.id} textValue={room.name}>
                                    {room.name} ({room.location || room.platform})
                                </SelectItem>
                            ))}
                        </Select>

                        {data.mode === 'Online' && (
                            <>
                                <Input
                                    label="Zoom Link"
                                    placeholder="Enter meeting link"
                                    value={data.zoom_link}
                                    onChange={(e) => setData('zoom_link', e.target.value)}
                                    errorMessage={errors.zoom_link}
                                    isInvalid={!!errors.zoom_link}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Meeting ID"
                                        placeholder="Enter meeting ID"
                                        value={data.meeting_id}
                                        onChange={(e) => setData('meeting_id', e.target.value)}
                                        errorMessage={errors.meeting_id}
                                        isInvalid={!!errors.meeting_id}
                                    />
                                    <Input
                                        type="date"
                                        label="Link Expiry"
                                        value={data.link_expiry}
                                        onChange={(e) => setData('link_expiry', e.target.value)}
                                        errorMessage={errors.link_expiry}
                                        isInvalid={!!errors.link_expiry}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-end gap-4 mt-4">
                            <Button
                                as={Link}
                                href={route('admin.classes.index')}
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
                                Create Class
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
