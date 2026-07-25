import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
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
    Input,
    Select,
    SelectItem,
    Button,
    Chip,
    Pagination,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";

export default function Index({ auth, activities, filters, events }) {
    const [search, setSearch] = useState(filters.search || '');
    const [event, setEvent] = useState(filters.event || '');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.activity-logs.index'), { search, event }, { preserveState: true });
    };

    const handleClearFilter = () => {
        setSearch('');
        setEvent('');
        router.get(route('admin.activity-logs.index'));
    };

    const openDetails = (activity) => {
        setSelectedActivity(activity);
        onOpen();
    };

    const getEventColor = (evt) => {
        switch (evt?.toLowerCase()) {
            case 'created': return 'success';
            case 'updated': return 'warning';
            case 'deleted': return 'danger';
            default: return 'primary';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">User Activity Logs</h2>}
        >
            <Head title="User Activity Logs" />

            <div className="py-6 space-y-6 max-w-7xl mx-auto">
                <Card className="bg-content1 shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold">Audit & Activity Log Trail</h3>
                            <p className="text-sm text-default-500">Monitor staff actions, data modifications, and role authorization events.</p>
                        </div>

                        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <Input
                                size="sm"
                                placeholder="Search by description or user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64"
                            />
                            <Select
                                size="sm"
                                placeholder="Filter Event"
                                selectedKeys={event ? [event] : []}
                                onSelectionChange={(keys) => setEvent(Array.from(keys)[0] || '')}
                                className="w-full sm:w-40"
                            >
                                {events.map((evt) => (
                                    <SelectItem key={evt} textValue={evt}>{evt}</SelectItem>
                                ))}
                            </Select>
                            <Button size="sm" color="primary" type="submit">Filter</Button>
                            {(search || event) && (
                                <Button size="sm" variant="flat" onPress={handleClearFilter}>Clear</Button>
                            )}
                            <label className="flex items-center text-default-400 text-small ml-auto sm:ml-2">
                                Rows per page:
                                <select
                                    className="bg-transparent outline-none text-default-400 text-small ml-1"
                                    onChange={(e) => router.get(route('admin.activity-logs.index'), { ...filters, per_page: Number(e.target.value), page: 1 }, { preserveState: true })}
                                    value={filters?.per_page || 10}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </label>
                        </form>
                    </CardHeader>
                    <CardBody className="p-6">
                        <Table aria-label="Activity Logs Table" className="min-w-full">
                            <TableHeader>
                                <TableColumn>ID</TableColumn>
                                <TableColumn>EVENT</TableColumn>
                                <TableColumn>USER (CAUSER)</TableColumn>
                                <TableColumn>DESCRIPTION</TableColumn>
                                <TableColumn>SUBJECT</TableColumn>
                                <TableColumn>DATE & TIME</TableColumn>
                                <TableColumn align="center">ACTION</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No activity logs found.">
                                {activities.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>#{item.id}</TableCell>
                                        <TableCell>
                                            <Chip size="sm" color={getEventColor(item.event)} variant="flat">
                                                {item.event || 'default'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{item.causer?.name || 'System / Automated'}</span>
                                                <span className="text-xs text-default-400">{item.causer?.email || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">{item.description}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono text-default-500">
                                                {item.subject_type ? `${item.subject_type.split('\\').pop()} #${item.subject_id}` : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-default-500">
                                                {new Date(item.created_at).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="flat" color="primary" onPress={() => openDetails(item)}>
                                                View Diff
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {activities.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    total={activities.last_page}
                                    page={activities.current_page}
                                    onChange={(page) => router.get(route('admin.activity-logs.index'), { ...filters, page })}
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Details Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <span>Activity Log Details #{selectedActivity?.id}</span>
                        <span className="text-xs font-normal text-default-500">
                            Logged on {selectedActivity ? new Date(selectedActivity.created_at).toLocaleString() : ''}
                        </span>
                    </ModalHeader>
                    <ModalBody>
                        {selectedActivity && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm bg-default-50 p-3 rounded-lg">
                                    <div>
                                        <span className="text-default-500 font-medium">Causer User:</span>
                                        <p className="font-semibold">{selectedActivity.causer?.name || 'System'}</p>
                                    </div>
                                    <div>
                                        <span className="text-default-500 font-medium">Log Event:</span>
                                        <p><Chip size="sm" color={getEventColor(selectedActivity.event)} variant="flat">{selectedActivity.event || 'general'}</Chip></p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-default-500 font-medium">Description:</span>
                                        <p className="font-medium">{selectedActivity.description}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm mb-2">Properties / Attribute Changes:</h4>
                                    <pre className="bg-default-900 text-default-50 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-64">
                                        {JSON.stringify(selectedActivity.properties || {}, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AuthenticatedLayout>
    );
}
