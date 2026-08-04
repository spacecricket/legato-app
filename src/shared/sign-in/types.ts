export type Status = 'signed-in' | 'pending-verification' | 'error'

export interface SignInResponse {
    status: Status,
    workspaceSlug?: string,
    error?: string
}
