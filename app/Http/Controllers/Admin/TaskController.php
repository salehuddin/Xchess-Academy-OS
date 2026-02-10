<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
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

        Task::create($validated);

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

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully.');
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
