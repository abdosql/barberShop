<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Analytic;

use App\DTO\DashboardDTO;

interface AnalyticsServiceInterface
{
    public function getDashboardMetrics(): DashboardDTO;
}