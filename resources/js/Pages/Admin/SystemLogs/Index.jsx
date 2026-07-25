import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
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

export default function Index({ auth, logs, pagination, fileSizeKb, filters }) {
    const { flash = {} } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [level, setLevel] = useState(filters.level || '');
    const [selectedLog, setSelectedLog] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.system-logs.index'), { search, level }, { preserveState: true });
    };

    const handleClearLogs = () => {
        if (!confirm('Are you sure you want to clear the system log file? This cannot be undone.')) return;
        router.delete(route('admin.system-logs.clear'), { preserveScroll: true });
    };

    const openLogDetail = (log) => {
        setSelectedLog(log);
        onOpen();
    };

    const getLevelChip = (lvl) => {
        switch (lvl?.toUpperCase()) {
            case 'ERROR':
            case 'CRITICAL':
            case 'EMERGENCY':
                return <Chip size="sm" color="danger" variant="flat">ERROR</Chip>;
            case 'WARNING':
                return <Chip size="sm" color="warning" variant="flat">WARNING</Chip>;
            case 'INFO':
            case 'NOTICE':
                return <Chip size="sm" color="info" variant="flat">INFO</Chip>;
            default:
                return <Chip size="sm" color="default" variant="flat">{lvl}</Chip>;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-foreground leading-tight">System Logs Viewer</h2>}
        >
            <Head title="System Logs Viewer" />

            <div className="py-6 space-y-6 max-w-7xl mx-auto">
                {flash.success && (
                    <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Success! </strong>
                        <span>{flash.success}</span>
                    </div>
                )}

                <Card className="bg-content1 shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-6 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold">Laravel Runtime & Error Logs</h3>
                                <Chip size="sm" variant="bordered">File Size: {fileSizeKb} KB</Chip>
                            </div>
                            <p className="text-sm text-default-500">Inspect real-time system exceptions, warnings, and error stack traces.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <form onSubmit={handleFilter} className="flex items-center gap-2">
                                <Input
                                    size="sm"
                                    placeholder="Search log message..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-48"
                                />
                                <Select
                                    size="sm"
                                    placeholder="Level"
                                    selectedKeys={level ? [level] : []}
                                    onSelectionChange={(keys) => setLevel(Array.from(keys)[0] || '')}
                                    className="w-32"
                                >
                                    <SelectItem key="error" textValue="ERROR">ERROR</SelectItem>
                                    <SelectItem key="warning" textValue="WARNING">WARNING</SelectItem>
                                    <SelectItem key="info" textValue="INFO">INFO</SelectItem>
                                    <SelectItem key="debug" textValue="DEBUG">DEBUG</SelectItem>
                                </Select>
                                <Button size="sm" color="primary" type="submit">Filter</Button>
                                <label className="flex items-center text-default-400 text-small ml-2">
                                    Rows per page:
                                    <select
                                        className="bg-transparent outline-none text-default-400 text-small ml-1"
                                        onChange={(e) => router.get(route('admin.system-logs.index'), { ...filters, per_page: Number(e.target.value), page: 1 }, { preserveState: true })}
                                        value={pagination?.per_page || 10}
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </label>
                            </form>

                            <Button size="sm" color="danger" variant="flat" onPress={handleClearLogs}>
                                Clear Logs
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody className="p-6">
                        <Table aria-label="System Logs Table" className="min-w-full">
                            <TableHeader>
                                <TableColumn>LEVEL</TableColumn>
                                <TableColumn>TIMESTAMP</TableColumn>
                                <TableColumn>ENV</TableColumn>
                                <TableColumn>MESSAGE</TableColumn>
                                <TableColumn align="center">ACTION</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No system logs found.">
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{getLevelChip(log.level)}</TableCell>
                                        <TableCell>
                                            <span className="text-xs text-default-500 font-mono whitespace-nowrap">{log.timestamp}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="dot" color="primary">{log.environment}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-medium truncate max-w-xl">{log.message}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="flat" color="primary" onPress={() => openLogDetail(log)}>
                                                View Stack Trace
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {pagination.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <Pagination
                                    total={pagination.last_page}
                                    page={pagination.current_page}
                                    onChange={(page) => router.get(route('admin.system-logs.index'), { ...filters, page })}
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Stack Trace Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {getLevelChip(selectedLog?.level)}
                            <span className="text-sm font-bold truncate max-w-2xl">{selectedLog?.message}</span>
                        </div>
                        <span className="text-xs font-normal text-default-500">Logged on {selectedLog?.timestamp}</span>
                    </ModalHeader>
                    <ModalBody>
                        {selectedLog && (
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-sm mb-1">Message:</h4>
                                    <p className="text-sm p-3 bg-default-100 rounded-lg text-danger-600 font-mono">{selectedLog.message}</p>
                                </div>

                                {selectedLog.context && (
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">Stack Trace & Context:</h4>
                                        <pre className="bg-default-900 text-default-50 p-4 rounded-lg text-xs overflow-x-auto font-mono max-h-96 leading-relaxed">
                                            {selectedLog.context}
                                        </pre>
                                    </div>
                                )}
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
