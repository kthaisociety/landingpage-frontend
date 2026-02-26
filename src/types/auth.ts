export interface User {
  name: string;
  email: string;
  picture: string;
  role: string;
}


export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginUser: (code: string) => void;
  logoutUser: () => void;
}