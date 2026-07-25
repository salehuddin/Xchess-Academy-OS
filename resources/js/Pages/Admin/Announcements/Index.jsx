import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Input,
    Select,
    SelectItem,
    Pagination,
    Button
} from "@heroui/react";

const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export default function Index({ announcements, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [channel, setChannel] = useState(filters?.channel ?? '');
    const [audience, setAudience] = useState(filters?.audience ?? '');

    const statusColor = (s) => s === 'Sent' ? 'success' : 'warning';

    const applyFilters = useCallback(() => {
        router.get(route('admin.announcements.index'), {
            search: search || undefined,
            channel: channel || undefined,
            audience: audience || undefined,
        }, { preserveState: true, replace: true });
    }, [search, channel, audience]);

    const clearFilters = useCallback(() => {
        setSearch('');
        setChannel('');
        setAudience('');
        router.get(route('admin.announcements.index'), {}, { preserveState: true, replace: true });
    }, []);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.announcements.index'), { ...filters, page }, { preserveState: true, replace: true });
    }, [filters]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Announcements</h2>
                        <p className="text-sm text-gray-500">Send broadcast messages and review history</p>
                    </div>
                    <Button as={Link} href={route('admin.announcements.create')} color="primary">
                        New Announcement
                    </Button>
                </div>
            }
        >
            <Head title="Announcements" />

            <Card className="shadow-sm border border-gray-100">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <Input
                            label="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyFilters();
                            }}
                            startContent={<SearchIcon />}
                            className="w-full md:w-[280px]"
                        />
                        <Select
                            label="Channel"
                            selectedKeys={channel ? [channel] : []}
                            onChange={(e) => setChannel(e.target.value)}
                            className="w-full md:w-[200px]"
                        >
                            <SelectItem key="email">email</SelectItem>
                            <SelectItem key="whatsapp">whatsapp</SelectItem>
                        </Select>
                        <Select
                            label="Audience"
                            selectedKeys={audience ? [audience] : []}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full md:w-[200px]"
                        >
                            <SelectItem key="all_parents">all parents</SelectItem>
                            <SelectItem key="class">class</SelectItem>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="flat" onPress={clearFilters}>
                            Clear
                        </Button>
                        <Button color="primary" onPress={applyFilters}>
                            Apply
                        </Button>
                        <label className="flex items-center text-default-400 text-small ml-2">
                            Rows per page:
                            <select
                                className="bg-transparent outline-none text-default-400 text-small ml-1"
                                onChange={(e) => router.get(route('admin.announcements.index'), { ...filters, per_page: Number(e.target.value), page: 1 }, { preserveState: true })}
                                value={filters?.per_page || 10}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </label>
                    </div>
                </CardHeader>

                <CardBody>
                    <Table aria-label="Announcements table" removeWrapper>
                        <TableHeader>
                            <TableColumn>TITLE</TableColumn>
                            <TableColumn>CHANNEL</TableColumn>
                            <TableColumn>AUDIENCE</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>SENT</TableColumn>
                            <TableColumn>DISPATCHES</TableColumn>
                            <TableColumn>VIEW</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No announcements yet.">
                            {(announcements?.data ?? []).map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>{a.title}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">{a.channel}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" variant="flat">{a.audience}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={statusColor(a.status)} variant="flat">
                                            {a.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{a.sent_at ?? '-'}</TableCell>
                                    <TableCell>{a.dispatches_count ?? 0}</TableCell>
                                    <TableCell>
                                        <Link className="text-primary hover:underline" href={route('admin.announcements.show', a.id)}>
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {announcements?.last_page > 1 ? (
                        <div className="flex justify-center mt-6">
                            <Pagination
                                page={announcements.current_page}
                                total={announcements.last_page}
                                onChange={onPageChange}
                                showControls
                            />
                        </div>
                    ) : null}
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}

