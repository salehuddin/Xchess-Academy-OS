import { Card, CardBody } from "@heroui/react";
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, variant = "card", title }) {
    if (variant === "page") {
        return (
            <div className="min-h-screen bg-background">
                <div className="border-b border-divider">
                    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-10 w-10 fill-current text-primary" />
                            <span className="text-lg font-semibold text-foreground">X Chess Academy</span>
                        </Link>
                        {title ? (
                            <div className="ml-auto text-sm text-default-500">
                                {title}
                            </div>
                        ) : null}
                    </div>
                </div>
                <main className="mx-auto max-w-6xl px-4 py-6">
                    {children}
                </main>
            </div>
        );
    }

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
