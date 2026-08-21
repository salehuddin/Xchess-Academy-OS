import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Select,
    SelectItem,
    Autocomplete,
    AutocompleteItem,
    RadioGroup,
    Radio,
    Textarea
} from "@heroui/react";

export default function Create({ parents, preselectedParentId }) {
    const { auth } = usePage().props;
    const [parentList, setParentList] = useState(parents);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nric_passport: '',
        preferred_language: 'Bahasa Melayu',
        date_of_registration: new Date().toISOString().split('T')[0],
        current_level: '',
        recurring_discount: 0,
        admin_notes: '',
        parent_mode: preselectedParentId ? 'existing' : 'existing', // Default to existing if preselected
        parent_id: preselectedParentId || '',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
    });

    const onParentSearch = (value) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!value) {
            setParentList(parents);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const response = await axios.get(route('admin.parents.search', { query: value }));
                setParentList(response.data);
            } catch (error) {
                console.error("Failed to search parents:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.students.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Register New Student</h2>
                        <p className="text-sm text-default-500">Create a new student profile and assign a parent</p>
                    </div>
                </div>
            }
        >
            <Head title="New Student" />

            <Card className="w-full max-w-2xl mx-auto shadow-sm border border-divider">
                <CardBody className="p-6">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Student Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground border-b border-divider pb-2 mb-4">Student Details</h3>
                            <div className="space-y-6">
                                <Input
                                    label="Full Name"
                                    value={data.name}
                                    onValueChange={(val) => setData('name', val)}
                                    errorMessage={errors.name}
                                    isInvalid={!!errors.name}
                                    isRequired
                                />

                                <Input
                                    label="MyKid / MyKad / Passport"
                                    value={data.nric_passport}
                                    onValueChange={(val) => setData('nric_passport', val)}
                                    errorMessage={errors.nric_passport}
                                    isInvalid={!!errors.nric_passport}
                                    isRequired
                                    maxLength={12}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Preferred Language"
                                        selectedKeys={data.preferred_language ? [data.preferred_language] : []}
                                        onChange={(e) => setData('preferred_language', e.target.value)}
                                        errorMessage={errors.preferred_language}
                                        isInvalid={!!errors.preferred_language}
                                        isRequired
                                    >
                                        <SelectItem key="Bahasa Melayu" value="Bahasa Melayu">Bahasa Melayu</SelectItem>
                                        <SelectItem key="English" value="English">English</SelectItem>
                                        <SelectItem key="Mandarin" value="Mandarin">Mandarin</SelectItem>
                                        <SelectItem key="Tamil" value="Tamil">Tamil</SelectItem>
                                    </Select>

                                    <Input
                                        type="date"
                                        label="Date Registered"
                                        value={data.date_of_registration}
                                        onValueChange={(val) => setData('date_of_registration', val)}
                                        errorMessage={errors.date_of_registration}
                                        isInvalid={!!errors.date_of_registration}
                                        isRequired
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Current Level"
                                        selectedKeys={data.current_level ? [data.current_level] : []}
                                        onChange={(e) => setData('current_level', e.target.value)}
                                        errorMessage={errors.current_level}
                                        isInvalid={!!errors.current_level}
                                    >
                                        <SelectItem key="Beginner" value="Beginner">Beginner</SelectItem>
                                        <SelectItem key="Intermediate" value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem key="Advanced" value="Advanced">Advanced</SelectItem>
                                    </Select>

                                    <Input
                                        type="number"
                                        label="Recurring Discount (Amount)"
                                        value={String(data.recurring_discount)}
                                        onValueChange={(val) => setData('recurring_discount', val)}
                                        errorMessage={errors.recurring_discount}
                                        isInvalid={!!errors.recurring_discount}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <Textarea
                                    label="Admin Notes"
                                    value={data.admin_notes}
                                    onValueChange={(val) => setData('admin_notes', val)}
                                    errorMessage={errors.admin_notes}
                                    isInvalid={!!errors.admin_notes}
                                />
                            </div>
                        </div>

                        {/* Parent / Guardian */}
                        <div>
                            <h3 className="text-lg font-semibold text-foreground border-b border-divider pb-2 mb-4">Parent / Guardian</h3>

                            <RadioGroup
                                orientation="horizontal"
                                value={data.parent_mode}
                                onValueChange={(val) => setData('parent_mode', val)}
                                className="mb-4"
                            >
                                <Radio value="existing">Existing Parent</Radio>
                                <Radio value="new">New Parent</Radio>
                            </RadioGroup>

                            {data.parent_mode === 'existing' ? (
                                <Autocomplete
                                    label="Select Parent"
                                    placeholder="Search by name, email or phone"
                                    items={parentList}
                                    isLoading={isLoading}
                                    onInputChange={onParentSearch}
                                    onSelectionChange={(key) => setData('parent_id', key)}
                                    selectedKey={String(data.parent_id)}
                                    errorMessage={errors.parent_id}
                                    isInvalid={!!errors.parent_id}
                                    isRequired
                                >
                                    {(item) => (
                                        <AutocompleteItem key={String(item.id)} textValue={item.name}>
                                            <div className="flex flex-col">
                                                <span className="text-small">{item.name}</span>
                                                <span className="text-tiny text-default-400">
                                                    {item.email}{item.phone ? ` · ${item.phone}` : ''}
                                                </span>
                                            </div>
                                        </AutocompleteItem>
                                    )}
                                </Autocomplete>
                            ) : (
                                <div className="space-y-6">
                                    <Input
                                        label="Parent Name"
                                        value={data.parent_name}
                                        onValueChange={(val) => setData('parent_name', val)}
                                        errorMessage={errors.parent_name}
                                        isInvalid={!!errors.parent_name}
                                        isRequired
                                    />
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        value={data.parent_email}
                                        onValueChange={(val) => setData('parent_email', val)}
                                        errorMessage={errors.parent_email}
                                        isInvalid={!!errors.parent_email}
                                        isRequired
                                    />
                                    <Input
                                        type="tel"
                                        label="Phone Number"
                                        value={data.parent_phone}
                                        onValueChange={(val) => setData('parent_phone', val)}
                                        errorMessage={errors.parent_phone}
                                        isInvalid={!!errors.parent_phone}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-4 mt-4">
                            <Button
                                as={Link}
                                href={route('admin.students.index')}
                                color="danger"
                                variant="light"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={processing}
                            >
                                Register Student
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </AuthenticatedLayout>
    );
}
