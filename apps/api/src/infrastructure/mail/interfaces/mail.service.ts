export interface SendVerificationEmail {
  email: string;
  fullName: string;
  verifyToken: string;
}

export interface SendResetPasswordEmail {
  email: string;
  fullName: string;
  resetToken: string;
}

export interface SendWorkspaceInvitationEmail {
  workspaceId: string;
  name: string;
  email: string;
  inviterName: string;
  workspaceName: string;
  inviteToken: string;
  roleName: string;
}

export interface SendAcceptanceEmailToInvitee {
  workspaceId: string;
  name: string;
  email: string;
  inviterName: string;
  inviteeName: string;
  workspaceName: string;
  inviteToken: string;
  roleName: string;
}

export interface SendAcceptanceEmailToInviter {
  workspaceId: string;
  name: string;
  email: string;
  inviterName: string;
  inviteeName: string;
  workspaceName: string;
  inviteToken: string;
  roleName: string;
}

export interface SendRejectionEmailToInviter {
  workspaceId: string;
  name: string;
  email: string;
  inviterName: string;
  inviteeName: string;
  workspaceName: string;
  roleName: string;
}

export interface SendRevocationEmailToInvitee {
  workspaceId: string;
  name: string;
  email: string;
  inviterName: string;
  inviteeName: string;
  workspaceName: string;
  roleName: string;
}

export interface SendUrlExpirationReminder {
  email: string;
  fullName: string;
  urlName: string;
  expiredAt: Date;
}

export interface UserActionTemplateProps {
  email: string;
  fullName: string;
  action: string;
  reason?: string;
  actionTime: Date;
}

export interface SendOwnershipTransferredToNewOwner {
  email: string;
  name: string;
  workspaceName: string;
}

export interface SendOwnershipTransferredToPreviousOwner {
  email: string;
  name: string;
  workspaceName: string;
}

export interface SendWorkspaceMemberRoleUpdatedEmail {
  workspaceId: string;
  workspaceName: string;
  memberId: string;
  userId: string;
  memberName: string;
  memberEmail: string;
  previousRoleId: string;
  previousRoleName: string;
  newRoleId: string;
  newRoleName: string;
  updatedAt: Date;
  ipAddress?: string | null;
}

export interface SendWelcomeEmail {
  email: string;
  fullName: string;
}

export interface WorkspaceMemberLeaveMail {
  workspaceId: string;
  workspaceName: string;
  ownerName: string;
  memberId: string;
  memberName: string;
  ownerEmail: string;
  role: string;
  leaveAt: Date;
  ipAddress?: string | null;
}

export interface WorkspaceMemberRemovedMail {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  memberId: string;
  memberEmail: string;
  fullName: string;
  role: string;
  removeAt?: Date;
  ipAddress?: string;
}

export interface MailService {
  sendWelcomeEmail(data: SendWelcomeEmail): Promise<void>;

  sendVerificationEmail(data: SendVerificationEmail): Promise<void>;

  sendResetPasswordEmail(data: SendResetPasswordEmail): Promise<void>;

  sendWorkspaceInvitationEmail(data: SendWorkspaceInvitationEmail): Promise<void>;

  sendAcceptanceEmailToInviter(data: SendAcceptanceEmailToInviter): Promise<void>;

  sendAcceptanceEmailToInvitee(data: SendAcceptanceEmailToInvitee): Promise<void>;

  sendRejectionEmailToInviter(data: SendRejectionEmailToInviter): Promise<void>;

  sendRevocationEmailToInvitee(data: SendRevocationEmailToInvitee): Promise<void>;

  sendWorkspaceMemberRoleUpdatedEmail(data: SendWorkspaceMemberRoleUpdatedEmail): Promise<void>;

  sendWorkspaceMemberLeaveEmail(data: WorkspaceMemberLeaveMail): Promise<void>;

  sendWorkspaceMemberRemovedEmail(data: WorkspaceMemberRemovedMail): Promise<void>;

  sendUrlExpirationReminder(data: SendUrlExpirationReminder): Promise<void>;

  sendUserActionEmail(data: UserActionTemplateProps): Promise<void>;

  sendOwnershipTransferredToNewOwner(data: SendOwnershipTransferredToNewOwner): Promise<void>;

  sendOwnershipTransferredToPreviousOwner(
    data: SendOwnershipTransferredToPreviousOwner,
  ): Promise<void>;
}
