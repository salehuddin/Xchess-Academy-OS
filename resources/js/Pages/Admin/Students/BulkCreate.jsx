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
    Textarea,
    Tooltip
} from "@heroui/react";

const Plus = ({ size = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const Trash2 = ({ size = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const Copy = ({ size = 24, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

export default function BulkCreate({ parents }) {
    const { auth } = usePage().props;
    const [parentList, setParentList] = useState(parents);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        students: [
            {
                name: '',
                nric_passport: '',
                preferred_language: 'Bahasa Melayu',
                date_of_registration: new Date().toISOString().split('T')[0],
                current_level: '',
                recurring_discount: 0,
                admin_notes: '',
                parent_mode: 'existing',
                parent_id: '',
                parent_name: '',
                parent_email: '',
                parent_phone: '',
            }
        ]
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

    const addRow = () => {
        setData('students', [
            ...data.students,
            {
                name: '',
                nric_passport: '',
                preferred_language: 'Bahasa Melayu',
                date_of_registration: new Date().toISOString().split('T')[0],
                current_level: '',
                recurring_discount: 0,
                admin_notes: '',
                parent_mode: 'existing',
                parent_id: '',
                parent_name: '',
                parent_email: '',
                parent_phone: '',
            }
        ]);
    };

    const removeRow = (index) => {
        if (data.students.length > 1) {
            const newStudents = [...data.students];
            newStudents.splice(index, 1);
            setData('students', newStudents);
        }
    };

    const updateRow = (index, field, value) => {
        const newStudents = [...data.students];
        newStudents[index][field] = value;
        setData('students', newStudents);
    };

    const copyParentFromAbove = (index) => {
        if (index > 0) {
            const prevRow = data.students[index - 1];
            const newStudents = [...data.students];
            newStudents[index].parent_mode = prevRow.parent_mode;
            newStudents[index].parent_id = prevRow.parent_id;
            newStudents[index].parent_name = prevRow.parent_name;
            newStudents[index].parent_email = prevRow.parent_email;
            newStudents[index].parent_phone = prevRow.parent_phone;
            setData('students', newStudents);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.students.bulk-store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground">Bulk Register Students</h2>
                        <p className="text-sm text-default-500">Register multiple students at once</p>
                    </div>
                </div>
            }
        >
            <Head title="Bulk Register Students" />

            <div className="w-full mx-auto">
                <form onSubmit={submit} className="space-y-6">
                    <Card className="w-full shadow-sm border border-divider overflow-visible">
                        <CardBody className="p-4 overflow-visible">
                            <div className="overflow-x-auto pb-32 md:pb-0">
                                <table className="w-full min-w-[1200px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-divider text-left">
                                            <th className="p-2 w-10">#</th>
                                            <th className="p-2 w-48">Student Name</th>
                                            <th className="p-2 w-32">MyKid/Passport</th>
                                            <th className="p-2 w-32">Level</th>
                                            <th className="p-2 w-64">Parent / Guardian</th>
                                            <th className="p-2 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-4">
                                        {data.students.map((student, index) => (
                                            <tr key={index} className="group hover:bg-content2/50 transition-colors align-top border-b border-divider/50 last:border-0">
                                                <td className="p-2 pt-4 text-center text-default-500 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="p-2 pt-4">
                                                    <Input
                                                        placeholder="Full Name"
                                                        value={student.name}
                                                        onValueChange={(val) => updateRow(index, 'name', val)}
                                                        errorMessage={errors[`students.${index}.name`]}
                                                        isInvalid={!!errors[`students.${index}.name`]}
                                                        isRequired
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className="p-2 pt-4">
                                                    <Input
                                                        placeholder="ID Number"
                                                        value={student.nric_passport}
                                                        onValueChange={(val) => updateRow(index, 'nric_passport', val)}
                                                        errorMessage={errors[`students.${index}.nric_passport`]}
                                                        isInvalid={!!errors[`students.${index}.nric_passport`]}
                                                        isRequired
                                                        maxLength={12}
                                                        size="sm"
                                                    />
                                                </td>
                                                <td className="p-2 pt-4">
                                                    <Select
                                                        placeholder="Level"
                                                        selectedKeys={student.current_level ? [student.current_level] : []}
                                                        onChange={(e) => updateRow(index, 'current_level', e.target.value)}
                                                        errorMessage={errors[`students.${index}.current_level`]}
                                                        isInvalid={!!errors[`students.${index}.current_level`]}
                                                        size="sm"
                                                    >
                                                        <SelectItem key="Beginner" value="Beginner">Beginner</SelectItem>
                                                        <SelectItem key="Intermediate" value="Intermediate">Intermediate</SelectItem>
                                                        <SelectItem key="Advanced" value="Advanced">Advanced</SelectItem>
                                                    </Select>
                                                </td>
                                                <td className="p-2 pt-4">
                                                    <div className="space-y-2 min-w-[250px]">
                                                        <div className="flex items-center justify-between">
                                                            <RadioGroup
                                                                orientation="horizontal"
                                                                value={student.parent_mode}
                                                                onValueChange={(val) => updateRow(index, 'parent_mode', val)}
                                                                size="sm"
                                                                className="scale-90 origin-left"
                                                            >
                                                                <Radio value="existing">Existing</Radio>
                                                                <Radio value="new">New</Radio>
                                                            </RadioGroup>

                                                            {index > 0 && (
                                                                <Tooltip content="Copy parent from above row">
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="light"
                                                                        onClick={() => copyParentFromAbove(index)}
                                                                    >
                                                                        <Copy size={14} />
                                                                    </Button>
                                                                </Tooltip>
                                                            )}
                                                        </div>

                                                        {student.parent_mode === 'existing' ? (
                                                            <Autocomplete
                                                                placeholder="Search parent..."
                                                                items={parentList}
                                                                isLoading={isLoading}
                                                                onInputChange={onParentSearch}
                                                                onSelectionChange={(key) => updateRow(index, 'parent_id', key)}
                                                                selectedKey={String(student.parent_id)}
                                                                errorMessage={errors[`students.${index}.parent_id`]}
                                                                isInvalid={!!errors[`students.${index}.parent_id`]}
                                                                isRequired
                                                                size="sm"
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
                                                            <div className="space-y-2 p-2 bg-default-100 rounded-md">
                                                                <Input
                                                                    placeholder="Parent Name"
                                                                    value={student.parent_name}
                                                                    onValueChange={(val) => updateRow(index, 'parent_name', val)}
                                                                    errorMessage={errors[`students.${index}.parent_name`]}
                                                                    isInvalid={!!errors[`students.${index}.parent_name`]}
                                                                    isRequired
                                                                    size="sm"
                                                                />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Email Address"
                                                                    value={student.parent_email}
                                                                    onValueChange={(val) => updateRow(index, 'parent_email', val)}
                                                                    errorMessage={errors[`students.${index}.parent_email`]}
                                                                    isInvalid={!!errors[`students.${index}.parent_email`]}
                                                                    isRequired
                                                                    size="sm"
                                                                />
                                                                <Input
                                                                    type="tel"
                                                                    placeholder="Phone Number"
                                                                    value={student.parent_phone}
                                                                    onValueChange={(val) => updateRow(index, 'parent_phone', val)}
                                                                    errorMessage={errors[`students.${index}.parent_phone`]}
                                                                    isInvalid={!!errors[`students.${index}.parent_phone`]}
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2 pt-4 text-center">
                                                    <Button
                                                        isIconOnly
                                                        color="danger"
                                                        variant="light"
                                                        onPress={() => removeRow(index)}
                                                        isDisabled={data.students.length === 1}
                                                        size="sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-center mt-4">
                                <Button
                                    variant="dashed"
                                    color="primary"
                                    startContent={<Plus size={18} />}
                                    onPress={addRow}
                                    className="w-full max-w-md border-2"
                                >
                                    Add Another Student
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    <div className="flex items-center justify-end gap-4 mt-4 bg-content1 p-4 rounded-lg shadow-sm border border-divider sticky bottom-4 z-10">
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
                            className="font-semibold"
                        >
                            Register All {data.students.length} Students
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
