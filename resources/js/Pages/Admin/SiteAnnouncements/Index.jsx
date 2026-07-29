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

const typeColor = (t) => t === 'warning' ? 'warning' : t === 'success' ? 'success' : 'primary';

export default function Index({ announcements, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters?.search ?? '');
    const [type, setType] = useState(filters?.type ?? '');

    const applyFilters = useCallback(() => {
        router.get(route('admin.site-announcements.index'), {
            search: search || undefined,
            type: type || undefined,
        }, { preserveState: true, replace: true });
    }, [search, type]);

    const clearFilters = useCallback(() => {
        setSearch('');
        setType('');
        router.get(route('admin.site-announcements.index'), {}, { preserveState: true, replace: true });
    }, []);

    const onPageChange = useCallback((page) => {
        router.get(route('admin.site-announcements.index'), { ...filters, page }, { preserveState: true, replace: true });
    }, [filters]);

    const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '-');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Site Announcements</h2>
                        <p className="text-sm text-gray-500">Manage banners shown on the public home page</p>
                    </div>
                    <Button as={Link} href={route('admin.site-announcements.create')} color="primary">
                        New Announcement
                    </Button>
                </div>
            }
        >
            <Head title="Site Announcements" />

            <Card className="shadow-sm border border-gray-100">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <Input
                            label="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                            startContent={<SearchIcon />}
                            className="w-full md:w-[280px]"
                        />
                        <Select
                            label="Type"
                            selectedKeys={type ? [type] : []}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full md:w-[200px]"
                        >
                            <SelectItem key="info">info</SelectItem>
                            <SelectItem key="warning">warning</SelectItem>
                            <SelectItem key="success">success</SelectItem>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="flat" onPress={clearFilters}>Clear</Button>
                        <Button color="primary" onPress={applyFilters}>Apply</Button>
                        <label className="flex items-center text-default-400 text-small ml-2">
                            Rows per page:
                            <select
                                className="bg-transparent outline-none text-default-400 text-small ml-1"
                                onChange={(e) => router.get(route('admin.site-announcements.index'), { ...filters, per_page: Number(e.target.value), page: 1 }, { preserveState: true })}
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
                    <Table aria-label="Site announcements table" removeWrapper>
                        <TableHeader>
                            <TableColumn>TITLE</TableColumn>
                            <TableColumn>TYPE</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>PUBLISHED</TableColumn>
                            <TableColumn>EXPIRES</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No site announcements yet.">
                            {(announcements?.data ?? []).map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell className="max-w-xs truncate">{a.title}</TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={typeColor(a.type)} variant="flat">{a.type}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={a.is_active ? 'success' : 'default'} variant="flat">
                                            {a.is_active ? 'Active' : 'Inactive'}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{fmtDate(a.published_at)}</TableCell>
                                    <TableCell>{fmtDate(a.expires_at)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <Link className="text-primary hover:underline" href={route('admin.site-announcements.edit', a.id)}>Edit</Link>
                                            <Link
                                                as="button"
                                                method="delete"
                                                href={route('admin.site-announcements.destroy', a.id)}
                                                className="text-danger hover:underline"
                                                onBefore={() => confirm('Delete this site announcement?')}
                                            >
                                                Delete
                                            </Link>
                                        </div>
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
