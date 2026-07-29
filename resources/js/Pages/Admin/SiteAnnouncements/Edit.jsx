import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
    Switch
} from "@heroui/react";

export default function Edit({ announcement }) {
    const { data, setData, put, processing, errors } = useForm({
        title: announcement.title || '',
        body: announcement.body || '',
        type: announcement.type || 'info',
        is_active: announcement.is_active ?? true,
        published_at: announcement.published_at || '',
        expires_at: announcement.expires_at || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.site-announcements.update', announcement.id));
    };

    const toInputValue = (val) => {
        if (!val) return '';
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Edit Site Announcement</h2>
                        <p className="text-sm text-gray-500">{announcement.title}</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Site Announcement" />

            <Card className="w-full max-w-3xl mx-auto shadow-sm border border-gray-100">
                <CardBody className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <Input
                            label="Title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            errorMessage={errors.title}
                            isInvalid={!!errors.title}
                            isRequired
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Type"
                                selectedKeys={[data.type]}
                                onChange={(e) => setData('type', e.target.value)}
                                errorMessage={errors.type}
                                isInvalid={!!errors.type}
                                isRequired
                            >
                                <SelectItem key="info">Info</SelectItem>
                                <SelectItem key="warning">Warning</SelectItem>
                                <SelectItem key="success">Success</SelectItem>
                            </Select>

                            <div className="flex items-end pb-2">
                                <Switch
                                    isSelected={data.is_active}
                                    onValueChange={(val) => setData('is_active', val)}
                                >
                                    Active (visible on home page)
                                </Switch>
                            </div>
                        </div>

                        <Textarea
                            label="Body (HTML allowed)"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            errorMessage={errors.body}
                            isInvalid={!!errors.body}
                            minRows={8}
                            isRequired
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="datetime-local"
                                label="Publish At (optional)"
                                value={toInputValue(data.published_at)}
                                onChange={(e) => setData('published_at', e.target.value)}
                                errorMessage={errors.published_at}
                                isInvalid={!!errors.published_at}
                            />
                            <Input
                                type="datetime-local"
                                label="Expires At (optional)"
                                value={toInputValue(data.expires_at)}
                                onChange={(e) => setData('expires_at', e.target.value)}
                                errorMessage={errors.expires_at}
                                isInvalid={!!errors.expires_at}
                                isDisabled={!data.published_at}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4">
                            <Button as={Link} href={route('admin.site-announcements.index')} color="danger" variant="light">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" isLoading={processing}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
