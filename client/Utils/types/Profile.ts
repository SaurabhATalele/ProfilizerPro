export interface ProfileUpdatePayload {
  action: "updateProfile";
  name?: string;
  username?: string;
}

export interface PasswordChangePayload {
  action: "changePassword";
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type ProfilePatchPayload = ProfileUpdatePayload | PasswordChangePayload;

export interface ProfileUpdateResponse {
  message: string;
  user?: {
    username: string;
    name: string;
    email: string;
  };
}

export interface ProfileErrorResponse {
  message: string;
  field?: string;
}
