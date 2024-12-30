<?php

namespace App\Service;

use App\Notification\NotificationFacade;

readonly class AppointmentNotificationService
{
    public function __construct(
        private NotificationFacade $notificationFacade
    ) {}

    public function sendAppointmentConfirmation(
        string $phoneNumber,
        string $clientName,
        string $date,
        string $time,
        string $additionalInfo,
        string $appointmentId
    ): bool {
        return $this->notificationFacade->sendWhatsAppTemplate(
            $phoneNumber,
            'appointment_confirmation',
            [
                $clientName,
                $date,
                $time,
                $additionalInfo
            ],
            $appointmentId
        );
    }

    public function sendAppointmentReminder(
        string $phoneNumber,
        string $clientName,
        string $date,
        string $time,
        string $appointmentId
    ): bool {
        return $this->notificationFacade->sendWhatsAppTemplate(
            $phoneNumber,
            'appointment_reminder',
            [
                $clientName,
                $date,
                $time,
                '24 hours before your appointment'
            ],
            $appointmentId
        );
    }
}
