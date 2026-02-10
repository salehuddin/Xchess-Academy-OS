import defaultTheme from 'tailwindcss/defaultTheme';
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/react/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    darkMode: "class",
    plugins: [
        heroui({
            themes: {
                light: {
                    colors: {
                        background: "#e8ebed",
                        foreground: "#333333",
                        primary: {
                            DEFAULT: "#e05d38",
                            foreground: "#ffffff",
                        },
                        secondary: {
                            DEFAULT: "#f3f4f6",
                            foreground: "#4b5563",
                        },
                        danger: {
                            DEFAULT: "#ef4444",
                            foreground: "#ffffff",
                        },
                        content1: {
                            DEFAULT: "#ffffff", // card
                            foreground: "#333333",
                        },
                        content2: {
                            DEFAULT: "#ffffff", // popover
                            foreground: "#333333",
                        },
                        content3: {
                            DEFAULT: "#f9fafb", // muted
                            foreground: "#6b7280",
                        },
                        content4: {
                            DEFAULT: "#f4f5f7", // input
                            foreground: "#333333",
                        },
                        focus: "#e05d38", // ring
                    },
                },
                dark: {
                    colors: {
                        background: "#1c2433",
                        foreground: "#e5e5e5",
                        primary: {
                            DEFAULT: "#e05d38",
                            foreground: "#ffffff",
                        },
                        secondary: {
                            DEFAULT: "#2a303e",
                            foreground: "#e5e5e5",
                        },
                        danger: {
                            DEFAULT: "#ef4444",
                            foreground: "#ffffff",
                        },
                        content1: {
                            DEFAULT: "#2a3040", // card
                            foreground: "#e5e5e5",
                        },
                        content2: {
                            DEFAULT: "#262b38", // popover
                            foreground: "#e5e5e5",
                        },
                        content3: {
                            DEFAULT: "#2a303e", // muted
                            foreground: "#a3a3a3",
                        },
                        content4: {
                            DEFAULT: "#3d4354", // input
                            foreground: "#e5e5e5",
                        },
                        focus: "#e05d38", // ring
                    },
                },
            },
            layout: {
                disabledOpacity: "0.5",
                radius: {
                    small: "0.5rem",
                    medium: "0.75rem",
                    large: "0.875rem",
                },
            },
        }),
    ],
};
