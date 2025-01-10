<?php

namespace App\Command;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\QueryException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:clean-inactive-users',
    description: 'Add a short description for your command',
)]
class CleanInactiveUsersCommand extends Command
{
    public function __construct
    (
        private readonly EntityManagerInterface $entityManager,
    )
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $inactiveUsers = $this->entityManager->getRepository(User::class);

        try {
            $deletedCount = $inactiveUsers->deleteInactiveUsers();

            if ($deletedCount > 0) {
                $io->success("$deletedCount inactive user(s) deleted successfully.");
                return Command::SUCCESS;
            }

            $io->info('No inactive users found.');
            return Command::SUCCESS;
        } catch (QueryException $e) {
            $io->error('An error occurred while trying to delete inactive users: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

}
