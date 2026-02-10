import { Input, Button } from "@heroui/react";
import GuestLayout from '@/Layouts/GuestLayout';
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
        <GuestLayout>
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
                />

                <div className="flex items-center justify-end mt-2">
                    <Button color="primary" type="submit" isLoading={processing}>
                        Reset Password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
