import { Input, Button } from "@heroui/react";
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Input
                    label="Name"
                    labelPlacement="outside"
                    id="name"
                    value={data.name}
                    onValueChange={(val) => setData('name', val)}
                    errorMessage={errors.name}
                    isInvalid={!!errors.name}
                    required
                    autoComplete="name"
                    variant="bordered"
                />

                <Input
                    type="email"
                    label="Email"
                    labelPlacement="outside"
                    id="email"
                    value={data.email}
                    onValueChange={(val) => setData('email', val)}
                    errorMessage={errors.email}
                    isInvalid={!!errors.email}
                    required
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
                    required
                    autoComplete="new-password"
                    variant="bordered"
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
                    required
                    autoComplete="new-password"
                    variant="bordered"
                />

                <div className="flex items-center justify-between mt-2">
                    <Link
                        href={route('login')}
                        className="text-sm text-primary hover:underline"
                    >
                        Already registered?
                    </Link>

                    <Button color="primary" type="submit" isLoading={processing}>
                        Register
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
