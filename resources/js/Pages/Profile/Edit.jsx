import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardBody } from "@heroui/react";
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            user={user}
            header={
                <h2 className="text-2xl font-bold leading-tight text-foreground">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12 space-y-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <Card className="p-4 shadow-sm">
                        <CardBody>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </CardBody>
                    </Card>

                    <Card className="p-4 shadow-sm">
                        <CardBody>
                            <UpdatePasswordForm className="max-w-xl" />
                        </CardBody>
                    </Card>

                    <Card className="p-4 shadow-sm">
                        <CardBody>
                            <DeleteUserForm className="max-w-xl" />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
