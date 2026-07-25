import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip
} from "@heroui/react";

const PlusIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
            <path d="M6 12h12" />
            <path d="M12 18V6" />
        </g>
    </svg>
);

const EditIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
        <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
        <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10} strokeWidth={1.5} />
    </svg>
);

const DeleteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.25835 7.5 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
    </svg>
);

export default function Index({ notifications }) {
    const { auth } = usePage().props;

    const handleDelete = (id) => {
        if (!confirm('Delete this notification?')) return;
        router.delete(route('admin.notifications.destroy', id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Notifications</h2>
                        <p className="text-sm text-gray-500">Configure email and WhatsApp notifications</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            as={Link}
                            href={route('admin.notifications.settings')}
                            variant="flat"
                        >
                            Channel Settings
                        </Button>
                        <Button
                            as={Link}
                            href={route('admin.notifications.dispatches')}
                            variant="flat"
                        >
                            Dispatch Log
                        </Button>
                        <Button
                            as={Link}
                            href={route('admin.notifications.create')}
                            color="primary"
                            startContent={<PlusIcon />}
                        >
                            New Notification
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Notifications" />

            <Card className="shadow-sm border border-gray-100">
                <CardHeader className="flex items-center justify-between">
                    <div className="font-semibold text-foreground">Notification Builder</div>
                    <div className="text-sm text-default-500">
                        Variables: {'{{parent_name}}'}, {'{{student_name}}'}, {'{{invoice_month_year}}'}, {'{{invoice_total_amount}}'}, {'{{invoice_due_date}}'}, {'{{portal_url}}'}
                    </div>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Notifications table" removeWrapper>
                        <TableHeader>
                            <TableColumn>NAME</TableColumn>
                            <TableColumn>CHANNEL</TableColumn>
                            <TableColumn>TRIGGER</TableColumn>
                            <TableColumn>ACTIVE</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No notifications created yet.">
                            {(notifications ?? []).map((n) => (
                                <TableRow key={n.id}>
                                    <TableCell>{n.name}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {n.channel}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">
                                            {n.trigger}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={n.is_active ? 'success' : 'default'} variant="flat">
                                            {n.is_active ? 'Active' : 'Disabled'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Tooltip content="Edit">
                                                <Link
                                                    href={route('admin.notifications.edit', n.id)}
                                                    className="text-lg text-default-400 hover:text-default-600"
                                                >
                                                    <EditIcon />
                                                </Link>
                                            </Tooltip>
                                            <Tooltip color="danger" content="Delete">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(n.id)}
                                                    className="text-lg text-danger hover:opacity-80"
                                                >
                                                    <DeleteIcon />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
