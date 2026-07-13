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
  email: string;
  inviterName: string;
  workspaceName: string;
  inviteToken: string;
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

export interface MailService {
  sendVerificationEmail(data: SendVerificationEmail): Promise<void>;

  sendResetPasswordEmail(data: SendResetPasswordEmail): Promise<void>;

  sendWorkspaceInvitationEmail(data: SendWorkspaceInvitationEmail): Promise<void>;

  sendUrlExpirationReminder(data: SendUrlExpirationReminder): Promise<void>;

  sendUserActionEmail(data: UserActionTemplateProps): Promise<void>;
}
