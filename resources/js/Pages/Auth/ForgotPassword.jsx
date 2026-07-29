import { Input, Button } from "@heroui/react";
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Forgot your password?"
            subtitle="Enter your email and we'll send you a password reset link."
        >
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-4 text-sm font-medium text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Input
                    type="email"
                    label="Email"
                    labelPlacement="outside"
                    id="email"
                    value={data.email}
                    onValueChange={(val) => setData('email', val)}
                    errorMessage={errors.email}
                    isInvalid={!!errors.email}
                    variant="bordered"
                    autoFocus
                    isRequired
                />

                <Button color="primary" type="submit" isLoading={processing} className="mt-2">
                    Email Password Reset Link
                </Button>
            </form>
        </AuthLayout>
    );
}
