import { Head, Link, usePage } from '@inertiajs/react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Chip
} from "@heroui/react";
import Logo from '@/Components/Logo';

const InfoIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16v-4M12 8h.01" />
  </svg>
);

const ParentIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 21v-1a6 6 0 016-6h2a6 6 0 016 6v1" />
  </svg>
);

const CoachIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 20.5 7.1 17.2l.9-5.5-4-3.9L9.5 7 12 2z" />
  </svg>
);

const AdminIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 2a5 5 0 11-5 5 5 5 0 015-5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 22v-2a7 7 0 017-7h4a7 7 0 017 7v2" />
  </svg>
);

const MailIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" />
    <path d="M3 7l9 6 9-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhoneIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const ClockIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 2" />
  </svg>
);

const PinIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" strokeWidth="1.5" />
  </svg>
);

const ExternalIcon = (props) => (
  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="1em" height="1em" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const typeColor = (t) => (t === 'warning' ? 'warning' : t === 'success' ? 'success' : 'primary');

const fmtRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  return d.toLocaleDateString();
};

export default function Welcome({ auth, announcements = [], company = {}, support = {} }) {
  const hasAnnouncements = announcements && announcements.length > 0;
  const { academy } = usePage().props;
  const website = company.website || academy?.website || 'https://xchessacademy.com';
  const websiteDisplay = website.replace(/^https?:\/\//, '');
  const supportEmail = support.email || academy?.support_email || 'support@xchess-academy.com';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Head title="XChess Academy Portal" />

      {/* Navbar */}
      <Navbar maxWidth="xl" position="static" className="bg-background/70 backdrop-blur-md border-b border-divider">
        <NavbarBrand>
          <Link href={route('home')} className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold text-inherit text-xl tracking-tight">XCHESS ACADEMY</span>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end">
          {auth.user ? (
            <NavbarItem>
              <Button as={Link} href={route('dashboard')} color="primary" variant="flat">
                Dashboard
              </Button>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem>
                <Button as={Link} href={route('login')} variant="light">
                  Log in
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button as={Link} href={route('register')} color="primary" variant="solid">
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <main className="flex-grow">
        {/* Portal Welcome Header */}
        <section className="py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Welcome to the XChess Academy Portal
            </h1>
            <p className="text-lg text-default-600 max-w-2xl mx-auto">
              Sign in to manage classes, schedules, invoices, attendance, and student records.
            </p>
            <div className="flex justify-center gap-4 pt-6">
              {!auth.user && (
                <Button as={Link} href={route('login')} size="lg" color="primary" className="font-semibold shadow-lg shadow-primary/40">
                  Sign In
                </Button>
              )}
              <Button as={Link} href="#portals" size="lg" variant="bordered">
                View Portals
              </Button>
            </div>
          </div>
        </section>

        {/* Announcements Section */}
        {hasAnnouncements && (
          <section className="px-6 pb-6">
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-2xl font-bold text-center text-foreground">Announcements</h2>
              {announcements.map((a) => (
                <Card
                  key={a.id}
                  className={`border-l-4 shadow-sm ${
                    a.type === 'warning' ? 'border-l-warning' : a.type === 'success' ? 'border-l-success' : 'border-l-primary'
                  }`}
                >
                  <CardHeader className="flex items-center justify-between gap-3 pb-0 pt-4 px-5">
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color={typeColor(a.type)} variant="flat">
                        {a.type}
                      </Chip>
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                    </div>
                    {a.published_at && (
                      <span className="text-tiny text-default-400">{fmtRelative(a.published_at)}</span>
                    )}
                  </CardHeader>
                  <CardBody className="px-5 py-3">
                    <div
                      className="prose prose-sm max-w-none text-default-600 [&_p]:my-1"
                      dangerouslySetInnerHTML={{ __html: a.body }}
                    />
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Portals Section */}
        <section id="portals" className="py-16 px-6 bg-content1/40 border-y border-divider">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Access Your Portal</h2>
              <p className="mt-2 text-default-500">Choose the entrance that fits your role in the academy.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Parents */}
              <Card className="p-6 border border-divider shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <ParentIcon className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Parents</h3>
                <p className="text-default-500 mt-2 flex-grow">
                  Access invoices, receipts, and your child&apos;s progress via a secure,
                  token-based portal link sent to your email.
                </p>
                <Button as={Link} href={route('parent.access')} color="primary" variant="flat" className="mt-4">
                  Request Access Link
                </Button>
              </Card>

              {/* Coaches */}
              <Card className="p-6 border border-divider shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                  <CoachIcon className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Coaches</h3>
                <p className="text-default-500 mt-2 flex-grow">
                  Manage your classes, schedule, student attendance, and payroll all in
                  one dedicated coaching workspace.
                </p>
                <Button as={Link} href={route('login')} color="secondary" variant="flat" className="mt-4">
                  Coach Login
                </Button>
              </Card>

              {/* Admins */}
              <Card className="p-6 border border-divider shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4">
                  <AdminIcon className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Admins</h3>
                <p className="text-default-500 mt-2 flex-grow">
                  Run the academy end-to-end: students, finance, schedules, reports,
                  announcements, and system settings.
                </p>
                <Button as={Link} href={route('login')} color="success" variant="flat" className="mt-4">
                  Admin Login
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Help / Info Card */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 border border-divider shadow-sm bg-content1/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <InfoIcon className="text-xl" />
                </div>
                <div className="space-y-2 text-sm text-default-600">
                  <h3 className="text-base font-semibold text-foreground">Who is this portal for?</h3>
                  <p>
                    This portal is for <strong>parents</strong>, <strong>coaches</strong>, and <strong>admins</strong> of XChess Academy.
                    If you&apos;re having trouble accessing your account, please{' '}
                    <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">contact support</a>.
                  </p>
                  <p>
                    Want to learn about our chess classes or enroll your child? Visit our main website:{' '}
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                      {websiteDisplay} <ExternalIcon />
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Get in Touch</h2>
              <p className="mt-2 text-default-500">Questions about the academy or need technical support? We&apos;re here to help.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Academy */}
              <Card className="p-6 border border-divider shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <InfoIcon className="text-xl text-primary" />
                  <h3 className="text-lg font-bold text-foreground">{company.name || 'XChess Academy'}</h3>
                </div>
                <ul className="space-y-3 text-default-600 text-sm">
                  {company.address && (
                    <li className="flex items-start gap-3">
                      <PinIcon className="text-default-400 mt-0.5" />
                      <span className="whitespace-pre-line">{company.address}</span>
                    </li>
                  )}
                  {company.email && (
                    <li className="flex items-center gap-3">
                      <MailIcon className="text-default-400" />
                      <a href={`mailto:${company.email}`} className="hover:text-primary hover:underline">{company.email}</a>
                    </li>
                  )}
                  {company.phone && (
                    <li className="flex items-center gap-3">
                      <PhoneIcon className="text-default-400" />
                      <a href={`tel:${company.phone}`} className="hover:text-primary hover:underline">{company.phone}</a>
                    </li>
                  )}
                  {websiteDisplay && (
                    <li className="flex items-center gap-3">
                      <ExternalIcon className="text-default-400" />
                      <a href={website} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">{websiteDisplay}</a>
                    </li>
                  )}
                </ul>
              </Card>

              {/* Support */}
              <Card className="p-6 border border-divider shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CoachIcon className="text-xl text-success" />
                  <h3 className="text-lg font-bold text-foreground">Support</h3>
                </div>
                <ul className="space-y-3 text-default-600 text-sm">
                  {support.email && (
                    <li className="flex items-center gap-3">
                      <MailIcon className="text-default-400" />
                      <a href={`mailto:${support.email}`} className="hover:text-primary hover:underline">{support.email}</a>
                    </li>
                  )}
                  {support.phone && (
                    <li className="flex items-center gap-3">
                      <PhoneIcon className="text-default-400" />
                      <a href={`tel:${support.phone}`} className="hover:text-primary hover:underline">{support.phone}</a>
                    </li>
                  )}
                  {support.hours && (
                    <li className="flex items-center gap-3">
                      <ClockIcon className="text-default-400" />
                      <span>{support.hours}</span>
                    </li>
                  )}
                </ul>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-default-400 text-sm border-t border-divider">
        &copy; {new Date().getFullYear()} {company.name || 'XChess Academy'} Portal. All rights reserved.
      </footer>
    </div>
  );
}
