import { Input, Button } from "@heroui/react";
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-4 text-sm text-gray-600">
                This is a secure area of the application. Please confirm your
                password before continuing.
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Input
                    type="password"
                    label="Password"
                    labelPlacement="outside"
                    id="password"
                    value={data.password}
                    onValueChange={(val) => setData('password', val)}
                    errorMessage={errors.password}
                    isInvalid={!!errors.password}
                    variant="bordered"
                    autoFocus
                />

                <div className="flex items-center justify-end mt-2">
                    <Button color="primary" type="submit" isLoading={processing}>
                        Confirm
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
