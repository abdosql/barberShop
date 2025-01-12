<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Appointment;

use App\Entity\Appointment;
use App\Generator\Url\CancellationUrlGenerator;
use App\Notification\NotificationFacade;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityNotFoundException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;

readonly class AppointmentManager
{
    public function __construct(
        private Security $security,
        private TimeSlotManager $timeSlotManager,
        private NotificationFacade $notificationFacade,
        private CancellationUrlGenerator $urlGenerator,
        private EntityManagerInterface $entityManager
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

    /**
     * @throws \Exception
     */
    public function handleCancellation($url): void
    {
        try {
            $cancellationUrl = $this->urlGenerator->checkUrl($url);
            $appointment = $cancellationUrl->getAppointment();

            if (!$appointment) {
                throw new EntityNotFoundException('No appointment linked to this cancellation URL.');
            }

            $appointment->setStatus("cancelled");
            $this->timeSlotManager->handleTimeSlots($appointment, "cancelled");

            $this->entityManager->remove($cancellationUrl);
            $this->entityManager->flush();
        } catch (AccessDeniedHttpException | BadRequestException | EntityNotFoundException $e) {
            throw $e;
        } catch (\Exception $e) {
            error_log(sprintf('Failed to handle cancellation: %s', $e->getMessage()));
            throw new \RuntimeException('An unexpected error occurred during cancellation.');
        }
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
                    'url' => $this->urlGenerator->generateUrl($appointment, $appointment->getEndTime(), "appointment/Cancel")
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
