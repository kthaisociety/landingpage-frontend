import { NextResponse as NextResponseImpl } from "next/server";
import type { ProfileData } from "@/types/profile";

const mockUsersDatabase: Record<string, ProfileData> = {
  "alex.chen@example.com": {
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    firstName: "Alexandra",
    lastName: "Chen",
    title: "Senior AI Researcher", 
    location: "San Francisco, CA",
    email: "alex.chen@example.com",
    phone: "+1 555 019 8372",
    joinDate: "March 2021",
    bio: "Senior AI Researcher with 8+ years of experience in neural networks and generative models.",
    twitter: "@alexchen",
    linkedin: "linkedin.com/in/alexchen",
    github: "github.com/alexchen",
    website: "alexchen.design",
    notifyEmail: true,
    notifyPush: true,
    notifyMarketing: false,
    notifyUpdates: true,
    visibility: "Public",
    showEmail: false,
    showLocation: true,
  },
  "dev@example.com": {
    profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&crop=face",
    firstName: "Developer",
    lastName: "User",
    title: "Fullstack ML Engineer",
    location: "Stockholm, Sweden",
    email: "dev@example.com",
    phone: "+46 70 123 45 67",
    joinDate: "January 2023",
    bio: "Building awesome Next.js applications and integrating LLMs.",
    twitter: "",
    linkedin: "",
    github: "github.com/devuser",
    website: "devuser.io",
    notifyEmail: true,
    notifyPush: false,
    notifyMarketing: false,
    notifyUpdates: true,
    visibility: "Private",
    showEmail: false,
    showLocation: false,
  }
};

// For this mock, we assume the user is logged in as Alex.
const CURRENT_SESSION_EMAIL = "alex.chen@example.com";

export async function GET() {
  const userProfile = mockUsersDatabase[CURRENT_SESSION_EMAIL];
  
  if (!userProfile) {
    return NextResponseImpl.json({ error: "Profile not found" }, { status: 404 });
  }

  await new Promise(resolve => {
    setTimeout(resolve, 800);
  });
  return NextResponseImpl.json(userProfile);
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    const existingProfile = mockUsersDatabase[CURRENT_SESSION_EMAIL];

    if (!existingProfile) {
      return NextResponseImpl.json({ error: "Profile not found" }, { status: 404 });
    }

    mockUsersDatabase[CURRENT_SESSION_EMAIL] = { ...existingProfile, ...updates };
    return NextResponseImpl.json(mockUsersDatabase[CURRENT_SESSION_EMAIL]);
  } catch {
    return NextResponseImpl.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

export async function DELETE() {
  delete mockUsersDatabase[CURRENT_SESSION_EMAIL];
  return NextResponseImpl.json({ success: true });
}