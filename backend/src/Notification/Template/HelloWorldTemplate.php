<?php

namespace App\Notification\Template;

use App\Notification\Contract\WhatsAppTemplateInterface;

class HelloWorldTemplate implements WhatsAppTemplateInterface
{
    public function getName(): string
    {
        return 'hello_world';
    }

    public function getLanguage(): string
    {
        return 'en_US';
    }

    public function format(array $parameters): array
    {
        return [
            'messaging_product' => 'whatsapp',
            'to' => $parameters['recipient_id'],
            'type' => 'template',
            'template' => [
                'name' => $this->getName(),
                'language' => [
                    'code' => $this->getLanguage()
                ]
            ]
        ];
    }
}
