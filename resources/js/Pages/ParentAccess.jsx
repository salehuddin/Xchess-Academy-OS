import { Input, Button } from "@heroui/react";
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function ParentAccess() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('parent.access.store'), {
            onFinish: () => reset('email'),
        });
    };

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

                <div className="text-center text-sm text-default-500">
                    <Link href={route('home')} className="text-primary hover:underline">
                        Back to home
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
