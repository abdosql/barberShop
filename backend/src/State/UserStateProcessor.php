<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Service\PhoneNumberVerificationService;
use Random\RandomException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use ApiPlatform\Validator\Exception\ValidationException;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

readonly class UserStateProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface          $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher,
        private PhoneNumberVerificationService $numberVerificationService
    ) {
    }

    /**
     * @throws RandomException
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof User) {
            if ($data->getPassword()){
                $hashedPassword = $this->passwordHasher->hashPassword(
                    $data,
                    $data->getPassword()
                );
                $data->setPassword($hashedPassword);
            }

            $verification =  $this->numberVerificationService->createVerification($data);
            $data->addPhoneNumberVerification($verification);

        }

        try {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        } catch (UniqueConstraintViolationException $e) {
            $violations = new ConstraintViolationList([
                new ConstraintViolation(
                    'Ce numéro de téléphone est déjà utilisé par un autre compte.',
                    null,
                    [],
                    $data,
                    'phoneNumber',
                    $data->getPhoneNumber()
                )
            ]);
            throw new ValidationException($violations);
        }
    }
}