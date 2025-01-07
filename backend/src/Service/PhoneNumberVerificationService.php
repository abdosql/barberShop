<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Service;

use App\Entity\Appointment;
use App\Entity\PhoneNumberVerification;
use App\Entity\User;
use App\Exception\CodeExpiredException;
use App\Notification\NotificationFacade;
use Doctrine\ORM\EntityManagerInterface;
use Random\RandomException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class PhoneNumberVerificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        #[Autowire('%verification_code_expiry_minutes%')] private int $expiryMinutes,
        private NotificationFacade $notificationFacade

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
        $this->sendVerification($user, $code);
        return $PhoneNumberVerification;
    }

    public function verifyCode(User $user, $code): bool
    {
        $repository = $this->entityManager->getRepository(PhoneNumberVerification::class);
        $verification = $repository->findOneBy(['user_' => $user, 'code' => $code]);

        if (!$verification) {
            return false;
        }

        if ($verification->getExpiredAt() <= new \DateTime()) {
            throw new CodeExpiredException();
        }

        $user->setActive(true);
        $this->entityManager->persist($user);

        $this->entityManager->remove($verification);
        $this->entityManager->flush();

        return true;
    }

    private function sendVerification(User $user, $code): void
    {

        $phoneNumber = '212' . ltrim($user->getPhoneNumber(), '0');

        try {
            $this->notificationFacade->send(
                'whatsapp',
                $phoneNumber,
                [
                    'recipient_id' => $phoneNumber,
                    'code' => $code,
                ],
                ['template' => "verification_password"]
            );
        } catch (\Throwable $e) {
            error_log(sprintf('Failed to send WhatsApp notification: %s', $e->getMessage()));
        }
    }
}