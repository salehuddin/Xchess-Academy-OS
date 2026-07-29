import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import {
  Input,
  Button,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";

const DAYS = [
    {key: "Monday", label: "Monday"},
    {key: "Tuesday", label: "Tuesday"},
    {key: "Wednesday", label: "Wednesday"},
    {key: "Thursday", label: "Thursday"},
    {key: "Friday", label: "Friday"},
    {key: "Saturday", label: "Saturday"},
    {key: "Sunday", label: "Sunday"},
];

const COACH_LEVELS = [
    {key: "Junior", label: "Junior"},
    {key: "Senior", label: "Senior"},
    {key: "Master", label: "Master"},
    {key: "Grandmaster", label: "Grandmaster"},
];

export default function Edit({ auth, coach }) {
    const { data, setData, put, processing, errors } = useForm({
        name: coach.name || '',
        email: coach.email || '',
        nric: coach.coach_profile?.nric || '',
        phone: coach.coach_profile?.phone || '',
        bank_name: coach.coach_profile?.bank_name || '',
        bank_account_name: coach.coach_profile?.bank_account_name || '',
        bank_account_number: coach.coach_profile?.bank_account_number || '',
        level: coach.coach_profile?.level || '',
        hourly_rate: coach.coach_profile?.hourly_rate || '',
        availability: coach.coach_profile?.availability || [],
    });

    const addAvailabilitySlot = () => {
        setData('availability', [
            ...(data.availability || []),
            { day: 'Monday', start: '09:00', end: '17:00' }
        ]);
    };

    const removeAvailabilitySlot = (index) => {
        const newAvailability = [...data.availability];
        newAvailability.splice(index, 1);
        setData('availability', newAvailability);
    };

    const updateAvailabilitySlot = (index, field, value) => {
        const newAvailability = [...data.availability];
        newAvailability[index][field] = value;
        setData('availability', newAvailability);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.coaches.update', coach.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Edit Coach</h2>
                        <p className="text-sm text-default-500">Update coach profile and details</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Coach" />

            <div className="max-w-4xl mx-auto pb-10">
                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                            <h4 className="text-large font-bold">Personal Information</h4>
                            <small className="text-default-500">Basic details</small>
                        </CardHeader>
                        <CardBody className="gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    placeholder="Enter full name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    errorMessage={errors.name}
                                    isInvalid={!!errors.name}
                                    isRequired
                                />
                                <Input
                                    label="Email"
                                    placeholder="Enter email address"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    errorMessage={errors.email}
                                    isInvalid={!!errors.email}
                                    isRequired
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="e.g. +60123456789"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    errorMessage={errors.phone}
                                    isInvalid={!!errors.phone}
                                />
                                <Input
                                    label="MyKad (NRIC)"
                                    placeholder="e.g. 900101-14-1234"
                                    value={data.nric}
                                    onChange={(e) => setData('nric', e.target.value)}
                                    errorMessage={errors.nric}
                                    isInvalid={!!errors.nric}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                            <h4 className="text-large font-bold">Professional Details</h4>
                            <small className="text-default-500">Coach level and compensation</small>
                        </CardHeader>
                        <CardBody className="gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Coach Level"
                                    placeholder="Select level"
                                    selectedKeys={data.level ? [data.level] : []}
                                    onChange={(e) => setData('level', e.target.value)}
                                    errorMessage={errors.level}
                                    isInvalid={!!errors.level}
                                >
                                    {COACH_LEVELS.map((level) => (
                                        <SelectItem key={level.key} value={level.key}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    type="number"
                                    label="Hourly Rate (RM)"
                                    placeholder="e.g. 60.00"
                                    value={data.hourly_rate}
                                    onChange={(e) => setData('hourly_rate', e.target.value)}
                                    errorMessage={errors.hourly_rate}
                                    isInvalid={!!errors.hourly_rate}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                            <h4 className="text-large font-bold">Bank Details</h4>
                            <small className="text-default-500">For payment processing</small>
                        </CardHeader>
                        <CardBody className="gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Bank Name"
                                    placeholder="e.g. Maybank"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    errorMessage={errors.bank_name}
                                    isInvalid={!!errors.bank_name}
                                />
                                <Input
                                    label="Account Name"
                                    placeholder="Name as per bank record"
                                    value={data.bank_account_name}
                                    onChange={(e) => setData('bank_account_name', e.target.value)}
                                    errorMessage={errors.bank_account_name}
                                    isInvalid={!!errors.bank_account_name}
                                />
                                <Input
                                    label="Account Number"
                                    placeholder="e.g. 16234567890"
                                    value={data.bank_account_number}
                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                    errorMessage={errors.bank_account_number}
                                    isInvalid={!!errors.bank_account_number}
                                />
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader className="pb-0 pt-4 px-4 flex justify-between items-center">
                            <div className="flex flex-col items-start">
                                <h4 className="text-large font-bold">Availability</h4>
                                <small className="text-default-500">Preferred teaching slots</small>
                            </div>
                            <Button size="sm" color="primary" variant="flat" onPress={addAvailabilitySlot}>
                                + Add Slot
                            </Button>
                        </CardHeader>
                        <CardBody className="gap-4">
                            {(!data.availability || data.availability.length === 0) && (
                                <p className="text-default-400 text-sm italic">No availability slots added yet.</p>
                            )}
                            {data.availability && data.availability.map((slot, index) => (
                                <div key={index} className="flex gap-4 items-end bg-default-50 p-4 rounded-lg">
                                    <Select
                                        label="Day"
                                        size="sm"
                                        selectedKeys={[slot.day]}
                                        onChange={(e) => updateAvailabilitySlot(index, 'day', e.target.value)}
                                        className="w-1/3"
                                    >
                                        {DAYS.map((day) => (
                                            <SelectItem key={day.key} value={day.key}>
                                                {day.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Input
                                        type="time"
                                        label="Start Time"
                                        size="sm"
                                        value={slot.start}
                                        onChange={(e) => updateAvailabilitySlot(index, 'start', e.target.value)}
                                        className="w-1/4"
                                    />
                                    <Input
                                        type="time"
                                        label="End Time"
                                        size="sm"
                                        value={slot.end}
                                        onChange={(e) => updateAvailabilitySlot(index, 'end', e.target.value)}
                                        className="w-1/4"
                                    />
                                    <Button
                                        isIconOnly
                                        color="danger"
                                        variant="light"
                                        onPress={() => removeAvailabilitySlot(index)}
                                    >
                                        <svg aria-hidden="true" fill="none" focusable="false" height="1.5em" role="presentation" viewBox="0 0 24 24" width="1.5em">
                                            <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16 13.5H8C7.59 13.5 7.25 13.16 7.25 12.75C7.25 12.34 7.59 12 8 12H16C16.41 12 16.75 12.34 16.75 12.75C16.75 13.16 16.41 13.5 16 13.5Z" fill="currentColor" />
                                        </svg>
                                    </Button>
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    <div className="flex gap-2 justify-end">
                        <Button as={Link} href={route('admin.coaches.index')} variant="flat" color="default">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary" isLoading={processing}>
                            Update Coach
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
