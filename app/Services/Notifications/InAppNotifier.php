<?php

namespace App\Services\Notifications;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InAppNotifier
{
    /**
     * Persist a single in-app notification. When a dedup_key is supplied,
     * a prior notification for the same user + dedup_key short-circuits the call.
     */
    public function notify(
        User $user,
        string $type,
        string $title,
        ?string $body = null,
        ?string $url = null,
        ?array $data = null,
        ?string $dedupKey = null,
        ?int $actorId = null,
    ): ?UserNotification {
        return $this->createIfMissing([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'data' => $data,
            'dedup_key' => $dedupKey,
            'actor_id' => $actorId,
        ]);
    }

    /**
     * Notify each user in the collection. Missing/empty collection is a no-op.
     */
    public function notifyMany(
        Collection $users,
        string $type,
        string $title,
        ?string $body = null,
        ?string $url = null,
        ?array $data = null,
        ?string $dedupKey = null,
        ?int $actorId = null,
    ): int {
        if ($users->isEmpty()) {
            return 0;
        }

        $created = 0;
        foreach ($users->unique('id') as $user) {
            if (! $user instanceof User) {
                continue;
            }

            $key = $dedupKey
                ? $dedupKey.':user:'.$user->id
                : null;

            if ($this->notify($user, $type, $title, $body, $url, $data, $key, $actorId)) {
                $created++;
            }
        }

        return $created;
    }

    /**
     * Notify every user matching the given roles. Passing includeAdmin
     * (default true) guarantees admins receive an audit copy.
     */
    public function notifyRoles(
        array $roles,
        string $type,
        string $title,
        ?string $body = null,
        ?string $url = null,
        ?array $data = null,
        ?string $dedupKey = null,
        ?int $actorId = null,
        bool $includeAdmin = true,
    ): int {
        $roleValues = collect($roles)
            ->map(fn (UserRole $r) => $r->value)
            ->unique()
            ->values()
            ->all();

        if ($includeAdmin && ! in_array(UserRole::Admin->value, $roleValues, true)) {
            $roleValues[] = UserRole::Admin->value;
        }

        $users = User::query()->whereIn('role', $roleValues)->get();

        return $this->notifyMany($users, $type, $title, $body, $url, $data, $dedupKey, $actorId);
    }

    /**
     * Notify every member of a department. Department strings follow PRD §3,
     * mapping onto user roles: Ops, Finance, Coaching → Coach.
     */
    public function notifyDepartment(
        string $department,
        string $type,
        string $title,
        ?string $body = null,
        ?string $url = null,
        ?array $data = null,
        ?string $dedupKey = null,
        ?int $actorId = null,
        bool $includeAdmin = true,
    ): int {
        $role = match ($department) {
            'Ops' => UserRole::Ops,
            'Finance' => UserRole::Finance,
            'Coaching' => UserRole::Coach,
            default => null,
        };

        if (! $role) {
            return 0;
        }

        return $this->notifyRoles([$role], $type, $title, $body, $url, $data, $dedupKey, $actorId, $includeAdmin);
    }

    /**
     * Create a notification row only when no prior row exists for the same
     * user + dedup_key. Returns null on collision (idempotent re-trigger).
     */
    protected function createIfMissing(array $attributes): ?UserNotification
    {
        return DB::transaction(function () use ($attributes) {
            if (! empty($attributes['dedup_key'])) {
                $existing = UserNotification::query()
                    ->where('user_id', $attributes['user_id'])
                    ->where('dedup_key', $attributes['dedup_key'])
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    return null;
                }
            }

            try {
                return UserNotification::create($attributes);
            } catch (QueryException $e) {
                if ($this->isUniqueViolation($e)) {
                    return null;
                }

                throw $e;
            }
        });
    }

    protected function isUniqueViolation(QueryException $e): bool
    {
        $code = (string) $e->getCode();

        // SQLite: 19, MySQL/PgSQL: 23000 / 23505.
        return $code === '23000' || $code === '23505' || $code === '19';
    }
}
