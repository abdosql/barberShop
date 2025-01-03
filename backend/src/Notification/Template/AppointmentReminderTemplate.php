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
        string $address,
    ) {
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->locationName = $locationName;
        $this->address = $address;
    }

    public function getName(): string
    {
        return 'barbershop_jalal';
    }

    public function getLanguage(): string
    {
        return 'en_US';
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
                        'type' => 'header',
                        'parameters' => [
                            [
                                'type' => 'location',
                                'location' => [
                                    'latitude' => $this->latitude,
                                    'longitude' => $this->longitude,
                                    'name' => $this->locationName,
                                    'address' => $this->address
                                ]
                            ]
                        ]
                    ],
                    [
                        'type' => 'body',
                        'parameters' => [
                            ['type' => 'text', 'text' => $parameters['param1'] ?? ''],
                            ['type' => 'text', 'text' => $parameters['param2'] ?? ''],
                            ['type' => 'text', 'text' => $parameters['param3'] ?? ''],
                            ['type' => 'text', 'text' => $parameters['param4'] ?? '']
                        ]
                    ],
                    [
                        'type' => 'button',
                        'sub_type' => 'url',
                        'index' => '0',
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => $parameters['appointment_id'] ?? ''
                            ]
                        ]
                    ]
                ]
            ]
        ];
    }

    public function getLocationName(): string
    {
        return $this->locationName;
    }

    public function getAddress(): string
    {
        return $this->address;
    }
}
