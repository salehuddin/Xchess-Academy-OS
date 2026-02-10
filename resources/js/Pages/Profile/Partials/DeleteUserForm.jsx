import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@heroui/react";
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <Button color="danger" onPress={confirmUserDeletion}>
                Delete Account
            </Button>

            <Modal 
                isOpen={confirmingUserDeletion} 
                onOpenChange={setConfirmingUserDeletion}
                placement="center"
            >
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={deleteUser}>
                            <ModalHeader className="flex flex-col gap-1">
                                Are you sure you want to delete your account?
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-gray-600">
                                    Once your account is deleted, all of its resources and
                                    data will be permanently deleted. Please enter your
                                    password to confirm you would like to permanently delete
                                    your account.
                                </p>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onValueChange={(val) => setData('password', val)}
                                    label="Password"
                                    placeholder="Password"
                                    isInvalid={!!errors.password}
                                    errorMessage={errors.password}
                                    className="mt-4"
                                    autoFocus
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={closeModal}>
                                    Cancel
                                </Button>
                                <Button color="danger" type="submit" isLoading={processing}>
                                    Delete Account
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        </section>
    );
}
