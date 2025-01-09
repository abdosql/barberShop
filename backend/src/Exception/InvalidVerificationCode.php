<?php
/**
 * @author Saqqal Abdelaziz <seqqal.abdelaziz@gmail.com>
 * @Linkedin https://www.linkedin.com/abdelaziz-saqqal
 */

namespace App\Exception;

use Symfony\Component\HttpKernel\Exception\HttpException;

class InvalidVerificationCode extends HttpException
{
    public function __construct($message = "Invalid Verification code.", $statusCode = 410)
    {
        parent::__construct($statusCode, $message);
    }
}