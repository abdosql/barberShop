<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification\Template;

use App\Notification\Template\Base\ImageMessageTemplate;

class AppointmentCanceled extends ImageMessageTemplate
{
    public function __construct(
        string $imageUrl = 'https://i.ibb.co/8MyQmtz/Whats-App-Image-2025-01-02-at-22-14-13-6170219b.jpg'
    ) {
        $this->imageUrl = $imageUrl;
    }
    public function getName(): string
    {
        return 'event_rsvp_reminder_2';
    }

    public function getLanguage(): string
    {
        return 'en_US';
    }
}