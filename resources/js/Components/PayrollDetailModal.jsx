import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Chip,
    Spinner,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@heroui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";

const statusColorMap = {
    Paid: "success",
    Processed: "primary",
    Draft: "warning",
};

const formatRM = (amount) => `RM ${Number(amount ?? 0).toFixed(2)}`;

const formatMonth = (yearMonth) => {
    if (!yearMonth) return '—';
    const [year, month] = yearMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'long' });
};

const formatDate = (date) => {
    if (!date) return '—';
    const parsed = new Date(date.length > 10 ? date : `${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const formatDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-MY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function PayrollDetailModal({ isOpen, onClose, url, canEdit = false }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ total_sessions: '', base_rate: '', total_amount: '' });
    const [saving, setSaving] = useState(false);
    const [editError, setEditError] = useState(null);

    useEffect(() => {
        if (isOpen && url) {
            fetchDetail();
            setIsEditing(false);
            setEditError(null);
        } else {
            setData(null);
            setIsEditing(false);
        }
    }, [isOpen, url]);

    const fetchDetail = async (silent = false) => {
        if (!silent) setLoading(true);
        setLoadError(null);
        try {
            const response = await axios.get(url);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch payroll details:', error);
            if (!silent) setLoadError('Failed to load payroll details.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const startEdit = () => {
        const payroll = data?.payroll;
        if (!payroll) return;
        setEditForm({
            total_sessions: payroll.total_sessions,
            base_rate: payroll.base_rate,
            total_amount: payroll.total_amount,
        });
        setEditError(null);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setEditError(null);
        try {
            await axios.put(route('admin.payrolls.update', data.payroll.id), editForm);
            setIsEditing(false);
            // Refresh the detail (keeps coach relation + picks up the new
            // "Payroll updated" trail entry) and the underlying page props
            // (list rows + summary) without closing the modal.
            fetchDetail(true);
            router.reload();
        } catch (error) {
            const responseData = error?.response?.data;
            if (responseData?.errors) {
                const messages = Object.values(responseData.errors).flat().join(' ');
                setEditError(messages || 'Please fix the highlighted fields.');
            } else {
                setEditError(responseData?.message || 'Failed to update payroll.');
            }
        } finally {
            setSaving(false);
        }
    };

    const payroll = data?.payroll;
    const lineItems = data?.line_items ?? [];
    const activities = data?.activities ?? [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">Payroll Details</h2>
                            {payroll && (
                                <p className="text-sm text-default-500">
                                    {payroll.coach?.name} · {formatMonth(payroll.month_year)}
                                </p>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Spinner label="Loading payroll details..." />
                                </div>
                            ) : loadError ? (
                                <div className="text-center py-10 text-default-500">{loadError}</div>
                            ) : payroll ? (
                                <div className="space-y-6">
                                    {/* Summary / Edit form */}
                                    {isEditing ? (
                                        <div className="bg-content2 p-4 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Input
                                                    type="number"
                                                    label="Total Sessions"
                                                    size="sm"
                                                    value={editForm.total_sessions}
                                                    onChange={(e) => setEditForm({ ...editForm, total_sessions: e.target.value })}
                                                />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    label="Base Rate (RM)"
                                                    size="sm"
                                                    value={editForm.base_rate}
                                                    onChange={(e) => setEditForm({ ...editForm, base_rate: e.target.value })}
                                                />
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    label="Total Amount (RM)"
                                                    size="sm"
                                                    value={editForm.total_amount}
                                                    onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })}
                                                />
                                            </div>
                                            {editError && (
                                                <p className="text-danger-500 text-sm mt-2">{editError}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-content2 p-4 rounded-lg">
                                            <div>
                                                <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Sessions</span>
                                                <span className="text-medium font-semibold">{payroll.total_sessions}</span>
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Avg Rate</span>
                                                <span className="text-medium font-semibold">{formatRM(payroll.base_rate)}</span>
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Total Pay</span>
                                                <span className="text-medium font-semibold text-success-600">{formatRM(payroll.total_amount)}</span>
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-500 uppercase font-bold block mb-1">Status</span>
                                                <Chip className="capitalize" color={statusColorMap[payroll.status] || "default"} size="sm" variant="flat">
                                                    {payroll.status}
                                                </Chip>
                                            </div>
                                        </div>
                                    )}

                                    {/* Breakdown */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-2">Session Breakdown</h3>
                                        <Table aria-label="Payroll session breakdown" removeWrapper classNames={{ wrapper: "bg-transparent shadow-none" }}>
                                            <TableHeader>
                                                <TableColumn>DATE</TableColumn>
                                                <TableColumn>CLASS</TableColumn>
                                                <TableColumn>PACKAGE</TableColumn>
                                                <TableColumn>RATE</TableColumn>
                                            </TableHeader>
                                            <TableBody emptyContent="No session line items recorded.">
                                                {lineItems.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{formatDate(item.attendance_date)}</TableCell>
                                                        <TableCell>{item.class_name || '—'}</TableCell>
                                                        <TableCell>{item.package_title || '—'}</TableCell>
                                                        <TableCell>{formatRM(item.rate)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="flex justify-end gap-6 text-sm pt-2 pr-2">
                                            <span className="text-default-500">Sessions: <span className="font-semibold text-default-700">{payroll.total_sessions}</span></span>
                                            <span className="text-default-500">Total: <span className="font-semibold text-success-600">{formatRM(payroll.total_amount)}</span></span>
                                        </div>
                                    </div>

                                    {/* Activity trail */}
                                    <div>
                                        <h3 className="text-lg font-bold mb-2">Activity Trail</h3>
                                        {activities.length === 0 ? (
                                            <p className="text-sm text-default-400 italic">No activity recorded.</p>
                                        ) : (
                                            <ol className="relative border-l border-default-200 ml-3">
                                                {activities.map((activity) => (
                                                    <li key={activity.id} className="mb-4 ml-6">
                                                        <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-primary-400 ring-4 ring-default-100" />
                                                        <p className="text-sm font-medium">{activity.description}</p>
                                                        <p className="text-xs text-default-500">
                                                            {activity.causer_name || 'System'} · {formatDateTime(activity.created_at)}
                                                        </p>
                                                        {activity.properties?.from && activity.properties?.to && (
                                                            <p className="text-xs text-default-400 capitalize">
                                                                {activity.properties.from} → {activity.properties.to}
                                                            </p>
                                                        )}
                                                        {activity.properties?.before && activity.properties?.after && (
                                                            <p className="text-xs text-default-400">
                                                                Sessions: {activity.properties.before.total_sessions} → {activity.properties.after.total_sessions}
                                                                {' · '}Rate: {formatRM(activity.properties.before.base_rate)} → {formatRM(activity.properties.after.base_rate)}
                                                                {' · '}Total: {formatRM(activity.properties.before.total_amount)} → {formatRM(activity.properties.after.total_amount)}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-default-500">Payroll details not found.</div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            {isEditing ? (
                                <>
                                    <Button
                                        color="danger"
                                        variant="light"
                                        onPress={() => setIsEditing(false)}
                                        isDisabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={handleSave} isLoading={saving}>
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button color="default" variant="light" onPress={onClose}>
                                        Close
                                    </Button>
                                    {canEdit && payroll?.status === 'Draft' && (
                                        <Button color="primary" onPress={startEdit}>
                                            Edit
                                        </Button>
                                    )}
                                </>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
