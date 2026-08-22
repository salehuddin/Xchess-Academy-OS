<x-mail::message>
# Invoice for {{ $invoice->month_year }}

Dear {{ $invoice->student->parent->name }},

An invoice has been generated for **{{ $invoice->student->name }}**.

**Amount Due: RM {{ number_format($invoice->total_amount, 2) }}

@if($invoice->adjustments->where('status', 'applied')->where('amount', '>', 0)->isNotEmpty())
*Adjustments:*
@foreach($invoice->adjustments->where('status', 'applied')->where('amount', '>', 0) as $adj)
- {{ $adj->type === 'charge' ? '+' : '-' }}RM {{ number_format($adj->amount, 2) }} — {{ $adj->reason }}
@endforeach
@endif

@php
    $portalUrl = isset($invoice->student->parent->unique_access_token)
        ? route('portal.invoice.show', [$invoice->student->parent->unique_access_token, $invoice->id])
        : config('app.url');
@endphp

@component('mail::button', ['url' => $portalUrl])
View Invoice
@endcomponent

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
