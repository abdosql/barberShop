<?php

namespace App\Notification\Template;

use App\Notification\Contract\WhatsAppTemplateInterface;

class WhatsAppTemplateRegistry
{
    /** @var array<string, WhatsAppTemplateInterface> */
    private array $templates = [];

    public function addTemplate(WhatsAppTemplateInterface $template): void
    {
        $this->templates[$template->getName()] = $template;
    }

    public function getTemplate(string $name): ?WhatsAppTemplateInterface
    {
        return $this->templates[$name] ?? null;
    }
}
