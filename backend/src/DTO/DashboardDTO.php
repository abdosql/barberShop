<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\DTO;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\AnalyticsProvider;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    shortName: 'Analytics',
    operations: [
        new Get(
            uriTemplate: '/analytics',
            description: 'Retrieves analytics data including appointments, revenue, and growth metrics',
            normalizationContext: ['groups' => ['analytics:read']],
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: 'Only administrators can access analytics.',
            name: 'get_analytics',
            provider: AnalyticsProvider::class
        )
    ]
)]
class DashboardDTO
{
    #[Groups(['analytics:read'])]
    public AnalyticsDTO $totalAppointments;

    #[Groups(['analytics:read'])]
    public AnalyticsDTO $completedAppointments;

    #[Groups(['analytics:read'])]
    public AnalyticsDTO $cancelledAppointments;

    #[Groups(['analytics:read'])]
    public AnalyticsDTO $revenue;
}