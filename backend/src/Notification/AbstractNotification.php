<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Notification;

abstract class AbstractNotification implements NotificationInterface
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

}