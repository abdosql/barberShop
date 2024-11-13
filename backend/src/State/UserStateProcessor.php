<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

readonly class UserStateProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface          $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof User && $data->getPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword(
                $data,
                $data->getPassword()
            );
            $data->setPassword($hashedPassword);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
} 