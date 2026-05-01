"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditor } from "./ProfileEditor";
import { ConferenceApplicationsList } from "./ConferenceApplicationsList";
import { PasswordChange } from "./PasswordChange";
import { LayoutDashboard, Mic, ShieldCheck } from "lucide-react";

export function CabinetTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
        <TabsTrigger value="profile" className="flex items-center gap-1.5">
          <LayoutDashboard className="h-4 w-4" />
          Профиль
        </TabsTrigger>
        <TabsTrigger value="conferences" className="flex items-center gap-1.5">
          <Mic className="h-4 w-4" />
          Заявки
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" />
          Безопасность
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileEditor />
      </TabsContent>
      <TabsContent value="conferences">
        <ConferenceApplicationsList />
      </TabsContent>
      <TabsContent value="security">
        <PasswordChange />
      </TabsContent>
    </Tabs>
  );
}
