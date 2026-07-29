import { Input, Button, Checkbox } from "@heroui/react";
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Sign in to your account"
            subtitle="Access the XChess Academy Portal as a coach or admin."
        >
            <Head title="Log in" />

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
                    value={data.password}
                    onValueChange={(val) => setData('password', val)}
                    errorMessage={errors.password}
                    isInvalid={!!errors.password}
                    autoComplete="current-password"
                    variant="bordered"
                    isRequired
                />

                <div className="flex items-center justify-between mt-2">
                    <Checkbox
                        isSelected={data.remember}
                        onValueChange={(val) => setData('remember', val)}
                    >
                        Remember me
                    </Checkbox>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <Button color="primary" type="submit" isLoading={processing} className="mt-2">
                    Sign In
                </Button>
            </form>
        </AuthLayout>
    );
}
