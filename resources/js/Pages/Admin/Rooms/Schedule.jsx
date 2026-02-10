import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, CardHeader, Divider, Button, Chip } from "@heroui/react";

export default function Schedule({ room, classes }) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

    // Helper to calculate position and height
    const getEventStyle = (classItem) => {
        const startHour = parseInt(classItem.start_time.split(':')[0]);
        const startMin = parseInt(classItem.start_time.split(':')[1]);
        const endHour = parseInt(classItem.end_time.split(':')[0]);
        const endMin = parseInt(classItem.end_time.split(':')[1]);

        const startOffset = (startHour - 8) * 60 + startMin;
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        return {
            top: `${(startOffset / 60) * 4}rem`, // 4rem per hour
            height: `${(duration / 60) * 4}rem`,
        };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Schedule: {room.name}
                    </h2>
                    <Button as={Link} href={route('admin.rooms.index')} size="sm" variant="light">
                        Back to Rooms
                    </Button>
                </div>
            }
        >
            <Head title={`Schedule - ${room.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-white shadow-md overflow-x-auto">
                        <CardBody className="min-w-[1000px]">
                            {/* Calendar Header */}
                            <div className="grid grid-cols-8 border-b border-gray-200">
                                <div className="p-4 font-semibold text-gray-500 border-r">Time</div>
                                {days.map(day => (
                                    <div key={day} className="p-4 font-semibold text-center border-r last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="relative grid grid-cols-8 h-[60rem]"> {/* 15 hours * 4rem */}
                                {/* Time Labels */}
                                <div className="border-r border-gray-200 bg-gray-50">
                                    {timeSlots.map(hour => (
                                        <div key={hour} className="h-16 border-b border-gray-100 p-2 text-xs text-gray-500 text-right">
                                            {hour}:00
                                        </div>
                                    ))}
                                </div>

                                {/* Days Columns */}
                                {days.map(day => (
                                    <div key={day} className="relative border-r border-gray-200 last:border-r-0">
                                        {/* Grid Lines */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-16 border-b border-gray-100"></div>
                                        ))}

                                        {/* Events */}
                                        {classes
                                            .filter(c => c.day === day)
                                            .map(c => (
                                                <Link
                                                    key={c.id}
                                                    href={route('admin.classes.show', c.id)}
                                                    className="absolute inset-x-1 bg-primary-100 border-l-4 border-primary-500 rounded p-1 text-xs hover:bg-primary-200 transition cursor-pointer z-10 overflow-hidden block"
                                                    style={getEventStyle(c)}
                                                    title={`${c.name} with ${c.coach?.name}`}
                                                >
                                                    <div className="font-bold truncate">{c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}</div>
                                                    <div className="font-semibold truncate">{c.name}</div>
                                                    <div className="truncate text-gray-600">{c.coach?.name}</div>
                                                    <div className="mt-1">
                                                        <Chip size="sm" variant="flat" color="primary" className="h-5 text-[10px]">
                                                            {c.uid}
                                                        </Chip>
                                                    </div>
                                                </Link>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
