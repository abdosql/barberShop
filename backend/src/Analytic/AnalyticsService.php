<?php

namespace App\Analytic;

use App\DTO\AnalyticsDTO;
use App\DTO\DashboardDTO;
use App\Entity\Appointment;
use App\Repository\AppointmentRepository;

readonly class AnalyticsService implements AnalyticsServiceInterface
{
    public function __construct(
        private AppointmentRepository $appointmentRepository
    ) {
    }

    public function getDashboardMetrics(): DashboardDTO
    {
        $currentMonth = new \DateTime('first day of this month');
        $previousMonth = new \DateTime('first day of last month');

        $currentMonthAppointments = $this->appointmentRepository->findByMonth($currentMonth);
        $previousMonthAppointments = $this->appointmentRepository->findByMonth($previousMonth);

        $dashboard = new DashboardDTO();

        // Total appointments
        $dashboard->totalAppointments = $this->calculateAppointmentMetrics(
            count($currentMonthAppointments),
            count($previousMonthAppointments)
        );

        // Completed appointments
        $dashboard->completedAppointments = $this->calculateAppointmentMetrics(
            $this->countAppointmentsByStatus($currentMonthAppointments, 'completed'),
            $this->countAppointmentsByStatus($previousMonthAppointments, 'completed')
        );

        // Cancelled appointments
        $dashboard->cancelledAppointments = $this->calculateAppointmentMetrics(
            $this->countAppointmentsByStatus($currentMonthAppointments, 'cancelled'),
            $this->countAppointmentsByStatus($previousMonthAppointments, 'cancelled')
        );

        // Revenue calculation (only from completed appointments)
        $currentRevenue = $this->calculateRevenueFromCompletedAppointments($currentMonthAppointments);
        $previousRevenue = $this->calculateRevenueFromCompletedAppointments($previousMonthAppointments);
        $dashboard->revenue = $this->calculateAppointmentMetrics($currentRevenue, $previousRevenue);

        return $dashboard;
    }

    private function calculateAppointmentMetrics(float $currentValue, float $previousValue): AnalyticsDTO
    {
        $metrics = new AnalyticsDTO();
        $metrics->currentValue = $currentValue;
        $metrics->previousValue = $previousValue;
        $metrics->growth = $previousValue > 0 
            ? (($currentValue - $previousValue) / $previousValue) * 100 
            : ($currentValue > 0 ? 100 : 0);

        return $metrics;
    }

    private function countAppointmentsByStatus(array $appointments, string $status): int
    {
        return count(array_filter($appointments, fn(Appointment $appointment) => 
            $appointment->getStatus() === $status
        ));
    }

    private function calculateRevenueFromCompletedAppointments(array $appointments): float
    {
        return array_reduce(
            array_filter($appointments, fn(Appointment $appointment) => $appointment->getStatus() === 'completed'),
            fn(float $total, Appointment $appointment) => $total + (float)($appointment->getTotalPrice() ?? 0),
            0.0
        );
    }
}
