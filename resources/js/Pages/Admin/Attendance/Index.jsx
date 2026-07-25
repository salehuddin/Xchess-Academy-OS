import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Button,
    Select,
    SelectItem,
    Pagination,
    DateRangePicker
} from "@heroui/react";
import { useCallback, useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { parseDate, getLocalTimeZone, today, startOfMonth, endOfMonth, startOfYear, endOfYear } from "@internationalized/date";
import AttendanceModal from './AttendanceModal';

// Icons
const ClockIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M12 6v6l4 2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const SearchIcon = (props) => (
    <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
    >
        <path
            d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
        <path
            d="M22 22L20 20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
        />
    </svg>
);

const AttendanceIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M7.5 18C8.32843 18 9 17.3284 9 16.5C9 15.6716 8.32843 15 7.5 15C6.67157 15 6 15.6716 6 16.5C6 17.3284 6.67157 18 7.5 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
    <path d="M16.5 18C17.3284 18 18 17.3284 18 16.5C18 15.6716 17.3284 15 16.5 15C15.6716 15 15 15.6716 15 16.5C15 17.3284 15.6716 18 16.5 18Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
    <path d="M2 11V16.5C2 19.5376 4.46243 22 7.5 22H16.5C19.5376 22 22 19.5376 22 16.5V11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    <path d="M2 11L12 2L22 11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
  </svg>
);

