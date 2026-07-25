import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Chip,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination
} from "@heroui/react";

export default function Show({ announcement, dispatches }) {
    const { auth } = usePage().props;

    const statusColor = (s) => s === 'Sent' ? 'success' : 'warning';
    const dispatchColor = (s) => {
        if (s === 'Sent') return 'success';
        if (s === 'Failed') return 'danger';
        if (s === 'Skipped') return 'default';
        return 'warning';
    };

    const send = () => {
        if (!confirm('Send this announcement now?')) return;
        router.post(route('admin.announcements.send', announcement.id));
    };

    const onPageChange = (page) => {
        router.get(route('admin.announcements.show', announcement.id), { page }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Announcement</h2>
                        <p className="text-sm text-gray-500">Review message and delivery history</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button as={Link} href={route('admin.announcements.index')} variant="flat">
                            Back
                        </Button>
                        {announcement.status !== 'Sent' ? (
                            <Button color="primary" onPress={send}>
                                Send Now
                            </Button>
                        ) : null}
                    </div>
                </div>
            }
        >
            <Head title="Announcement" />

            <div className="space-y-6">
                <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="text-lg font-semibold text-foreground">{announcement.title}</div>
                            <div className="flex items-center gap-2">
                                <Chip size="sm" variant="flat">{announcement.channel}</Chip>
                                <Chip size="sm" variant="flat">{announcement.audience}</Chip>
                                <Chip size="sm" color={statusColor(announcement.status)} variant="flat">{announcement.status}</Chip>
                            </div>
                        </div>
                        <div className="text-sm text-default-500">
                            Sent: {announcement.sent_at ?? '-'}
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="space-y-4">
                        {announcement.subject ? (
                            <div className="text-sm">
                                <div className="text-default-500">Subject</div>
                                <div className="text-foreground">{announcement.subject}</div>
                            </div>
                        ) : null}
                        <div className="text-sm">
                            <div className="text-default-500">Body</div>
                            <div className="text-foreground whitespace-pre-wrap">{announcement.body}</div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-gray-100">
                    <CardHeader className="font-semibold text-foreground">
                        Dispatches
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Table aria-label="Announcement dispatches table" removeWrapper>
                            <TableHeader>
                                <TableColumn>WHEN</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>RECIPIENT</TableColumn>
                                <TableColumn>ERROR</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No dispatches yet.">
                                {(dispatches?.data ?? []).map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell>{d.scheduled_for}</TableCell>
                                        <TableCell>
                                            <Chip size="sm" color={dispatchColor(d.status)} variant="flat">
                                                {d.status}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>{d.recipient}</TableCell>
                                        <TableCell>{d.error ?? '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {dispatches?.last_page > 1 ? (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    page={dispatches.current_page}
                                    total={dispatches.last_page}
                                    onChange={onPageChange}
                                    showControls
                                />
                            </div>
                        ) : null}
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

