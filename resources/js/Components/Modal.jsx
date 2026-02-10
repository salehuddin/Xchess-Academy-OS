import { Modal as HeroModal, ModalContent, ModalBody } from "@heroui/react";

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const sizeMap = {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
        '2xl': '2xl',
    };
    const size = sizeMap[maxWidth] || 'md';

    return (
        <HeroModal 
            isOpen={show} 
            onOpenChange={(isOpen) => !isOpen && onClose()}
            size={size}
            isDismissable={closeable}
            hideCloseButton={!closeable}
            // Ensure we don't force padding if the child handles it, but Hero UI ModalContent might need structure.
            // If we just put children, it's fine.
        >
            <ModalContent>
                {() => (
                     <>
                        {children}
                     </>
                )}
            </ModalContent>
        </HeroModal>
    );
}
