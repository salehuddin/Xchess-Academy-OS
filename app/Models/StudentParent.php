<?php

namespace App\Models;

use Database\Factories\StudentParentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentParent extends Model
{
    /** @use HasFactory<StudentParentFactory> */
    use HasFactory;

    protected $table = 'parents';

    protected $guarded = [];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'parent_id');
    }
}
