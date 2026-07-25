import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    ScrollShadow,
    Accordion,
    AccordionItem,
    Chip
} from "@heroui/react";
import mermaid from 'mermaid';

const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export default function Index({ docs, selected }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');
    const contentRef = useRef(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'neutral',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });
    }, []);

    useEffect(() => {
        if (selected?.html && contentRef.current) {
            const blocks = contentRef.current.querySelectorAll('pre code.language-mermaid, pre.language-mermaid code, code.language-mermaid');
            if (blocks.length > 0) {
                blocks.forEach((block, idx) => {
                    const pre = block.closest('pre') || block;
                    const codeText = block.textContent;

                    const wrapper = document.createElement('div');
                    wrapper.className = 'mermaid-chart-wrapper my-6 p-6 bg-default-100/50 dark:bg-default-50/20 rounded-xl border border-divider flex justify-center overflow-x-auto shadow-sm';

                    const mermaidDiv = document.createElement('div');
                    mermaidDiv.className = 'mermaid';
                    mermaidDiv.id = `mermaid-chart-${Date.now()}-${idx}`;
                    mermaidDiv.textContent = codeText;

                    wrapper.appendChild(mermaidDiv);
                    pre.parentNode.replaceChild(wrapper, pre);
                });

                try {
                    mermaid.run({
                        querySelector: '.mermaid'
                    });
                } catch (e) {
                    console.error('Mermaid render error:', e);
                }
            }
        }
    }, [selected?.html]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return docs ?? [];

        return (docs ?? []).filter((d) => {
            const path = (d.path ?? '').toLowerCase();
            const title = (d.title ?? '').toLowerCase();
            return path.includes(q) || title.includes(q);
        });
    }, [docs, search]);

    const { workflowDocs, techDocs } = useMemo(() => {
        const wDocs = [];
        const tDocs = [];

        (filtered ?? []).forEach((d) => {
            if (d.path.startsWith('workflows/')) {
                wDocs.push(d);
            } else {
                tDocs.push(d);
            }
        });

        return { workflowDocs: wDocs, techDocs: tDocs };
    }, [filtered]);

    const activePath = selected?.path ?? null;

    const renderDocLink = (d) => {
        const isActive = activePath === d.path;
        return (
            <Link
                key={d.path}
                href={route('admin.docs.show', d.path)}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                        ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                        : 'text-default-600 hover:bg-default-100'
                }`}
            >
                <div className="font-medium truncate">{d.title}</div>
                <div className="text-xs opacity-60 truncate">{d.path}</div>
            </Link>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-gray-800">System Documentation & User Guides</h2>
                        <p className="text-sm text-gray-500">Browse step-by-step how-to workflow guides and technical specifications</p>
                    </div>
                </div>
            }
        >
            <Head title="System Documentation" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="shadow-sm border border-gray-100 lg:col-span-4 xl:col-span-3">
                    <CardHeader className="flex flex-col gap-3 p-4">
                        <Input
                            placeholder="Search guides or specs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            startContent={<SearchIcon className="text-default-400" />}
                            isClearable
                            onClear={() => setSearch('')}
                            size="sm"
                        />
                        <div className="flex items-center justify-between text-xs text-default-500 w-full px-1">
                            <span>{filtered.length} total file(s)</span>
                            <span className="text-primary font-medium">{workflowDocs.length} Guides · {techDocs.length} Specs</span>
                        </div>
                    </CardHeader>
                    <CardBody className="p-0 border-t border-divider">
                        <ScrollShadow className="max-h-[75vh]">
                            <div className="p-2">
                                {filtered.length === 0 ? (
                                    <div className="p-4 text-sm text-default-500">No matching docs found.</div>
                                ) : (
                                    <Accordion
                                        defaultExpandedKeys={["workflows", "technical"]}
                                        selectionMode="multiple"
                                        variant="light"
                                        className="px-0"
                                    >
                                        <AccordionItem
                                            key="workflows"
                                            aria-label="User Workflows & How-To Guides"
                                            title={
                                                <div className="flex items-center justify-between w-full pr-2">
                                                    <span className="font-bold text-sm text-foreground">📘 User Workflows & Guides</span>
                                                    <Chip size="sm" color="primary" variant="flat">{workflowDocs.length}</Chip>
                                                </div>
                                            }
                                        >
                                            <div className="space-y-1 pl-1 pt-1 pb-2">
                                                {workflowDocs.length === 0 ? (
                                                    <div className="text-xs text-default-400 px-3 py-1">No matching guides.</div>
                                                ) : (
                                                    workflowDocs.map(renderDocLink)
                                                )}
                                            </div>
                                        </AccordionItem>

                                        <AccordionItem
                                            key="technical"
                                            aria-label="Technical Specifications & Admin Modules"
                                            title={
                                                <div className="flex items-center justify-between w-full pr-2">
                                                    <span className="font-bold text-sm text-foreground">🛠 Technical Specs & Modules</span>
                                                    <Chip size="sm" color="default" variant="flat">{techDocs.length}</Chip>
                                                </div>
                                            }
                                        >
                                            <div className="space-y-1 pl-1 pt-1 pb-2">
                                                {techDocs.length === 0 ? (
                                                    <div className="text-xs text-default-400 px-3 py-1">No matching technical specs.</div>
                                                ) : (
                                                    techDocs.map(renderDocLink)
                                                )}
                                            </div>
                                        </AccordionItem>
                                    </Accordion>
                                )}
                            </div>
                        </ScrollShadow>
                    </CardBody>
                </Card>

                <Card className="shadow-sm border border-gray-100 lg:col-span-8 xl:col-span-9">
                    <CardHeader className="flex flex-col gap-1 border-b border-divider p-6">
                        <div className="flex items-center gap-2">
                            {selected?.path?.startsWith('workflows/') ? (
                                <Chip color="primary" variant="flat" size="sm">📘 User Workflow How-To Guide</Chip>
                            ) : (
                                <Chip color="default" variant="flat" size="sm">🛠 Technical Specification</Chip>
                            )}
                            <h3 className="text-xl font-bold text-foreground">
                                {selected?.title ?? 'Select a Document'}
                            </h3>
                        </div>
                        {selected?.path ? (
                            <div className="text-xs text-default-400 font-mono mt-1">{selected.path}</div>
                        ) : null}
                    </CardHeader>
                    <CardBody className="p-6">
                        {selected?.html ? (
                            <div
                                ref={contentRef}
                                className="md-content prose dark:prose-invert max-w-none space-y-4 text-foreground"
                                dangerouslySetInnerHTML={{ __html: selected.html }}
                            />
                        ) : (
                            <div className="text-sm text-default-500 py-12 text-center">
                                Select a workflow guide or technical specification from the left menu to view.
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
