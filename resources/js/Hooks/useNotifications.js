import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Polls `/me/notifications/unread` for the current user's notification badge
 * and recent items. Re-fetches after every Inertia navigation (via the page
 * URL changing) and every `intervalMs` while the tab is visible.
 */
export default function useNotifications(intervalMs = 45000) {
    const [count, setCount] = useState(0);
    const [latest, setLatest] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async (opts = {}) => {
        if (opts.silent !== true) {
            setLoading(true);
        }
        try {
            const res = await axios.get(route('me.notifications.unread'), { validateStatus: () => true });
            if (res.status === 200) {
                setCount(res.data?.count ?? 0);
                setLatest(res.data?.latest ?? []);
            }
        } catch {
            // Network or auth errors are non-fatal for the bell.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh({ silent: true });
        const id = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                refresh({ silent: true });
            }
        }, intervalMs);

        return () => clearInterval(id);
    }, [refresh, intervalMs]);

    return { count, latest, loading, setCount, setLatest, refresh };
}
