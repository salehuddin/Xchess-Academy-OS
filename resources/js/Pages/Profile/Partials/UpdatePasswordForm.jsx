import { Input, Button } from "@heroui/react";
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    // Hero UI Input ref might not directly expose focus() in the same way as HTML input
                    // checking if current is defined before calling focus
                    if (passwordInput.current) {
                        passwordInput.current.focus();
                    }
                }

                if (errors.current_password) {
                    reset('current_password');
                    if (currentPasswordInput.current) {
                        currentPasswordInput.current.focus();
                    }
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <Input
                    id="current_password"
                    ref={currentPasswordInput}
                    label="Current Password"
                    labelPlacement="outside"
                    value={data.current_password}
                    onValueChange={(val) => setData('current_password', val)}
                    type="password"
                    errorMessage={errors.current_password}
                    isInvalid={!!errors.current_password}
                    autoComplete="current-password"
                />

                <Input
                    id="password"
                    ref={passwordInput}
                    label="New Password"
                    labelPlacement="outside"
                    value={data.password}
                    onValueChange={(val) => setData('password', val)}
                    type="password"
                    errorMessage={errors.password}
                    isInvalid={!!errors.password}
                    autoComplete="new-password"
                />

                <Input
                    id="password_confirmation"
                    label="Confirm Password"
                    labelPlacement="outside"
                    value={data.password_confirmation}
                    onValueChange={(val) => setData('password_confirmation', val)}
                    type="password"
                    errorMessage={errors.password_confirmation}
                    isInvalid={!!errors.password_confirmation}
                    autoComplete="new-password"
                />

                <div className="flex items-center gap-4">
                    <Button color="primary" type="submit" isLoading={processing}>
                        Save
                    </Button>

                    <AnimatePresence>
                        {recentlySuccessful && (
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-sm text-gray-600"
                            >
                                Saved.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </section>
    );
}
