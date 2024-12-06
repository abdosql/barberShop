<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\DTO;

use Symfony\Component\Serializer\Annotation\Groups;

class AnalyticsDTO
{
    #[Groups(['analytics:read'])]
    public mixed $currentValue;

    #[Groups(['analytics:read'])]
    public mixed $previousValue;

    #[Groups(['analytics:read'])]
    public float $growth;
}