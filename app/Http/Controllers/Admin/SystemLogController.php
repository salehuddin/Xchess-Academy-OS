<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class SystemLogController extends Controller
{
    /**
     * Display system log file contents with filtering.
     */
    public function index(Request $request): Response
    {
        $logPath = storage_path('logs/laravel.log');
        $logs = [];
        $fileSize = 0;

        if (File::exists($logPath)) {
            $fileSize = round(File::size($logPath) / 1024, 2); // KB
            $content = File::get($logPath);
            $logs = $this->parseLogContent($content);
        }

        $search = strtolower($request->input('search', ''));
        $levelFilter = strtolower($request->input('level', ''));

        if (! empty($search)) {
            $logs = array_filter($logs, function ($log) use ($search) {
                return str_contains(strtolower($log['message']), $search) ||
                    str_contains(strtolower($log['context']), $search);
            });
        }

        if (! empty($levelFilter)) {
            $logs = array_filter($logs, function ($log) use ($levelFilter) {
                return strtolower($log['level']) === $levelFilter;
            });
        }

        $logs = array_values($logs);
        $totalLogs = count($logs);

        // Paginate in memory
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }
        $slicedLogs = array_slice($logs, ($page - 1) * $perPage, $perPage);

        return Inertia::render('Admin/SystemLogs/Index', [
            'logs' => $slicedLogs,
            'pagination' => [
                'current_page' => $page,
                'last_page' => max(1, ceil($totalLogs / $perPage)),
                'total' => $totalLogs,
                'per_page' => $perPage,
            ],
            'fileSizeKb' => $fileSize,
            'filters' => [
                'search' => $request->input('search', ''),
                'level' => $request->input('level', ''),
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Clear system log file.
     */
    public function clear(): RedirectResponse
    {
        $logPath = storage_path('logs/laravel.log');

        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        return back()->with('success', 'System log file cleared successfully.');
    }

    /**
     * Parse log file into structured log entries.
     */
    private function parseLogContent(string $content): array
    {
        $pattern = '/\[(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[\+-]\d{2}:\d{2})?)\]\s+(\w+)\.(\w+):\s+(.*?)(?=\n\[\d{4}-\d{2}-\d{2}|$)/s';

        preg_match_all($pattern, $content, $matches, PREG_SET_ORDER);

        $parsed = [];

        foreach (array_reverse($matches) as $index => $match) {
            $timestamp = $match[1];
            $environment = $match[2];
            $level = strtoupper($match[3]);
            $rawText = trim($match[4]);

            $lines = explode("\n", $rawText);
            $message = array_shift($lines);
            $context = implode("\n", $lines);

            $parsed[] = [
                'id' => $index + 1,
                'timestamp' => $timestamp,
                'environment' => $environment,
                'level' => $level,
                'message' => $message,
                'context' => $context,
            ];
        }

        return $parsed;
    }
}
