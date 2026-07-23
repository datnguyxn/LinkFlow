import { WorkspaceInvitationRepository } from '../modules/workspace/repository/workspace-invitation.repository.ts';
import { WorkspaceInvitationExpirationJob } from '../jobs/workspace/workspace-invitation-expiration.job.ts';
import { WorkspaceInvitationPublisher } from '../publishers/workspace-invitation/workspace-invitation.publisher.ts';
import { Publisher } from '../infrastructure/queue/index.ts';

export async function registerJobs() {
  const workspaceInvitationRepository = new WorkspaceInvitationRepository();

  const workspaceInvitationPublisher = new WorkspaceInvitationPublisher(new Publisher());

  const workspaceInvitationExpirationJob = new WorkspaceInvitationExpirationJob(
    workspaceInvitationRepository,
    workspaceInvitationPublisher,
  );

  await workspaceInvitationExpirationJob.start();

  console.log('✅ Jobs started');

  return {
    workspaceInvitationExpirationJob,
  };
}
