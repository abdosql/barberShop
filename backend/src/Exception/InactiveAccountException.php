<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

class InactiveAccountException extends HttpException
{
    public function __construct(string $message = 'Account is not active. Please verify your account.')
    {
        parent::__construct(403, $message);
    }
}