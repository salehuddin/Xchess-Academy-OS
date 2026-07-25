<x-mail::message>
# Invoice for {{ $invoice->month_year }}

Dear {{ $invoice->student->parent->name }},

An invoice has been generated for **{{ $invoice->student->name }}**.

**Amount Due: ${{ $invoice->total_amount }}**

@if($invoice->manual_adjustment > 0)
*Includes a manual adjustment of -${{ $invoice->manual_adjustment }}*
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
