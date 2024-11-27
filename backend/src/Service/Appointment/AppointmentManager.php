<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Appointment;

use App\Entity\Appointment;
use Symfony\Bundle\SecurityBundle\Security;

readonly class AppointmentManager
{
    public function __construct(
        private Security $security,
    ) {}

    public function handleAppointment(Appointment $appointment, ?string $requestMethod): Appointment
    {
        $now = new \DateTimeImmutable();

        if ($requestMethod === 'POST') {
            $appointment->setUser($this->security->getUser());
            $appointment->setCreatedAt($now);
            $appointment->setUpdatedAt($now);
        }

        if ($requestMethod === 'PATCH') {
            $appointment->setUpdatedAt($now);
        }

        return $appointment;
    }
}