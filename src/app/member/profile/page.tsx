"use client";

import { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import { User, Link2, Shield, Bell, MapPin, Calendar, Briefcase, Mail, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/lib/model/apis/internal-apis";

interface ProfileFormState {
  firstName: string;
  lastName: string;
  title: string; 
  email: string;
  phone: string;
  location: string;
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

export default function ProfilePage() {
  const { data: profileData, isLoading: isFetching, error: fetchError } = useGetProfileQuery();
  const [updateProfileMutation] = useUpdateProfileMutation();

  const [inputState, setInputState] = useState<ProfileFormState>({
    firstName: "", lastName: "", title: "", email: "", phone: "", location: "", bio: "",
    twitter: "", linkedin: "", github: "", website: "",
    notifyEmail: true, notifyPush: true, notifyMarketing: false, notifyUpdates: true,
    visibility: "Public", showEmail: false, showLocation: true,
  });

  const [requestState, setRequestState] = useState({ isUpdating: false });
  const [uiState, setUiState] = useState({ 
    errorMessage: "", 
    successMessage: "", 
    profileTextMask: undefined as string | undefined 
  });

  useEffect(() => {
    if (profileData) {
      setInputState((prev) => ({ ...prev, ...profileData }));
    }
  }, [profileData]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("AI_ORG", canvas.width / 2, canvas.height / 2);
    
    requestAnimationFrame(() => setUiState((prev) => ({ ...prev, profileTextMask: canvas.toDataURL("image/png") })));
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setInputState((prev) => ({ ...prev, [id]: value }));
  };

  const createSwitchHandler = (key: keyof ProfileFormState) => (checked: boolean) => {
    setInputState((prev) => ({ ...prev, [key]: checked }));
  };

  const handleUpdateSubmit = async () => {
    setRequestState({ isUpdating: true });
    setUiState((prev) => ({ ...prev, errorMessage: "", successMessage: "" }));
    try {
      await updateProfileMutation(inputState).unwrap();
      setUiState((prev) => ({ ...prev, successMessage: "Profile updated successfully." }));
      
      setTimeout(() => {
        setUiState((prev) => ({ ...prev, successMessage: "" }));
      }, 3500);
    } catch (error) {
      setUiState((prev) => ({ ...prev, errorMessage: "Failed to save changes." }));
    } finally {
      setRequestState({ isUpdating: false });
    }
  };

  const renderFeedbackMessage = () => {
    if (!uiState.successMessage && !uiState.errorMessage) return null;
    return (
      <div className="mb-6 animate-fade-in">
        {uiState.successMessage && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-700 rounded-lg flex items-center gap-3 text-sm font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-600">✓</span>
            {uiState.successMessage}
          </div>
        )}
        {uiState.errorMessage && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-lg flex items-center gap-3 text-sm font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-600">⚠</span>
            {uiState.errorMessage}
          </div>
        )}
      </div>
    );
  };

  const renderHeroSection = () => (
    <section className="relative text-secondary-black pt-54 pb-24 overflow-hidden">
      <div className="absolute inset-0">
        <AsciiGrid color="rgba(0, 0, 0, 0.2)" cellSize={12} logoSrc={uiState.profileTextMask} logoPosition="center" logoScale={0.9} enableDripping={false} className="w-full h-full" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
      </div>
    </section>
  );

  const renderProfileCard = () => {
    const firstName = profileData?.firstName || "Student";
    const lastName = profileData?.lastName || "Member";
    const fullName = `${firstName} ${lastName}`.trim();
    const roleTitle = profileData?.title || "Member";
    
    return (
      <div className="relative mt-20 animate-fade-in">
        <div className="absolute -top-16 left-8 z-20">
          <div className="relative">
            <div className="absolute inset-0 rounded-full profile-border-gradient blur-sm scale-110" />
            <div className="relative w-32 h-32 rounded-full p-1 profile-border-gradient">
              <div className="w-full h-full rounded-full overflow-hidden bg-card p-0.5">
                <Image src={profileData?.profileImage || ""} alt={fullName} width={128} height={128} className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full border border-primary animate-pulse-glow pointer-events-none" />
          </div>
        </div>

        <div className="relative bg-card rounded-2xl profile-card-shadow overflow-hidden">
          <div className="absolute top-0 left-0 h-[2px] w-[30px] bg-gradient-to-r from-primary to-primary/70" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/70 to-primary" />
          <div className="absolute top-0 left-10 h-20 bg-card rounded-b-full" />
          <div className="absolute top-0 left-10 h-20 border-b-2 border-primary rounded-b-full" />
          
          <div className="absolute top-6 right-6 z-10">
            <Button variant="outline" className="flex items-center gap-2 text-sm border-primary text-primary hover:bg-primary/10 transition-colors">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Public Profile</span>
            </Button>
          </div>

          <div className="pt-20 pb-8 px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">{fullName}</h1>
              <p className="text-lg text-primary font-medium flex items-center gap-2"><Briefcase className="w-4 h-4" />{roleTitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-primary" /><span className="text-sm">{profileData?.location}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4 text-primary" /><span className="text-sm">{profileData?.email}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 text-primary" /><span className="text-sm">Joined {profileData?.joinDate}</span></div>
            </div>
            <div className="border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">About</h2>
              <p className="text-foreground leading-relaxed">{profileData?.bio}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalTab = () => (
    <TabsContent value="personal" className="mt-0 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={inputState.firstName} onChange={handleInputChange} /></div>
        <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={inputState.lastName} onChange={handleInputChange} /></div>
        <div className="space-y-2"><Label htmlFor="title">Primary Role</Label><Input id="title" value={inputState.title} onChange={handleInputChange} /></div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={inputState.email} onChange={handleInputChange} /></div>
        <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={inputState.phone} onChange={handleInputChange} /></div>
        <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={inputState.location} onChange={handleInputChange} /></div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" rows={4} value={inputState.bio} onChange={handleInputChange} /></div>
      </div>
      <div className="flex justify-end pt-4"><Button onClick={handleUpdateSubmit} disabled={requestState.isUpdating}>Save Changes</Button></div>
    </TabsContent>
  );

  const renderSocialTab = () => (
    <TabsContent value="social" className="mt-0 space-y-6">
      <div className="space-y-6">
        <div className="space-y-2"><Label htmlFor="twitter">Twitter</Label><Input id="twitter" value={inputState.twitter} onChange={handleInputChange} placeholder="@username" /></div>
        <div className="space-y-2"><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={inputState.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/username" /></div>
        <div className="space-y-2"><Label htmlFor="github">GitHub</Label><Input id="github" value={inputState.github} onChange={handleInputChange} placeholder="github.com/username" /></div>
        <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={inputState.website} onChange={handleInputChange} placeholder="yourwebsite.com" /></div>
      </div>
      <div className="flex justify-end pt-4"><Button onClick={handleUpdateSubmit} disabled={requestState.isUpdating}>Save Changes</Button></div>
    </TabsContent>
  );

  const renderPrivacyTab = () => (
    <TabsContent value="privacy" className="mt-0 space-y-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div><h3 className="font-medium text-foreground">Profile Visibility</h3><p className="text-sm text-muted-foreground">Control who can see your profile</p></div>
          <select id="visibility" value={inputState.visibility} onChange={handleInputChange} className="bg-card border border-input rounded-md px-3 py-2 text-sm"><option>Public</option><option>Private</option></select>
        </div>
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div><h3 className="font-medium text-foreground">Show Email</h3><p className="text-sm text-muted-foreground">Display email on your profile</p></div>
          <Switch checked={inputState.showEmail} onCheckedChange={createSwitchHandler("showEmail")} />
        </div>
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div><h3 className="font-medium text-foreground">Show Location</h3><p className="text-sm text-muted-foreground">Display location on your profile</p></div>
          <Switch checked={inputState.showLocation} onCheckedChange={createSwitchHandler("showLocation")} />
        </div>
      </div>
      <div className="flex justify-end pt-4"><Button onClick={handleUpdateSubmit} disabled={requestState.isUpdating}>Save Changes</Button></div>
    </TabsContent>
  );

  const renderNotificationsTab = () => (
    <TabsContent value="notifications" className="mt-0 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div><h3 className="font-medium text-foreground">Email Notifications</h3><p className="text-sm text-muted-foreground">Receive notifications via email</p></div>
          <Switch checked={inputState.notifyEmail} onCheckedChange={createSwitchHandler("notifyEmail")} />
        </div>
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div><h3 className="font-medium text-foreground">Push Notifications</h3><p className="text-sm text-muted-foreground">Receive push notifications</p></div>
          <Switch checked={inputState.notifyPush} onCheckedChange={createSwitchHandler("notifyPush")} />
        </div>
      </div>
      <div className="flex justify-end pt-4"><Button onClick={handleUpdateSubmit} disabled={requestState.isUpdating}>Save Changes</Button></div>
    </TabsContent>
  );

  const renderTabsSection = () => (
    <div className="mt-8 bg-card rounded-2xl profile-card-shadow overflow-hidden animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <Tabs defaultValue="personal" className="w-full">
        <div className="border-b border-border">
          <TabsList className="w-full h-auto p-0 bg-transparent rounded-none flex overflow-x-auto">
            <TabsTrigger value="personal" className="flex-1 flex items-center min-w-[120px] py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium transition-all gap-2"><User className="w-4 h-4" /><span className="hidden sm:inline">Personal Info</span></TabsTrigger>
            <TabsTrigger value="social" className="flex-1 flex items-center min-w-[120px] py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium transition-all gap-2"><Link2 className="w-4 h-4" /><span className="hidden sm:inline">Social Links</span></TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1 flex items-center min-w-[120px] py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium transition-all gap-2"><Shield className="w-4 h-4" /><span className="hidden sm:inline">Privacy</span></TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 flex items-center min-w-[120px] py-4 px-4 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium transition-all gap-2"><Bell className="w-4 h-4" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
          </TabsList>
        </div>
        <div className="p-6 sm:p-8">
          {renderFeedbackMessage()}
          {renderPersonalTab()}
          {renderSocialTab()}
          {renderPrivacyTab()}
          {renderNotificationsTab()}
        </div>
      </Tabs>
    </div>
  );

  if (isFetching) return <div className="flex items-center justify-center min-h-screen"><p>Loading profile...</p></div>;
  if (fetchError || !profileData) return <div className="flex items-center justify-center min-h-screen text-red-500"><p>Unable to load profile data.</p></div>;

  return (
    <div className="min-w-screen bg-white">
      {renderHeroSection()}
      <section className="relative pb-16">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {renderProfileCard()}
          {renderTabsSection()}
        </div>
      </section>
    </div>
  );
}