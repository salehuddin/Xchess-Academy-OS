import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Input,
    Select,
    SelectItem,
    CheckboxGroup,
    Checkbox,
    Spinner,
    Divider
} from "@heroui/react";
import axios from 'axios';

export default function BulkCreate({ packages, days }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        package_id: '',
        day: '',
        dates: []
    });

    const [previewData, setPreviewData] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);

    const handlePreview = async () => {
        if (!data.package_id || !data.day || !data.month) return;

        setLoadingPreview(true);
        try {
            const response = await axios.post(route('admin.schedules.preview'), {
                package_id: data.package_id,
                day: data.day,
                month: data.month
            });
            setPreviewData(response.data);
            setSelectedDates(response.data.dates);
            setData('dates', response.data.dates);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleDateChange = (values) => {
        setSelectedDates(values);
        setData('dates', values);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.schedules.bulk-store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Bulk Schedule Generator</h2>}
        >
            <Head title="Bulk Schedule Generator" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card className="bg-white shadow-md">
                        <CardHeader className="flex gap-3">
                            <div className="flex flex-col">
                                <p className="text-md">Generate Monthly Schedules</p>
                                <p className="text-small text-default-500">Select package and day to auto-generate sessions.</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <form onSubmit={submit} className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        type="month"
                                        label="Month"
                                        value={data.month}
                                        onChange={(e) => setData('month', e.target.value)}
                                        isRequired
                                    />
                                    
                                    <Select
                                        label="Package"
                                        placeholder="Select a package"
                                        selectedKeys={data.package_id ? [data.package_id] : []}
                                        onChange={(e) => setData('package_id', e.target.value)}
                                        isRequired
                                    >
                                        {packages.map((pkg) => (
                                            <SelectItem key={pkg.id} value={pkg.id}>
                                                {pkg.title}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Select
                                        label="Day of Week"
                                        placeholder="Select day"
                                        selectedKeys={data.day ? [data.day] : []}
                                        onChange={(e) => setData('day', e.target.value)}
                                        isRequired
                                    >
                                        {days.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                <div className="flex justify-end">
                                    <Button 
                                        color="primary" 
                                        variant="flat" 
                                        onPress={handlePreview}
                                        isLoading={loadingPreview}
                                        isDisabled={!data.package_id || !data.day || !data.month}
                                    >
                                        Preview Dates
                                    </Button>
                                </div>

                                {previewData && (
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <h3 className="font-semibold mb-2">
                                            Found {previewData.classes_count} Classes
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            These classes run on {data.day}s. Select the dates to schedule sessions for them:
                                        </p>

                                        {previewData.dates.length > 0 ? (
                                            <CheckboxGroup
                                                label="Select Dates"
                                                value={selectedDates}
                                                onChange={handleDateChange}
                                                orientation="horizontal"
                                                className="gap-4"
                                            >
                                                {previewData.dates.map((date) => (
                                                    <Checkbox key={date} value={date}>
                                                        {new Date(date).toLocaleDateString(undefined, { 
                                                            weekday: 'short', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        })}
                                                    </Checkbox>
                                                ))}
                                            </CheckboxGroup>
                                        ) : (
                                            <p className="text-warning">No dates found for this month/day.</p>
                                        )}

                                        <div className="mt-4 text-xs text-gray-500">
                                            Example Classes affected:
                                            <ul className="list-disc ml-5 mt-1">
                                                {previewData.classes_preview?.slice(0, 3).map(c => (
                                                    <li key={c.id}>
                                                        {c.time} - Room: {c.room} (Coach: {c.coach})
                                                    </li>
                                                ))}
                                                {previewData.classes_preview?.length > 3 && <li>...and {previewData.classes_preview.length - 3} more</li>}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-2">
                                    <Button 
                                        type="submit" 
                                        color="primary"
                                        isLoading={processing}
                                        isDisabled={!previewData || selectedDates.length === 0}
                                    >
                                        Generate Schedules
                                    </Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
