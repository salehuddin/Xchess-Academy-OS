<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

class DocsController extends Controller
{
    public function index(): Response
    {
        $docs = $this->getDocsIndex();
        $selected = $docs[0]['path'] ?? null;

        return $this->render($docs, $selected);
    }

    public function show(string $path): Response
    {
        $docs = $this->getDocsIndex();

        return $this->render($docs, $path);
    }

    private function render(array $docs, ?string $selectedPath): Response
    {
        $selectedPath = $this->normalizePath($selectedPath);

        $selected = null;
        if ($selectedPath) {
            $exists = collect($docs)->firstWhere('path', $selectedPath);
            if (! $exists) {
                abort(404);
            }

            $fullPath = $this->docsBasePath().DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $selectedPath);
            $markdown = @file_get_contents($fullPath);
            if ($markdown === false) {
                abort(404);
            }

            $html = Str::markdown($markdown, [
                'html_input' => 'strip',
                'allow_unsafe_links' => false,
            ]);

            $selected = [
                'path' => $selectedPath,
                'title' => $exists['title'],
                'html' => $html,
                'markdown' => $markdown,
            ];
        }

        return Inertia::render('Admin/Docs/Index', [
            'docs' => $docs,
            'selected' => $selected,
        ]);
    }

    private function getDocsIndex(): array
    {
        $base = $this->docsBasePath();

        if (! is_dir($base)) {
            return [];
        }

        $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base));
        $items = [];

        foreach ($rii as $file) {
            if (! ($file instanceof SplFileInfo)) {
                continue;
            }

            if (! $file->isFile()) {
                continue;
            }

            if (strtolower($file->getExtension()) !== 'md') {
                continue;
            }

            $absolute = $file->getPathname();
            $relative = str_replace($base.DIRECTORY_SEPARATOR, '', $absolute);
            $relative = str_replace(DIRECTORY_SEPARATOR, '/', $relative);
            $relative = $this->normalizePath($relative);

            if (! $relative) {
                continue;
            }

            $items[] = [
                'path' => $relative,
                'title' => $this->titleFromPath($relative),
            ];
        }

        usort($items, fn ($a, $b) => strcmp($a['path'], $b['path']));

        return $items;
    }

    private function docsBasePath(): string
    {
        return base_path('docs');
    }

    private function normalizePath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $path = str_replace('\\', '/', $path);
        $path = preg_replace('#/+#', '/', $path) ?: $path;
        $path = ltrim($path, '/');

        if ($path === '' || str_contains($path, '..')) {
            return null;
        }

        if (! str_ends_with(strtolower($path), '.md')) {
            return null;
        }

        return $path;
    }

    private function titleFromPath(string $path): string
    {
        $base = basename($path, '.md');
        $base = str_replace(['-', '_'], ' ', $base);
        $base = preg_replace('/\s+/', ' ', $base) ?: $base;

        return Str::title($base);
    }
}
