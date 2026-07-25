import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Pagination,
} from "@heroui/react";

// Icons
const TrendingUpIcon = (props) => (
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
            d="M23 6L13.5 15.5L8.5 10.5L1 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <path
            d="M17 6H23V12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const TrendingDownIcon = (props) => (
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
            d="M23 18L13.5 8.5L8.5 13.5L1 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <path
            d="M17 18H23V12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const WalletIcon = (props) => (
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
            d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
        <path
            d="M16 3H8C6.89543 3 6 3.89543 6 5V7H18V5C18 3.89543 17.1046 3 16 3Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
        />
    </svg>
);

const columns = [
    { name: "MONTH", uid: "month" },
    { name: "REVENUE", uid: "revenue" },
    { name: "EXPENSES", uid: "expenses" },
    { name: "NET", uid: "net" },
];

export default function Index({ auth, totalRevenue, totalExpenses, netIncome, monthlyStats = [] }) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const pages = Math.ceil(monthlyStats.length / rowsPerPage) || 1;

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return monthlyStats.slice(start, end);
    }, [page, monthlyStats, rowsPerPage]);

    const topContent = (
        <div className="flex justify-between items-center px-1 py-2">
            <h3 className="text-lg font-bold text-gray-900">Monthly Breakdown</h3>
            <label className="flex items-center text-default-400 text-small">
                Rows per page:
                <select
                    className="bg-transparent outline-none text-default-400 text-small ml-1"
                    onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setPage(1);
                    }}
                    value={rowsPerPage}
                >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </label>
        </div>
    );

    const bottomContent = pages > 1 ? (
        <div className="flex w-full justify-center px-4 py-4 border-t border-gray-100">
            <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(p) => setPage(p)}
            />
        </div>
    ) : null;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">Financial Reports</h2>
                        <p className="text-sm text-gray-500">Track revenue, expenses, and net income</p>
                    </div>
                </div>
            }
        >
            <Head title="Financial Reports" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardBody className="p-6">
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-semibold">Total Revenue</div>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-success">${totalRevenue}</div>
                            <div className="p-3 bg-success-50 rounded-full">
                                <TrendingUpIcon className="text-success text-xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardBody className="p-6">
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-semibold">Total Expenses</div>
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-danger">${totalExpenses}</div>
                            <div className="p-3 bg-danger-50 rounded-full">
                                <TrendingDownIcon className="text-danger text-xl" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card className="bg-white shadow-sm border border-gray-100">
                    <CardBody className="p-6">
                        <div className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-semibold">Net Income</div>
                        <div className="flex items-center justify-between">
                            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-primary' : 'text-danger'}`}>
                                ${netIncome}
                            </div>
                            <div className={`p-3 rounded-full ${netIncome >= 0 ? 'bg-primary-50' : 'bg-danger-50'}`}>
                                <WalletIcon className={`${netIncome >= 0 ? 'text-primary' : 'text-danger'} text-xl`} />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div>
                <Table
                    aria-label="Monthly breakdown table"
                    isHeaderSticky
                    topContent={topContent}
                    topContentPlacement="outside"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "bg-transparent shadow-none",
                    }}
                    selectionMode="none"
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn key={column.uid}>
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody items={items} emptyContent={"No financial data available."}>
                        {(item) => (
                            <TableRow key={item.month}>
                                <TableCell className="font-bold">{item.month}</TableCell>
                                <TableCell className="text-success font-semibold">${item.revenue}</TableCell>
                                <TableCell className="text-danger font-semibold">${item.expenses}</TableCell>
                                <TableCell className={`font-bold ${item.net >= 0 ? 'text-primary' : 'text-danger'}`}>
                                    ${item.net}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AuthenticatedLayout>
    );
}
