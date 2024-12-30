<?php

namespace App\Notification\Template;

use App\Notification\Contract\WhatsAppTemplateInterface;

class AppointmentReminderTemplate implements WhatsAppTemplateInterface
{
    private float $latitude;
    private float $longitude;
    private string $locationName;
    private string $address;

    public function __construct(
        float $latitude,
        float $longitude,
        string $locationName,
        string $address
    ) {
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->locationName = $locationName;
        $this->address = $address;
    }

    public function getName(): string
    {
        return 'appointment_confirmation';
    }

    public function getLanguage(): string
    {
        return 'fr';
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
                ],
                'components' => [
                    [
                        'type' => 'location',
                        'parameters' => [
                            [
                                'type' => 'location',
                                'latitude' => $this->latitude,
                                'longitude' => $this->longitude,
                                'name' => $this->locationName,
                                'address' => $this->address
                            ]
                        ]
                    ],
                    [
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $parameters['param1']],
                            ['type' => 'text', 'text' => $parameters['param2']],
                            ['type' => 'text', 'text' => $parameters['param3']],
                            ['type' => 'text', 'text' => $parameters['param4']]
                        ]
                    ],
                    [
                        'type' => 'button',
                        'sub_type' => 'url',
                        'index' => 0,
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => sprintf('https://jalalbarber.com/appointment/%s/cancel', $parameters['appointment_id'])
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }
}
