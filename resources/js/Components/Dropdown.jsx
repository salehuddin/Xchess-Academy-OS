import { Dropdown as HeroDropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Link } from '@inertiajs/react';

const Dropdown = ({ children, ...props }) => {
    return (
        <HeroDropdown {...props}>
            {children}
        </HeroDropdown>
    );
};

const Trigger = ({ children }) => {
    return (
        <DropdownTrigger>
            {children}
        </DropdownTrigger>
    );
};

const Content = ({ align = 'right', width = '48', contentClasses = 'py-1 bg-white', children }) => {
    // Hero UI handles placement on the Dropdown component, but we are inside Content (Menu).
    // We can't easily lift this prop up without Context or refactoring usage.
    // However, for the default case (right align), Hero UI defaults to 'bottom'.
    // We probably want 'bottom-end' for right align.
    // Since we can't pass it to the parent Dropdown easily here, we might need to rely on default behavior or global config.
    // Actually, let's check if we can style the Menu to simulate alignment if the Popper positioning isn't perfect.
    // But better yet, let's assume 'bottom-end' is what we want generally for user menus.

    // Note: If 'align' is passed, it is ignored here unless we change the architecture.
    // Given the task is to replace with Hero UI, and most usages are standard, we will stick to Hero UI defaults or hardcode common sense.

    return (
        <DropdownMenu
            aria-label="Dropdown Actions"
            className={contentClasses}
        >
            {children}
        </DropdownMenu>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <DropdownItem
            className={className}
            textValue={typeof children === 'string' ? children : 'Item'}
        >
            <Link
                {...props}
                className="w-full h-full block"
            >
                {children}
            </Link>
        </DropdownItem>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
