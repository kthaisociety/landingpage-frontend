export interface AdminProfileData {
  first_name: string;
  last_name: string;
  email: string;
  university?: string;
  programme?: string;
  graduation_year?: number;
  github_link?: string;
  linkedin_link?: string;
  about_me?: string;
}

export interface UpdateAdminUserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  university?: string;
  programme?: string;
  graduationYear?: number;
  githubLink?: string;
  linkedinLink?: string; // PUT expects lowercase 'i'
  aboutMe?: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  provider: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}
