import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card, CardBody } from "@heroui/react";

export default function Dashboard({ stats, auth }) {
    const user = auth.user;

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-2xl font-bold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 gap-6">
                {/* Welcome Section */}
                <Card className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                    <CardBody className="p-8">
                        <h3 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h3>
                        <p className="text-blue-100 text-lg">
                            You are logged in as <span className="font-semibold bg-white/20 px-2 py-0.5 rounded">{user.role}</span>.
                            Here's what's happening in your academy today.
                        </p>
                    </CardBody>
                </Card>

                {/* Stats Grid */}
            {user.role === 'Admin' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-md">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-default-500 text-sm font-medium">Total Students</div>
                                    <div className="text-2xl font-bold text-foreground">{stats.total_students}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <div>
                                    <div className="text-default-500 text-sm font-medium">Total Classes</div>
                                    <div className="text-2xl font-bold text-foreground">{stats.total_classes}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-default-500 text-sm font-medium">Pending Invoices</div>
                                    <div className="text-2xl font-bold text-foreground">{stats.pending_invoices}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="border-none shadow-md">
                        <CardBody className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <div className="text-default-500 text-sm font-medium">Monthly Revenue</div>
                                    <div className="text-2xl font-bold text-foreground">${stats.monthly_revenue}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            )}

             {/* Placeholders for future widgets (resembling the screenshot's diagonal lines) */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="h-64 border-2 border-dashed border-divider shadow-none bg-content1">
                    <CardBody className="flex items-center justify-center">
                        <span className="text-default-400">Activity Chart Placeholder</span>
                    </CardBody>
                </Card>
                <Card className="h-64 border-2 border-dashed border-divider shadow-none bg-content1">
                    <CardBody className="flex items-center justify-center">
                        <span className="text-default-400">Recent Assignments Placeholder</span>
                    </CardBody>
                </Card>
                 </div>
            </div>
        </AuthenticatedLayout>
    );
}
