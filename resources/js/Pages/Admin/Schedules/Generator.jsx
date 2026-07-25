import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    Divider,
    Spinner,
    Chip,
    Tabs,
    Tab
} from "@heroui/react";
import axios from 'axios';

export default function Generator({ auth, packages }) {
    const { flash = {} } = usePage().props;
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);

    const { data, setData, post, processing, errors, transform } = useForm({
        month: currentMonth,
        package_ids: new Set([]),
        excluded_dates: new Set([])
    });

    const [calendarData, setCalendarData] = useState([]);
    const [totalClasses, setTotalClasses] = useState(0);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewLoaded, setPreviewLoaded] = useState(false);

    // Clear Tab State
    const [selectedTab, setSelectedTab] = useState("generate");
    const [clearPreviewData, setClearPreviewData] = useState(null);
    const [loadingClearPreview, setLoadingClearPreview] = useState(false);

    const handlePreview = async () => {
        if (!data.month) return;

        setLoadingPreview(true);
        try {
            const response = await axios.post(route('admin.schedules.preview'), {
                month: data.month,
                package_ids: Array.from(data.package_ids)
            });
            setCalendarData(response.data.calendar);
            setTotalClasses(response.data.total_classes);
            setPreviewLoaded(true);

            // Reset excluded dates when previewing new data
            setData('excluded_dates', new Set([]));
        } catch (error) {
            console.error("Preview error:", error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const toggleDate = (date) => {
        const newExcluded = new Set(data.excluded_dates);
        if (newExcluded.has(date)) {
            newExcluded.delete(date);
        } else {
            newExcluded.add(date);
        }
        setData('excluded_dates', newExcluded);
    };

    // Register transform on mount
    useEffect(() => {
        transform((data) => ({
            ...data,
            package_ids: Array.from(data.package_ids),
            excluded_dates: Array.from(data.excluded_dates)
        }));
    }, []);

    // Clear Schedules Logic
    const handleClearPreview = async () => {
        if (!data.month) return;
        setLoadingClearPreview(true);
        try {
            const response = await axios.post(route('admin.schedules.preview-clear'), {
                month: data.month,
                package_ids: Array.from(data.package_ids)
            });
            setClearPreviewData(response.data);
        } catch (error) {
            console.error("Clear preview error:", error);
        } finally {
            setLoadingClearPreview(false);
        }
    };

    const handleClear = () => {
        if (!confirm("Are you sure you want to clear these schedules? Protected schedules with attendance will be kept.")) return;

        post(route('admin.schedules.clear'), {
            preserveScroll: true,
            onSuccess: () => {
                setClearPreviewData(null);
            }
        });
    };

    const submit = () => {
        post(route('admin.schedules.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Optionally clear exclusions if desired, or keep them
            },
            onError: (errors) => {
                console.error("Submission errors:", errors);
            }
        });
    };

    // Calendar Generation Logic
    const calendarGrid = useMemo(() => {
        if (!data.month) return [];
        const [year, month] = data.month.split('-');
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0, Sun=6

        const grid = [];
        // Padding
        for (let i = 0; i < startDayOfWeek; i++) {
            grid.push(null);
        }
        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${data.month}-${String(i).padStart(2, '0')}`;
            grid.push(dateStr);
        }
        return grid;
    }, [data.month]);

    const getDayData = (dateStr) => {
        return calendarData.find(d => d.date === dateStr);
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Schedule Generator</h2>}
        >
            <Head title="Schedule Generator" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {flash.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Success! </strong>
                            <span className="block sm:inline">{flash.success}</span>
                        </div>
                    )}
                    {flash.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error! </strong>
                            <span className="block sm:inline">{flash.error}</span>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col gap-4">
                        <Tabs
                            aria-label="Options"
                            selectedKey={selectedTab}
                            onSelectionChange={setSelectedTab}
                            color="primary"
                            variant="underlined"
                        >
                            <Tab key="generate" title="Generate Schedules">
                                <Card className="bg-white shadow-md">
                                    <CardHeader>
                                        <div className="flex flex-col">
                                            <h3 className="text-lg font-bold">1. Configuration</h3>
                                            <p className="text-sm text-default-500">Select month and packages to generate schedules.</p>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <Input
                                                type="month"
                                                label="Month"
                                                value={data.month}
                                                onChange={(e) => setData('month', e.target.value)}
                                                isRequired
                                            />
                                            <Select
                                                label="Packages"
                                                placeholder="Select packages (optional)"
                                                selectionMode="multiple"
                                                selectedKeys={data.package_ids}
                                                onSelectionChange={(keys) => setData('package_ids', keys)}
                                                className="max-w-xs"
                                            >
                                                {packages.map((pkg) => (
                                                    <SelectItem key={pkg.id} textValue={pkg.title}>
                                                        {pkg.title}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            <Button
                                                color="primary"
                                                onPress={handlePreview}
                                                isLoading={loadingPreview}
                                            >
                                                Preview Schedule
                                            </Button>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Tab>
                            <Tab key="clear" title="Clear Schedules">
                                <Card className="bg-white shadow-md">
                                    <CardHeader>
                                        <div className="flex flex-col">
                                            <h3 className="text-lg font-bold">Safe Bulk Delete</h3>
                                            <p className="text-sm text-default-500">
                                                Remove schedules for a specific month.
                                                <span className="text-danger font-medium ml-1">
                                                    Safe Mode: Schedules with attendance/sessions will be protected.
                                                </span>
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="gap-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <Input
                                                type="month"
                                                label="Month to Clear"
                                                value={data.month}
                                                onChange={(e) => setData('month', e.target.value)}
                                                isRequired
                                            />
                                            <Select
                                                label="Packages"
                                                placeholder="Select packages (optional)"
                                                selectionMode="multiple"
                                                selectedKeys={data.package_ids}
                                                onSelectionChange={(keys) => setData('package_ids', keys)}
                                                className="max-w-xs"
                                            >
                                                {packages.map((pkg) => (
                                                    <SelectItem key={pkg.id} textValue={pkg.title}>
                                                        {pkg.title}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                onPress={handleClearPreview}
                                                isLoading={loadingClearPreview}
                                            >
                                                Preview Deletion
                                            </Button>
                                        </div>

                                        {clearPreviewData && (
                                            <div className="mt-4 p-4 bg-default-50 rounded-lg border border-default-200">
                                                <h4 className="font-semibold mb-2">Deletion Summary</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-tiny text-default-500">Total Classes</p>
                                                        <p className="text-xl font-bold">{clearPreviewData.total_classes}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-tiny text-default-500">Total Schedules</p>
                                                        <p className="text-xl font-bold">{clearPreviewData.total_schedules}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-tiny text-success-600">Protected (Attendance)</p>
                                                        <p className="text-xl font-bold text-success-600">{clearPreviewData.protected_schedules}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-tiny text-danger-600">To Be Deleted</p>
                                                        <p className="text-xl font-bold text-danger-600">{clearPreviewData.deletable_schedules}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex justify-end">
                                                    <Button
                                                        color="danger"
                                                        onPress={handleClear}
                                                        isDisabled={clearPreviewData.deletable_schedules === 0}
                                                        isLoading={processing}
                                                    >
                                                        Confirm & Clear Schedules
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Tab>
                        </Tabs>
                    </div>

                    {/* Calendar View (Only for Generate Tab) */}
                    {selectedTab === "generate" && previewLoaded && (
                        <Card className="bg-white shadow-md">
                            <CardHeader className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold">2. Review & Customize</h3>
                                    <p className="text-sm text-default-500">
                                        Found {totalClasses} classes. Click on a date to toggle it as "Academy Closed".
                                    </p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <div className="flex items-center gap-1 text-sm">
                                        <div className="w-3 h-3 bg-primary-100 rounded-full"></div>
                                        <span>Scheduled</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        <div className="w-3 h-3 bg-danger-100 rounded-full"></div>
                                        <span>Excluded</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-gray-500">
                                    <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarGrid.map((dateStr, index) => {
                                        if (!dateStr) return <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded-lg"></div>;

                                        const dayData = getDayData(dateStr);
                                        const isExcluded = data.excluded_dates.has(dateStr);
                                        const hasSessions = dayData && dayData.count > 0;

                                        let bgColor = "bg-white border-1 border-gray-200";
                                        if (isExcluded) bgColor = "bg-danger-50 border-danger-200";
                                        else if (hasSessions) bgColor = "bg-primary-50 border-primary-200";

                                        return (
                                            <div
                                                key={dateStr}
                                                className={`h-24 p-2 rounded-lg cursor-pointer transition-colors relative ${bgColor} hover:brightness-95`}
                                                onClick={() => toggleDate(dateStr)} // Wait, toggleDate name check
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-bold ${isExcluded ? 'text-danger' : 'text-gray-700'}`}>
                                                        {parseInt(dateStr.split('-')[2])}
                                                    </span>
                                                    {isExcluded && <Chip size="sm" color="danger" variant="flat">Closed</Chip>}
                                                </div>

                                                {!isExcluded && hasSessions && (
                                                    <div className="mt-2">
                                                        <div className="text-xs font-semibold text-primary-600">
                                                            {dayData.count} Sessions
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 truncate mt-1">
                                                            {dayData.classes.slice(0, 2).join(', ')}
                                                            {dayData.classes.length > 2 && ` +${dayData.classes.length - 2}`}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardBody>
                            <Divider />
                            <CardBody>
                                <div className="flex justify-end">
                                    <Button
                                        color="success"
                                        className="text-white"
                                        size="lg"
                                        onPress={submit}
                                        isLoading={processing}
                                    >
                                        Generate & Save Schedules
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
