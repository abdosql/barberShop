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
                $this->sendConfirmation($appointment);
            }
            if ($status === 'cancelled') {
                $this->sendCancellation($appointment);
            }
            if ($status === 'declined') {
                $this->sendDeclination($appointment);
            }

            $appointment = $this->timeSlotManager->handleTimeSlots($appointment, $status);
        }

        return $appointment;
    }

    private function sendCancellation(Appointment $appointment): void
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
                [
                    'recipient_id' => $phoneNumber,
                    'param1' => $user->getFullName(),
                    'param2' => $appointment->getStartTime()->format('Y-m-d'),
                    'param3' => $appointment->getStartTime()->format('H:i'),
                    'param4' => 'Jalal Barbershop'
                ],
                ['template' => "event_rsvp_reminder_2"]
            );
        } catch (\Throwable $e) {
            error_log(sprintf('Failed to send WhatsApp notification: %s', $e->getMessage()));
        }
    }

    private function sendConfirmation(Appointment $appointment): void
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
                [
                    'recipient_id' => $phoneNumber,
                    'param1' => $user->getFullName(),
                    'param2' => $appointment->getStartTime()->format('Y-m-d'),
                    'param3' => $appointment->getStartTime()->format('H:i'),
                    'param4' => 'Your appointment has been confirmed',
                    'appointment_id' => $appointment->getId()
                ],
                ['template' => "barbershop_jalal"]
            );
        } catch (\Throwable $e) {
            error_log(sprintf('Failed to send WhatsApp notification: %s', $e->getMessage()));
        }
    }

    private function sendDeclination(Appointment $appointment): void
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
                [
                    'recipient_id' => $phoneNumber,
                    'param1' => $user->getFullName(),
                    'param2' => $appointment->getStartTime()->format('Y-m-d'),
                    'param3' => $appointment->getStartTime()->format('H:i'),
                    'param4' => 'Jalal Barbershop'
                ],
                ['template' => "cancel__appoitement"]
            );
        } catch (\Throwable $e) {
            error_log(sprintf('Failed to send WhatsApp notification: %s', $e->getMessage()));
        }
    }

}
