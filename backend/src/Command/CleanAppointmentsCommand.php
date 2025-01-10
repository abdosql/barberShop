<?php

namespace App\Command;

use App\Entity\Appointment;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\QueryException;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:clean:appointments',
    description: 'Add a short description for your command',
)]
class CleanAppointmentsCommand extends Command
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

        try {
            $deletedCount = $this->entityManager
                ->getRepository(Appointment::class)
                ->deletePastNotConfirmedAppointments();

            if ($deletedCount > 0) {
                $io->success("$deletedCount past not confirmed appointment(s) deleted successfully.");
                return Command::SUCCESS;
            }

            $io->info('No past not confirmed appointments found.');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('An error occurred while deleting past not confirmed appointments: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

}
