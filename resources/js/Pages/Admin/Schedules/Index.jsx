import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Pagination
} from "@heroui/react";

const columns = [
  {name: "CLASS", uid: "class_name"},
  {name: "ROOM", uid: "room_name"},
  {name: "START TIME", uid: "start_time"},
  {name: "END TIME", uid: "end_time"},
  {name: "STATUS", uid: "status"},
];

export default function Index({ auth, schedules }) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Schedules</h2>}
    >
      <Head title="Schedules" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="flex justify-end gap-3 mb-6">
                <Button as={Link} href={route('admin.schedules.create')} color="primary">
                    Create Schedule
                </Button>
                <Button as={Link} href={route('admin.schedules.bulk-create')} color="secondary">
                    Bulk Create
                </Button>
            </div>

            <Table 
                aria-label="Schedules Table"
                bottomContent={
                    schedules.last_page > 1 && (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={schedules.current_page}
                                total={schedules.last_page}
                                onChange={(page) => {
                                    router.visit(`${schedules.path}?page=${page}`);
                                }}
                            />
                        </div>
                    )
                }
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={schedules.data} emptyContent={"No schedules found."}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {columnKey === "status" ? (
                                        <Chip color={item.status === 'Delivered' ? "success" : "warning"} size="sm" variant="flat">
                                            {item.status}
                                        </Chip>
                                    ) : (
                                        item[columnKey]
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
