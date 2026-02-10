<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'Admin';
    case Ops = 'Ops';
    case Finance = 'Finance';
    case Coach = 'Coach';
}
