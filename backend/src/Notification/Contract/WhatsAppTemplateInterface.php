<?php

namespace App\Notification\Contract;

interface WhatsAppTemplateInterface
{
    /**
     * Get the template name
     */
    public function getName(): string;

    /**
     * Get the template language
     */
    public function getLanguage(): string;

    /**
     * Format the template with given parameters
     *
     * @param array $parameters Parameters to fill in the template
     * @return array Formatted template data
     */
    public function format(array $parameters): array;
}
