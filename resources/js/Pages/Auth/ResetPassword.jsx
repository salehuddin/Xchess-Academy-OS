import { Input, Button } from "@heroui/react";
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Choose a new password for your portal account."
        >
            <Head title="Reset Password" />

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
                    autoComplete="username"
                    variant="bordered"
                    isRequired
                />

                <Input
                    type="password"
                    label="Password"
                    labelPlacement="outside"
                    id="password"
                    value={data.password}
                    onValueChange={(val) => setData('password', val)}
                    errorMessage={errors.password}
                    isInvalid={!!errors.password}
                    autoComplete="new-password"
                    variant="bordered"
                    autoFocus
                    isRequired
                />

                <Input
                    type="password"
                    label="Confirm Password"
                    labelPlacement="outside"
                    id="password_confirmation"
                    value={data.password_confirmation}
                    onValueChange={(val) => setData('password_confirmation', val)}
                    errorMessage={errors.password_confirmation}
                    isInvalid={!!errors.password_confirmation}
                    autoComplete="new-password"
                    variant="bordered"
                    isRequired
                />

                <Button color="primary" type="submit" isLoading={processing} className="mt-2">
                    Reset Password
                </Button>
            </form>
        </AuthLayout>
    );
}
