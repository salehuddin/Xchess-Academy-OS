import { usePage } from '@inertiajs/react';

const sizeMap = {
    sm: { box: 'w-8 h-8 min-w-[2rem]', text: 'text-base', glyph: 'text-sm' },
    md: { box: 'w-10 h-10 min-w-[2.5rem]', text: 'text-lg', glyph: 'text-base' },
    lg: { box: 'w-16 h-16 min-w-[4rem]', text: 'text-2xl', glyph: 'text-2xl' },
};

export default function Logo({ size = 'md', withText = false, className = '' }) {
    const { academy } = usePage().props;
    const s = sizeMap[size] ?? sizeMap.md;
    const logoUrl = academy?.logo_url;
    const name = academy?.name || 'XChess Academy';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={`${name} logo`}
                    className={`${s.box} object-contain rounded-lg`}
                />
            ) : (
                <div className={`${s.box} rounded-lg bg-primary text-white flex items-center justify-center font-bold ${s.glyph}`}>
                    X
                </div>
            )}
            {withText && (
                <span className={`font-bold text-foreground whitespace-nowrap ${s.text}`}>
                    {name}
                </span>
            )}
        </div>
    );
}
