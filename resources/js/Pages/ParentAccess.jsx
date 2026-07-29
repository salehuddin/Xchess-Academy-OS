import { Input, Button } from "@heroui/react";
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const ExternalIcon = (props) => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

export default function ParentAccess() {
    const { flash, academy } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('parent.access.store'), {
            onFinish: () => reset('email'),
        });
    };

    const website = academy?.website || 'https://xchessacademy.com';
    const websiteDisplay = website.replace(/^https?:\/\//, '');

    return (
        <GuestLayout>
            <Head title="Parent Portal Access" />

            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-foreground">Parent Portal Access</h1>
                <p className="mt-2 text-sm text-default-500">
                    Enter the email registered with the academy and we will send
                    you a secure link to access your portal.
                </p>
            </div>

            {flash?.success && (
                <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success">
                    {flash.success}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Input
                    type="email"
                    label="Registered Email"
                    labelPlacement="outside"
                    value={data.email}
                    onValueChange={(val) => setData('email', val)}
                    errorMessage={errors.email}
                    isInvalid={!!errors.email}
                    autoComplete="email"
                    variant="bordered"
                    isRequired
                />

                <Button type="submit" color="primary" isLoading={processing}>
                    Send Access Link
                </Button>

                <div className="text-center text-sm text-default-500 space-y-1.5">
                    <div>
                        <Link href={route('home')} className="text-primary hover:underline">
                            Back to home
                        </Link>
                    </div>
                    <div>
                        Want to enroll your child?{' '}
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            {websiteDisplay} <ExternalIcon />
                        </a>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
