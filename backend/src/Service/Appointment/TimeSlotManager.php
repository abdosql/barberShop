<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service\Appointment;

use App\Entity\Appointment;
use Doctrine\ORM\EntityManagerInterface;

class TimeSlotManager
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function handleTimeSlots(Appointment $appointment, ?string $requestMethod): void
    {
        foreach ($appointment->getTimeSlots() as $timeSlot) {
            $isAvailable = $requestMethod === 'PATCH';
            $timeSlot->setIsAvailable($isAvailable);
            $this->entityManager->persist($timeSlot);
        }

        $this->entityManager->flush();
    }
}