export default function Index({ auth, schedules, filters, classes, coaches }) {
    const [filterValues, setFilterValues] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
        class_id: filters.class_id || '',
        coach_id: filters.coach_id || '',
    });

    const getRangeForPeriod = (period) => {
        const now = today(getLocalTimeZone());
        switch (period) {
            case 'this_month':
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case 'last_month':
                const lastMonth = now.subtract({ months: 1 });
                return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
            case 'last_3_months':
                return { start: now.subtract({ months: 3 }), end: now };
            case 'this_year':
                return { start: startOfYear(now), end: endOfYear(now) };
            default:
                return null;
        }
    };

    const [selectedPeriod, setSelectedPeriod] = useState(() => {
        if (!filters.start_date || !filters.end_date) return new Set(['this_month']);

        const start = filters.start_date;
        const end = filters.end_date;
        const periods = ['this_month', 'last_month', 'last_3_months', 'this_year'];

        for (const p of periods) {
            const range = getRangeForPeriod(p);
            if (range.start.toString() === start && range.end.toString() === end) {
                return new Set([p]);
            }
        }
        return new Set(['custom']);
    });

    // Debounced update for filters to avoid excessive reloads
    const applyFilters = useCallback(
        debounce((newFilters) => {
            router.get(route('admin.attendances.index'), newFilters, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        }, 500),
        []
    );

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filterValues, [key]: value };
        setFilterValues(newFilters);
        applyFilters(newFilters);
    };

    const handleDateRangeChange = (range) => {
         if (!range || !range.start || !range.end) return;
         const start = range.start.toString();
         const end = range.end.toString();

         const newFilters = { ...filterValues, start_date: start, end_date: end };
         setFilterValues(newFilters);
         applyFilters(newFilters);
    };

    const handlePeriodChange = (keys) => {
        setSelectedPeriod(keys);
        const period = Array.from(keys)[0];

        if (period === 'custom') return;

        const range = getRangeForPeriod(period);
        if (range) {
            handleDateRangeChange(range);
        }
    };

    const onPageChange = (page) => {
        router.get(route('admin.attendances.index'), { ...filterValues, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [rowsPerPage, setRowsPerPage] = useState(schedules.per_page || 10);

    const onRowsPerPageChange = useCallback((e) => {
        const perPage = Number(e.target.value);
        setRowsPerPage(perPage);
        router.get(route('admin.attendances.index'), { ...filterValues, per_page: perPage, page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [filterValues]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const handleEditClick = useCallback((session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setSelectedSession(null);
        router.reload({ only: ['schedules'] });
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <Select
                        label="Period"
                        selectedKeys={selectedPeriod}
                        onSelectionChange={handlePeriodChange}
                        size="sm"
                        variant="bordered"
                        disallowEmptySelection
                        className="w-40"
                    >
                        <SelectItem key="this_month">This Month</SelectItem>
                        <SelectItem key="last_month">Last Month</SelectItem>
                        <SelectItem key="last_3_months">Last 3 Months</SelectItem>
                        <SelectItem key="this_year">This Year</SelectItem>
                        <SelectItem key="custom">Custom</SelectItem>
                    </Select>

                    {selectedPeriod.has('custom') && (
                        <DateRangePicker
                            label="Date Range"
                            value={filterValues.start_date && filterValues.end_date ? {
                                start: parseDate(filterValues.start_date),
                                end: parseDate(filterValues.end_date)
                            } : null}
                            onChange={handleDateRangeChange}
                            size="sm"
                            variant="bordered"
                            className="w-60"
                        />
                    )}

                    <Select
                        label="Class"
                        placeholder="All Classes"
                        selectedKeys={filterValues.class_id ? [String(filterValues.class_id)] : []}
                        onChange={(e) => handleFilterChange('class_id', e.target.value)}
                        size="sm"
                        variant="bordered"
                        className="w-48"
                    >
                        {classes.map((cls) => (
                            <SelectItem key={String(cls.id)} textValue={cls.name}>
                                {cls.name}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Coach"
                        placeholder="All Coaches"
                        selectedKeys={filterValues.coach_id ? [String(filterValues.coach_id)] : []}
                        onChange={(e) => handleFilterChange('coach_id', e.target.value)}
                        size="sm"
                        variant="bordered"
                        className="w-48"
                    >
                        {coaches.map((coach) => (
                            <SelectItem key={String(coach.id)} textValue={coach.name}>
                                {coach.name}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {schedules.total} sessions</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            value={rowsPerPage}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [selectedPeriod, filterValues, handlePeriodChange, handleDateRangeChange, handleFilterChange, classes, coaches, schedules.total, rowsPerPage, onRowsPerPageChange]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={schedules.current_page}
                    total={schedules.last_page}
                    onChange={onPageChange}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={schedules.prev_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(schedules.current_page - 1)}>
                        Previous
                    </Button>
                    <Button isDisabled={schedules.next_page_url === null} size="sm" variant="flat" onPress={() => onPageChange(schedules.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [schedules.current_page, schedules.last_page, schedules.prev_page_url, schedules.next_page_url, onPageChange]);

    const todayDate = useMemo(() => today(getLocalTimeZone()), []);

    const renderCell = useCallback((item, columnKey) => {
        switch (columnKey) {
            case "date":
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-small capitalize">
                            {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-tiny text-default-400">
                            {item.start_time} - {item.end_time}
                        </span>
                    </div>
                );
            case "class":
                return (
                    <div className="flex flex-col">
                        <p className="font-bold text-small capitalize">{item.class_name}</p>
                        <p className="text-tiny text-default-400 capitalize">{item.room_name}</p>
                    </div>
                );
            case "coach":
                return (
                    <div className="flex flex-col">
                        <p className="text-small capitalize">{item.coach_name}</p>
                    </div>
                );
            case "topic":
                 return (
                    <div className="flex flex-col max-w-[200px]">
                        <p className="text-small truncate">{item.topic || '-'}</p>
                    </div>
                );
            case "status":
                return (
                    <Chip
                        className="capitalize"
                        color={item.is_delivered ? "success" : "warning"}
                        size="sm"
                        variant="flat"
                    >
                        {item.is_delivered ? "Delivered" : "Pending"}
                    </Chip>
                );
            case "actions":
                const isFuture = parseDate(item.date).compare(todayDate) > 0;
                return (
                    <div className="relative flex items-center gap-2">
                        <Button
                            onPress={() => handleEditClick(item)}
                            isDisabled={isFuture}
                            color={isFuture ? "default" : "primary"}
                            size="sm"
                            variant="light"
                            isIconOnly
                            startContent={<AttendanceIcon className="text-lg" />}
                            title={isFuture ? "Cannot take attendance for future dates" : "Take Attendance"}
                        />
                    </div>
                );
            default:
                return item[columnKey];
        }
    }, [handleEditClick, todayDate]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-foreground">Attendance</h2>
                            <p className="text-sm text-default-500">Manage class attendance sessions</p>
                        </div>
                    </div>

                </div>
            }
        >
            <Head title="Attendance" />

            <div className="space-y-6">
                <Table
                    aria-label="Attendance sessions table"
                    isHeaderSticky
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "bg-transparent shadow-none",
                    }}
                    topContent={topContent}
                    topContentPlacement="outside"
                >
                    <TableHeader>
                        <TableColumn key="date">DATE / TIME</TableColumn>
                        <TableColumn key="class">CLASS / ROOM</TableColumn>
                        <TableColumn key="coach">COACH</TableColumn>
                        <TableColumn key="topic">TOPIC</TableColumn>
                        <TableColumn key="status">STATUS</TableColumn>
                        <TableColumn key="actions" align="end">ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={schedules.data}
                        emptyContent={
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <ClockIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No sessions found</h3>
                                <p className="text-sm text-gray-500">Try adjusting your filters</p>
                            </div>
                        }
                    >
                        {(item) => (
                            <TableRow key={`${item.id}-${item.date}`}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AttendanceModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                session={selectedSession}
            />
        </AuthenticatedLayout>
    );
}
