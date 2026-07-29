import { Link, usePage } from '@inertiajs/react';
import Logo from '@/Components/Logo';

const ExternalIcon = (props) => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const MailIcon = (props) => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" />
        <path d="M3 7l9 6 9-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon = (props) => (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
        <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function AuthLayout({ children, title, subtitle }) {
    const { academy } = usePage().props;
    const website = academy?.website || 'https://xchessacademy.com';
    const supportEmail = academy?.support_email || 'support@xchess-academy.com';

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left branded panel (hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-between p-12 bg-gradient-to-br from-primary to-indigo-700 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="chessgrid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <rect width="30" height="30" fill="currentColor" />
                                <rect x="30" y="30" width="30" height="30" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#chessgrid)" />
                    </svg>
                </div>

                <Link href={route('home')} className="relative z-10">
                    <Logo size="lg" withText className="[&_span]:text-white" />
                </Link>

                <div className="relative z-10 space-y-6 max-w-md">
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                        XChess Academy Portal
                    </h1>
                    <p className="text-white/80 text-lg">
                        Manage classes, schedules, invoices, attendance, and student records — all in one place.
                    </p>
                    <div className="space-y-2 pt-4">
                        <p className="text-sm font-semibold text-white/90 uppercase tracking-wider">Who can sign in?</p>
                        <ul className="space-y-1.5 text-white/80 text-sm">
                            <li className="flex items-center gap-2"><CheckIcon /> Parents — via secure access link</li>
                            <li className="flex items-center gap-2"><CheckIcon /> Coaches — manage classes &amp; payroll</li>
                            <li className="flex items-center gap-2"><CheckIcon /> Admins — run the academy</li>
                        </ul>
                    </div>
                </div>

                <div className="relative z-10 space-y-2 text-sm text-white/80">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                        Need help?
                    </div>
                    <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-white">
                        <MailIcon /> {supportEmail}
                    </a>
                    <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                        <ExternalIcon /> Learn about classes &amp; enrollment at {website.replace(/^https?:\/\//, '')}
                    </a>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col">
                <div className="md:hidden p-6 border-b border-divider">
                    <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-default-500 hover:text-primary">
                        <ExternalIcon /> Main site
                    </a>
                </div>
                <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md">
                        <div className="md:hidden mb-8 flex justify-center">
                            <Logo size="md" withText />
                        </div>
                        {(title || subtitle) && (
                            <div className="mb-8">
                                {title && (
                                    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                                )}
                                {subtitle && (
                                    <p className="mt-1.5 text-sm text-default-500">{subtitle}</p>
                                )}
                            </div>
                        )}
                        {children}
                        <div className="mt-8 pt-6 border-t border-divider text-center text-sm text-default-500 space-y-1.5">
                            <div>
                                Need help? <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">Contact support</a>
                            </div>
                            <div>
                                Want to enroll in classes?{' '}
                                <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                    {website.replace(/^https?:\/\//, '')} <ExternalIcon />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
