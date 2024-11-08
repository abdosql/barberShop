<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

class JWTCreatedListener
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        /** @var User $user */
        $user = $event->getUser();
        $payload = $event->getData();
        
        // Add custom claims to the token payload
        $payload['id'] = $user->getId();
        $payload['phoneNumber'] = $user->getPhoneNumber();
        $payload['firstName'] = $user->getFirstName();
        $payload['lastName'] = $user->getLastName();
        
        $event->setData($payload);
    }
} 