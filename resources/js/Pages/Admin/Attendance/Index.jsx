import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardBody, CardHeader, Input, Chip, Button } from "@heroui/react";

// Icons
const UserIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm9 11v-1a6 6 0 0 0-6-6H9a6 6 0 0 0-6 6v1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const ClockIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M12 6v6l4 2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

export default function Index({ auth, schedules, date }) {
    const handleDateChange = (val) => {
        router.get(route('admin.attendances.index'), { date: val }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Attendance</h2>
                        <p className="text-sm text-gray-500">Manage class attendance sessions</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <Input
                            type="date"
                            label="Filter by Date"
                            placeholder="Select a date"
                            value={date}
                            onValueChange={handleDateChange}
                            className="w-full md:w-64"
                            size="sm"
                            variant="flat"
                        />
                    </div>
                </div>
            }
        >
            <Head title="Attendance" />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {schedules.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <ClockIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No classes scheduled</h3>
                        <p className="text-sm text-gray-500">Try selecting a different date</p>
                    </div>
                ) : (
                    schedules.map((schedule) => (
                        <Card key={schedule.id} className="hover:scale-[1.02] transition-transform shadow-sm hover:shadow-md">
                            <CardHeader className="flex justify-between items-start pb-0 pt-4 px-4">
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-lg text-gray-900">{schedule.class_name}</h3>
                                    <p className="text-small text-default-500">{schedule.room_name}</p>
                                </div>
                                {schedule.is_delivered && (
                                    <Chip color="success" variant="flat" size="sm" className="border-none">Delivered</Chip>
                                )}
                            </CardHeader>
                            <CardBody className="px-4 py-4">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-2 bg-default-50 rounded-lg">
                                        <UserIcon className="text-primary" />
                                        <span className="text-sm font-medium text-gray-700">{schedule.coach_name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-2 bg-default-50 rounded-lg">
                                        <ClockIcon className="text-primary" />
                                        <span className="text-sm font-medium text-gray-700 font-mono">{schedule.start_time} - {schedule.end_time}</span>
                                    </div>
                                    <div className="mt-2 flex justify-end">
                                        <Button
                                            as={Link}
                                            href={route('admin.attendances.show', schedule.id)}
                                            color="primary"
                                            size="sm"
                                            variant="solid"
                                            className="font-medium"
                                        >
                                            Take Attendance
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>
        </AuthenticatedLayout>
    );
}
