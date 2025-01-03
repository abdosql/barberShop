<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service;

use App\Entity\PhoneNumberVerification;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Random\RandomException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class PhoneNumberVerificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        #[Autowire('%verification_code_expiry_minutes%')] private int $expiryMinutes
    )
    {
    }

    /**
     * @throws RandomException
     */
    public function generateCode(): string
    {
        return str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * @throws RandomException
     * @throws \Exception
     */
    public function createVerification(User $user): PhoneNumberVerification
    {
        $code = $this->generateCode();
        $expiredAt = new \DateTimeImmutable(sprintf('+%d minutes', $this->expiryMinutes));

        $PhoneNumberVerification = new PhoneNumberVerification();
        $PhoneNumberVerification
            ->setCode($code)
            ->setUser($user)
            ->setExpiredAt($expiredAt)
        ;

        $this->entityManager->persist($PhoneNumberVerification);
        $this->entityManager->flush();

        return $PhoneNumberVerification;
    }

    public function verifyCode(User $user, $code): bool
    {
        $repository = $this->entityManager->getRepository(PhoneNumberVerification::class);
        $verification = $repository->findOneBy(['user' => $user, 'code' => $code]);

        if ($verification && $verification->getExpiredAt() > new \DateTime()) {
            $user->setActive(true);
            $this->entityManager->persist($user);

            $this->entityManager->remove($verification);
            $this->entityManager->flush();
            return true;
        }
        return false;
    }
}