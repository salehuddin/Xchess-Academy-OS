import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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

export default function Create({ classes }) {
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        channel: 'whatsapp',
        subject: '',
        body: '',
        audience: 'all_parents',
        class_id: '',
        send_now: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.announcements.store'));
    };

    const filteredClasses = (classes ?? []).filter((c) => c?.id);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">New Announcement</h2>
                        <p className="text-sm text-gray-500">Broadcast to parents via email or WhatsApp</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Announcement" />

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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Channel"
                                selectedKeys={data.channel ? [data.channel] : []}
                                onChange={(e) => setData('channel', e.target.value)}
                                errorMessage={errors.channel}
                                isInvalid={!!errors.channel}
                                isRequired
                            >
                                <SelectItem key="email">Email</SelectItem>
                                <SelectItem key="whatsapp">WhatsApp</SelectItem>
                            </Select>

                            <Select
                                label="Audience"
                                selectedKeys={data.audience ? [data.audience] : []}
                                onChange={(e) => setData('audience', e.target.value)}
                                errorMessage={errors.audience}
                                isInvalid={!!errors.audience}
                                isRequired
                            >
                                <SelectItem key="all_parents">All Parents</SelectItem>
                                <SelectItem key="class">Specific Class</SelectItem>
                            </Select>

                            {data.audience === 'class' ? (
                                <Select
                                    label="Class"
                                    selectedKeys={data.class_id ? [String(data.class_id)] : []}
                                    onChange={(e) => setData('class_id', e.target.value)}
                                    errorMessage={errors.class_id}
                                    isInvalid={!!errors.class_id}
                                    isRequired
                                >
                                    {filteredClasses.map((c) => (
                                        <SelectItem key={String(c.id)} textValue={`${c.name || c.uid} (${c.mode})`}>
                                            {c.name || c.uid} ({c.mode})
                                        </SelectItem>
                                    ))}
                                </Select>
                            ) : (
                                <div />
                            )}
                        </div>

                        {data.channel === 'email' ? (
                            <Input
                                label="Email Subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                errorMessage={errors.subject}
                                isInvalid={!!errors.subject}
                            />
                        ) : null}

                        <Textarea
                            label={data.channel === 'email' ? 'Email Body (HTML allowed)' : 'Message Body'}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            errorMessage={errors.body}
                            isInvalid={!!errors.body}
                            minRows={10}
                            isRequired
                        />

                        <div className="flex items-center justify-between">
                            <Switch
                                isSelected={data.send_now}
                                onValueChange={(val) => setData('send_now', val)}
                            >
                                Send now
                            </Switch>

                            <div className="flex items-center gap-4">
                                <Button
                                    as={Link}
                                    href={route('admin.announcements.index')}
                                    color="danger"
                                    variant="light"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" isLoading={processing}>
                                    Create
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}

