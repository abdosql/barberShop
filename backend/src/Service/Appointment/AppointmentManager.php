<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Appointment;

use App\Entity\Appointment;
use App\Notification\NotificationFacade;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;

readonly class AppointmentManager
{
    public function __construct(
        private Security $security,
        private TimeSlotManager $timeSlotManager,
        private NotificationFacade $notificationFacade
    ) {}

    /**
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     * @throws \Exception
     */
    public function handleAppointment(Appointment $appointment, ?string $requestMethod): Appointment
    {
        $status = $appointment->getStatus();
        $now = new \DateTimeImmutable();

        if ($requestMethod === 'POST') {
            $appointment->setUser($this->security->getUser());
            $appointment->setCreatedAt($now);
            $appointment->setUpdatedAt($now);

            // Delegate to TimeSlotManager for slot handling
            $appointment = $this->timeSlotManager->handleTimeSlots($appointment, $status);
        }

        if ($requestMethod === 'PATCH') {
            $appointment->setUpdatedAt($now);
            if ($status === 'accepted') {
                $this->sendTestNotification($appointment);
            }
            if ($status === 'cancelled') {
                $this->sendTestNotification($appointment);
            }

            $appointment = $this->timeSlotManager->handleTimeSlots($appointment, $status);
        }

        return $appointment;
    }

    private function sendTestNotification(Appointment $appointment): void
    {
        $user = $appointment->getUser();
        if (!$user || !$user->getPhoneNumber()) {
            return;
        }

        $phoneNumber = '212' . ltrim($user->getPhoneNumber(), '0');
        
        try {
            $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                ['recipient_id' => $phoneNumber],
                ['template' => 'hello_world']
            );
        } catch (\Throwable $e) {
            error_log(sprintf('Failed to send WhatsApp notification: %s', $e->getMessage()));
        }
    }
}
