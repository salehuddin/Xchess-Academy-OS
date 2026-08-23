<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('notifications:run')->dailyAt('09:00');

Schedule::command('notifications:prune')->dailyAt('02:00');

Schedule::command('attendance:remind-pending')->dailyAt('18:00');

Schedule::command('invoices:generate-monthly')->monthlyOn(1, '00:00');

Schedule::command('payroll:generate-monthly')->monthlyOn(1, '00:30');
