
export interface ProfileData {
  profileImage: string;
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  joinDate: string;
  bio: string;
  twitter: string;
  linkedin: string;
  github: string;
  website: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyMarketing: boolean;
  notifyUpdates: boolean;
  visibility: string;
  showEmail: boolean;
  showLocation: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  programme: string;
  graduationYear: string;
  githubLink: string;
  linkedinLink: string;
  aboutMe: string;
}