<x-mail::message>
# Your Parent Portal Access Link

Dear {{ $parent->name }},

You requested a link to access your XChess Academy parent portal. Use the button below to view your invoices, receipts, and student details.

@component('mail::button', ['url' => $portalUrl])
Access Parent Portal
@endcomponent

If you did not request this link, you can safely ignore this email.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
