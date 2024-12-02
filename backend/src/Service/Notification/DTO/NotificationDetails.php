<?php

namespace App\Service\Notification\DTO;

class NotificationDetails
{
    public function __construct(
        public readonly string $phoneNumber,
        public readonly string $customerName,
        public readonly string $service,
        public readonly string $dateTime,
        public readonly string $barberName,
        public readonly string $language = 'fr'
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            phoneNumber: $data['phone_number'] ?? '',
            customerName: $data['customer_name'] ?? '',
            service: $data['service'] ?? '',
            dateTime: $data['date_time'] ?? '',
            barberName: $data['barber_name'] ?? '',
            language: $data['language'] ?? 'fr'
        );
    }

    public function toArray(): array
    {
        return [
            'phone_number' => $this->phoneNumber,
            'customer_name' => $this->customerName,
            'service' => $this->service,
            'date_time' => $this->dateTime,
            'barber_name' => $this->barberName,
            'language' => $this->language,
        ];
    }
}
