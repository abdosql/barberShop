<?php

namespace App\Notification\Template\Base;

use App\Notification\Contract\WhatsAppTemplateInterface;

abstract class ImageMessageTemplate implements WhatsAppTemplateInterface
{
    protected string $imageUrl;

    abstract public function getName(): string;

    abstract public function getLanguage(): string;

    public function format(array $parameters): array
    {
        if (!isset($parameters['recipient_id'])) {
            throw new \InvalidArgumentException('recipient_id is required');
        }

        return [
            'messaging_product' => 'whatsapp',
            'to' => $parameters['recipient_id'],
            'type' => 'template',
            'template' => [
                'name' => $this->getName(),
                'language' => [
                    'code' => $this->getLanguage()
                ],
                'components' => [
                    [
                        'type' => 'header',
                        'parameters' => [
                            [
                                'type' => 'image',
                                'image' => [
                                    'link' => $this->imageUrl
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $parameters['param1'] ?? ''], // Client name
                            ['type' => 'text', 'text' => $parameters['param2'] ?? ''], // Date
                            ['type' => 'text', 'text' => $parameters['param3'] ?? ''], // Time
                            ['type' => 'text', 'text' => $parameters['param4'] ?? '']  // Signature/Additional info
                        ]
                    ]
                ]
            ]
        ];
    }

    public function getImageUrl(): string
    {
        return $this->imageUrl;
    }
} 