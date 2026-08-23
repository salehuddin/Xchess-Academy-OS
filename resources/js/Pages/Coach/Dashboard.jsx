import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { useState } from 'react';
import AttendanceModal from '../Admin/Attendance/AttendanceModal'; // We will reuse the admin modal for now
import UnreadNotificationsWidget from '@/Components/UnreadNotificationsWidget';

export default function Dashboard({ auth, stats, todaySessions, impersonatedCoach, unreadNotifications }) {
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const handleAttendanceClick = (session) => {
        setSelectedSession({ id: session.id, date: session.date });
        setIsAttendanceModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            Coach Dashboard
                        </h2>
                        {impersonatedCoach && (
                            <Chip color="warning" variant="flat" size="sm">
                                Viewing as: {impersonatedCoach.name}
                            </Chip>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Coach Dashboard" />

            <div className="flex flex-col gap-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="shadow-sm">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-default-500 font-medium">My Classes</p>
                                <p className="text-2xl font-bold">{stats.my_classes}</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-default-500 font-medium">Today's Sessions</p>
                                <p className="text-2xl font-bold">{stats.today_sessions_count}</p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="shadow-sm">
                        <CardBody className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-warning/10 rounded-xl text-warning">
                                <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2.25m0 4.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-default-500 font-medium">Pending Attendance</p>
                                <p className="text-2xl font-bold">{stats.pending_attendance}</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Today's Schedule List */}
                <Card className="shadow-sm">
                    <CardHeader className="flex justify-between items-center px-6 pt-6">
                        <h3 className="text-lg font-bold">Today's Schedule</h3>
                        <p className="text-sm text-default-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        {todaySessions.length === 0 ? (
                            <div className="py-8 text-center text-default-500">
                                You have no sessions scheduled for today.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaySessions.map((session, index) => (
                                    <div key={index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-divider rounded-xl hover:bg-default-50 transition-colors gap-4">
                                        <div className="flex gap-4 items-center w-full md:w-auto">
                                            <div className="min-w-[80px] text-center">
                                                <div className="font-bold text-lg">{session.start_time}</div>
                                                <div className="text-xs text-default-500">{session.end_time}</div>
                                            </div>
                                            <div className="w-px h-10 bg-divider hidden md:block"></div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{session.class_name}</span>
                                                <span className="text-sm text-default-500 flex items-center gap-1">
                                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                                    </svg>
                                                    {session.room_name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-divider mt-2 md:mt-0">
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color={session.status === 'Submitted' ? 'success' : 'warning'}
                                            >
                                                {session.status === 'Submitted' ? 'Attendance Submitted' : 'Attendance Pending'}
                                            </Chip>

                                            <Button
                                                color={session.status === 'Submitted' ? 'default' : 'primary'}
                                                variant={session.status === 'Submitted' ? 'flat' : 'solid'}
                                                size="sm"
                                                onPress={() => handleAttendanceClick(session)}
                                            >
                                                {session.status === 'Submitted' ? 'View/Edit' : 'Take Attendance'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Recent Notifications */}
                <UnreadNotificationsWidget notifications={unreadNotifications} />
            </div>

            {isAttendanceModalOpen && (
                <AttendanceModal
                    isOpen={isAttendanceModalOpen}
                    onClose={() => setIsAttendanceModalOpen(false)}
                    session={selectedSession}
                />
            )}
        </AuthenticatedLayout>
    );
}
