<?php

namespace App\Mail;

use App\Models\StudentParent;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ParentPortalAccess extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public StudentParent $parent)
    {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your XChess Academy Parent Portal Access Link',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.parents.access-link',
            with: [
                'portalUrl' => route('portal.parent', $this->parent->unique_access_token),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
