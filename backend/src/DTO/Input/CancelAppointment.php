<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\DTO\Input;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

class CancelAppointment
{
    #[Groups(['appointment:cancel'])]
    #[Assert\NotBlank(message: "The Url Is Required")]
    public string $url;
}