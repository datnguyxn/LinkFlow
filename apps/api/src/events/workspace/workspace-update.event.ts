export interface WorkspaceUpdatedEvent {
    id: string;
    updatedBy: string;
    changedFields: string[];
    updatedAt: Date;
    ipAddress?: string | null;
}