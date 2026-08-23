<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use App\Services\Notifications\InAppNotifier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = Task::with('user')->latest()->get();
        $users = User::all(['id', 'name']);

        return Inertia::render('Admin/Tasks/Index', [
            'tasks' => $tasks,
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|in:Ops,Finance,Coaching',
            'priority' => 'required|string|in:High,Medium,Low',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|in:Pending,In Progress,Completed',
        ]);

        $task = Task::create($validated);

        $this->notifyTaskAssigned($task);

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'department' => 'sometimes|string|in:Ops,Finance,Coaching',
            'priority' => 'sometimes|string|in:High,Medium,Low',
            'user_id' => 'sometimes|exists:users,id',
            'status' => 'sometimes|string|in:Pending,In Progress,Completed',
        ]);

        $newAssignee = isset($validated['user_id']) ? (int) $validated['user_id'] : null;
        $oldAssignee = (int) $task->getOriginal('user_id');

        $task->update($validated);

        if ($newAssignee && $newAssignee !== $oldAssignee && $newAssignee !== auth()->id()) {
            app(InAppNotifier::class)->notify(
                User::find($newAssignee),
                'task_assigned',
                "Task reassigned: {$task->title}",
                'A task has been reassigned to you.',
                route('admin.tasks.index'),
                ['task_id' => $task->id],
                "task_reassigned:{$task->id}:assignee:{$newAssignee}",
                auth()->id(),
            );
        }

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    /**
     * Notify the assignee (personally) and the relevant department + admins
     * (excluding the assignee and the actor to avoid duplicates).
     */
    protected function notifyTaskAssigned(Task $task): void
    {
        $notifier = app(InAppNotifier::class);
        $url = route('admin.tasks.index');
        $title = "New task: {$task->title}";
        $body = "{$task->department} department · {$task->priority} priority";
        $actorId = auth()->id();

        $role = match ($task->department) {
            'Ops' => UserRole::Ops,
            'Finance' => UserRole::Finance,
            'Coaching' => UserRole::Coach,
            default => null,
        };

        $exclude = collect([$task->user_id, $actorId])->filter()->values()->all();

        $recipients = User::query()
            ->where(function ($q) use ($role) {
                if ($role) {
                    $q->where('role', $role->value);
                }
                $q->orWhere('role', UserRole::Admin->value);
            })
            ->when($exclude, fn ($q) => $q->whereNotIn('id', $exclude))
            ->get();

        $notifier->notifyMany(
            $recipients,
            'task_assigned',
            $title,
            $body,
            $url,
            ['task_id' => $task->id],
            "task_assigned_dept:{$task->id}",
            $actorId,
        );

        if ($task->user_id && $task->user_id !== $actorId) {
            $notifier->notify(
                User::find($task->user_id),
                'task_assigned',
                $title,
                "Assigned to you · {$body}",
                $url,
                ['task_id' => $task->id],
                "task_assigned:{$task->id}:assignee:{$task->user_id}",
                $actorId,
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully.');
    }
}
