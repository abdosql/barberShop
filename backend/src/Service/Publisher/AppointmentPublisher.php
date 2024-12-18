<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Publisher;

use App\Entity\Appointment;
use App\Publisher\PublisherInterface;

readonly class AppointmentPublisher
{
    public function __construct(
        private PublisherInterface $publisher,
    ) {
    }

    public function publish(Appointment $appointment, string $action = 'created'): void
    {
        $this->publisher->publish(
            topics: [
                "appointment",
            ],
            data: [
                'id' => $appointment->getId(),
                'action' => $action, // 'created', 'updated', or 'deleted'
            ]
        );
    }
}