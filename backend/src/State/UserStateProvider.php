<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Exception\InactiveAccountException;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Psr\Log\LoggerInterface;

readonly class UserStateProvider implements ProviderInterface
{
    public function __construct(
        private Security $security,
        private LoggerInterface $logger
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): ?User
    {
        $user = $this->security->getUser();
        
        $this->logger->info('Current user:', [
            'user' => $user ? $user->getUserIdentifier() : 'null',
            'operation' => $operation->getName(),
            'context' => $context
        ]);
        
        if (!$user instanceof User) {
            throw new AccessDeniedException('Not authenticated');
        }

        return $user;
    }
} 