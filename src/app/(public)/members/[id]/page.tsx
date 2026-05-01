import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/trpc/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlobBackground } from "@/components/ui/blob-background";
import { ArrowLeft, Mail, Send } from "lucide-react";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await api.members.byId(id);
  if (!member) notFound();

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[420px] -z-10 overflow-hidden">
        <div className="absolute inset-0 gradient-brand-soft" />
        <BlobBackground variant="soft" />
      </div>
      <div className="container py-8 max-w-5xl">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/members">
            <ArrowLeft className="h-4 w-4" /> К списку
          </Link>
        </Button>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-glow border border-white/60 gradient-brand">
              {member.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={member.photoUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl text-white font-bold">
                  {member.firstName[0]}
                  {member.lastName[0]}
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 space-y-5">
            <div>
              <Badge className="rounded-full">{member.position}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mt-3 leading-tight">
                {member.lastName} <span className="text-gradient">{member.firstName}</span>
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {member.institute} · {member.course} курс
              </p>
            </div>
            {member.bio && (
              <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-soft">
                <h2 className="font-semibold mb-2">О себе</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {member.bio}
                </p>
              </div>
            )}
            {member.achievements && (
              <div className="rounded-3xl border border-border/50 bg-white p-6 shadow-soft">
                <h2 className="font-semibold mb-2">Достижения</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {member.achievements}
                </p>
              </div>
            )}
            {member.socialLinks && (
              <div className="flex flex-wrap gap-2">
                {member.socialLinks.email && (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <a href={`mailto:${member.socialLinks.email}`}>
                      <Mail className="h-4 w-4" /> {member.socialLinks.email}
                    </a>
                  </Button>
                )}
                {member.socialLinks.telegram && (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <a
                      href={`https://t.me/${member.socialLinks.telegram.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Send className="h-4 w-4" /> {member.socialLinks.telegram}
                    </a>
                  </Button>
                )}
                {member.socialLinks.vk && (
                  <Button asChild variant="outline" size="sm" className="rounded-full">
                    <a
                      href={`https://vk.com/${member.socialLinks.vk}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      VK: {member.socialLinks.vk}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
