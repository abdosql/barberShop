<?php
namespace App\Service\Appointment;

use App\Entity\Appointment;
use App\Entity\DailyTimeSlot;
use App\Entity\TimeSlot;
use Doctrine\ORM\EntityManagerInterface;

class TimeSlotManager
{
    private EntityManagerInterface $entityManager;

    public function __construct(
        EntityManagerInterface $entityManager
    ) {
        $this->entityManager = $entityManager;
    }

    /**
     * @throws \Exception
     */
    public function handleTimeSlots(Appointment $appointment, ?string $status): Appointment
    {
        foreach ($appointment->getTimeSlots() as $timeSlot) {
            // Ensure we're working with a managed TimeSlot entity from the database
            $existingTimeSlot = $this->entityManager->getRepository(TimeSlot::class)->find($timeSlot->getId());

            if (!$existingTimeSlot) {
                throw new \Exception('TimeSlot with ID ' . $timeSlot->getId() . ' not found.');
            }

            // Update the appointment's timeSlots collection to use the managed TimeSlot
            $appointment->removeTimeSlot($timeSlot);
            $appointment->addTimeSlot($existingTimeSlot);

            // Get the date of the appointment (without time component)
            $appointmentDate = $appointment->getStartTime()->format('Y-m-d');

            // Check if a DailyTimeSlot for this date already exists in the TimeSlot
            $dailyTimeSlotForDate = null;
            foreach ($existingTimeSlot->getDailyTimeSlots() as $dailyTimeSlot) {
                if ($dailyTimeSlot->getDate()->format('Y-m-d') === $appointmentDate) {
                    $dailyTimeSlotForDate = $dailyTimeSlot;
                    break;
                }
            }

            // Determine availability based on appointment status
            $isAvailable = in_array($status, ['declined', 'cancelled', 'completed'], true);

            if (!$dailyTimeSlotForDate) {
                // Create a new DailyTimeSlot for this date
                $newDailyTimeSlot = new DailyTimeSlot();
                $newDailyTimeSlot->setDate(new \DateTime($appointmentDate));
                $newDailyTimeSlot->setIsAvailable($isAvailable);
                $newDailyTimeSlot->setTimeSlot($existingTimeSlot);

                // Add the new DailyTimeSlot to the TimeSlot
                $existingTimeSlot->addDailyTimeSlot($newDailyTimeSlot);
            } else {
                // Update the existing DailyTimeSlot's availability
                $dailyTimeSlotForDate->setIsAvailable($isAvailable);
            }

            // Persist the changes
            $this->entityManager->persist($existingTimeSlot);
        }
        
        return $appointment;
    }
}