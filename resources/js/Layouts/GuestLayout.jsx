import { Card, CardBody } from "@heroui/react";
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-background pt-6 sm:justify-center sm:pt-0">
            <div className="mb-6">
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-primary" />
                </Link>
            </div>

            <Card className="w-full sm:max-w-md shadow-md">
                <CardBody className="px-6 py-8">
                    {children}
                </CardBody>
            </Card>
        </div>
    );
}
