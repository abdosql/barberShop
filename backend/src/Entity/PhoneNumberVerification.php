<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PhoneNumberVerificationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource]
#[ORM\Entity(repositoryClass: PhoneNumberVerificationRepository::class)]
class PhoneNumberVerification
{
    public const TYPE_PHONE_VERIFICATION = 'phone_verification';
    public const TYPE_PASSWORD_RESET = 'password_reset';
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 6)]
    #[Assert\NotBlank]
    #[Assert\Length(exactly: 6)]
    #[Assert\Regex('/^\d{6}$/')]
    private ?string $code = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $expiredAt = null;

    #[ORM\ManyToOne(cascade: ['persist'], inversedBy: 'phoneNumberVerifications')]
    #[Assert\NotNull]
    private ?User $user_ = null;

    #[ORM\Column(length: 255)]
    private ?string $type = self::TYPE_PHONE_VERIFICATION;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getExpiredAt(): ?\DateTimeImmutable
    {
        return $this->expiredAt;
    }

    public function setExpiredAt(\DateTimeImmutable $expiredAt): static
    {
        $this->expiredAt = $expiredAt;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user_;
    }

    public function setUser(?User $user_): static
    {
        $this->user_ = $user_;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }
}
