<?php

namespace App\EventSubscriber;

use App\Exception\InactiveAccountException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class ExceptionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => ['onKernelException', 2],
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();

        if ($exception instanceof InactiveAccountException) {
            $response = new JsonResponse([
                'message' => 'Account is not active. Please verify your account.',
                'code' => 'INACTIVE_ACCOUNT'
            ], 403);

            $event->setResponse($response);
        }
    }
} 