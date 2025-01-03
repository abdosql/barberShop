<?php

namespace App\Notification\Template;

use App\Notification\Contract\WhatsAppTemplateInterface;

class VerificationCodeTemplate implements WhatsAppTemplateInterface
{
    public function getName(): string
    {
        return 'verification_password';
    }

    public function getLanguage(): string
    {
        return 'fr';
    }

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
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $parameters['code'] ?? ''] // Verification code
                        ]
                    ],
                    [
                        'type' => 'button',
                        'sub_type' => 'url',
                        'index' => '0',
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => $parameters['code'] ?? ''
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }
} 