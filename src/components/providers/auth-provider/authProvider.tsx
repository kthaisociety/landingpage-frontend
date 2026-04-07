// "use client";

// import { createContext, useContext, useEffect, useState } from "react";

// const AuthContext = createContext({
//   isAuthenticated: false,
//   isLoading: true, // Crucial: tells the app we are still checking
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   async function checkStatus() {
//     try {
//       // This uses your Next.js rewrite to hit the Go h.Status endpoint
//       // const response = await fetch("/api/auth/status");
//       const response = await fetch("/api/profile/me");

//       // console.log("Auth Status Response:", response);

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Auth Status Data:", data);



//         setIsAuthenticated(data.authenticate); // Set to true if valid
//       } else {
//         setIsAuthenticated(false); // 401 Unauthorized means not logged in
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       setIsAuthenticated(false);
//     } finally {
//               // const responseP = await fetch("/api/profile");
//               // const dataP = await responseP.json();
//               // console.log("Profile Data:", dataP);
//       // Whether it succeeded or failed, we are done checking
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     checkStatus();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // A simple hook to make using it easier
// export const useAuth = () => useContext(AuthContext);
// "use client";

// import { createContext, useContext, useEffect, useState } from "react";

// export interface UserProfile {
//   userId: string;
//   email: string;
//   roles: string[]; 
//   firstName: string;
//   lastName: string;
//   university: string;
//   programme: string;
//   graduationYear: number;
//   githubLink: string;
//   linkedInLink: string;
//   exists: boolean;
// }

// // 2. Define the shape of the Context
// interface AuthContextType {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   user: UserProfile | null; // Add the user object here
// }

// // 3. Update the initial Context state
// const AuthContext = createContext<AuthContextType>({
//   isAuthenticated: false,
//   isLoading: true,
//   user: null,
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // 4. Create state to hold the user data
//   const [user, setUser] = useState<UserProfile | null>(null);

//   async function checkStatus() {
//     try {
//       const response = await fetch("/api/profile/me");

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Auth Status Data:", data);

//         // Assuming your backend returns `authenticate: true` alongside the profile,
//         // OR if returning the profile directly, you can check if `data.userId` exists.
//         // Let's assume the endpoint returns the profile data you provided:
//         setIsAuthenticated(true);
//         setUser(data); // Save the profile data into state
//       } else {
//         setIsAuthenticated(false);
//         setUser(null);
//       }
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       setIsAuthenticated(false);
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     checkStatus();
//   }, []);

//   return (
//     // 5. Pass the user object down through the Provider
//     <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // A simple hook to make using it easier
// export const useAuth = () => useContext(AuthContext);

// "use client";

// import { createContext, useContext, useEffect, useState, useMemo } from "react";
// import { useRouter } from "next/navigation";

// export interface UserProfile {
//   userId: string;
//   email: string;
//   roles: string[];
//   firstName: string;
//   lastName: string;
//   university: string;
//   programme: string;
//   graduationYear: number;
//   githubLink: string;
//   linkedInLink: string;
//   exists: boolean;
// }

// // Define the shape of the Context
// interface AuthContextType {
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   user: UserProfile | null;
//   logout: () => Promise<void>;
// }

// // Update the initial Context state
// const AuthContext = createContext<AuthContextType>({
//   isAuthenticated: false,
//   isLoading: true,
//   user: null,
//   logout: async () => {},
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState<UserProfile | null>(null);
// const router = useRouter();





//   useEffect(() => {
//     async function checkStatus() {
//       try {
//         const response = await fetch("/api/profile/me");
//         if (response.ok) {
//           const data = await response.json();
//           setIsAuthenticated(true);
//           setUser(data);
//         } else {
//           setIsAuthenticated(false);
//           setUser(null);
//         }
//       } catch (error) {
//         console.error("Auth check failed:", error);
//         setIsAuthenticated(false);
//         setUser(null);
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     checkStatus();
//   }, []);

//   const logout = async () => {
//     try {
//       const response = await fetch("/api/auth/logout", {
//         method: "GET",
//         credentials: "include",
//       });

//       if (response.ok) {
//         // 3. Update the global state immediately!
//         setIsAuthenticated(false);
//         setUser(null);
//         router.push("/");
//       } else {
//         console.error("Logout failed with status:", response.status);
//       }
//     } catch (error) {
//       console.error("Failed to reach the logout endpoint:", error);
//     }
//   };


//   const contextValue = useMemo(
//     () => ({
//       isAuthenticated,
//       isLoading,
//       user,
//       logout,
//     }),
//     [isAuthenticated, isLoading, user],
//   );

//   return (
//     <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
//   );
// }

// // eslint-disable-next-line react-refresh/only-export-components
// export const useAuth = () => useContext(AuthContext);

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

export interface UserProfile {
  userId: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  university: string;
  programme: string;
  graduationYear: number;
  githubLink: string;
  linkedInLink: string;
  exists: boolean;
}

// Define the shape of the Context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  logout: () => Promise<void>;
}

// Update the initial Context state
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/profile/me");
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        router.push("/");
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Failed to reach the logout endpoint:", error);
    }
  }, [router]); 

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      logout,
    }),
    [isAuthenticated, isLoading, user, logout], // Added logout to the dependency array
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

