<?php

namespace App\Notification\Exception;

class WhatsAppApiException extends NotificationException
{
    private array $apiResponse;
    private int $statusCode;

    public function __construct(string $message, array $apiResponse, int $statusCode, ?\Throwable $previous = null)
    {
        parent::__construct($message, 0, $previous);
        $this->apiResponse = $apiResponse;
        $this->statusCode = $statusCode;
    }

    public function getApiResponse(): array
    {
        return $this->apiResponse;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public static function fromResponse(array $response, int $statusCode): self
    {
        $error = $response['error'] ?? [];
        $message = $error['message'] ?? 'Unknown WhatsApp API error';
        $code = $error['code'] ?? 0;
        $details = $error['error_data']['details'] ?? [];

        return new self(
            sprintf(
                'WhatsApp API Error (Code %d): %s. Details: %s',
                $code,
                $message,
                json_encode($details)
            ),
            $response,
            $statusCode
        );
    }
} 