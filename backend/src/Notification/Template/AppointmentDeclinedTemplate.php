<?php

namespace App\Notification\Template;

use App\Notification\Template\Base\ImageMessageTemplate;

class AppointmentDeclinedTemplate extends ImageMessageTemplate
{
    public function __construct(
        string $imageUrl = 'https://i.ibb.co/mvtdV42/Whats-App-Image-2025-01-02-at-22-14-13-e74cb2db.jpg'
    ) {
        $this->imageUrl = $imageUrl;
    }
    public function getName(): string
    {
        return 'cancel__appoitement';
    }

    public function getLanguage(): string
    {
        return 'en_Us';
    }
} 