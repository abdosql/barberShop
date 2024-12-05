<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Appointment;

use App\Entity\Appointment;
use App\Entity\DailyTimeSlot;
use App\Service\Notification\NotificationService;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

readonly class AppointmentManager
{
    public function __construct(
        private Security $security,
        private NotificationService $notificationService,
        private TimeSlotManager $timeSlotManager,
    ) {}

    /**
     * @throws TransportExceptionInterface
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
                $this->sendNotification($appointment);
            }

            $appointment = $this->timeSlotManager->handleTimeSlots($appointment, $status);
        }

        return $appointment;
    }


    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws ClientExceptionInterface
     */
    private function sendNotification(Appointment $appointment): void
    {
        $user = $appointment->getUser();
        $appointmentDate = $appointment->getStartTime();
        $details = [
            'phone_number' => '+212' . ltrim($user->getPhoneNumber(), '0'),
            'customer_name' => $user->getFullName(),
//                    'service' => implode(', ', $appointment->getAppointmentServices()),
            'service' => "test",
            'date_time' => $appointmentDate->format('Y-m-d H:i'),
            'barber_name' => "Mike Smith",
            'language' => "fr"
        ];

        $this->notificationService->notify($details);
    }
}

