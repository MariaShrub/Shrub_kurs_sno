import { MembersBrowser } from "@/components/members/MembersBrowser";
import { PageHero } from "@/components/ui/page-hero";

export const metadata = {
  title: "Состав СНО ОмГУПС",
};

export default function MembersPage() {
  return (
    <div>
      <PageHero
        badge="Команда"
        title={
          <>
            Состав <span className="text-gradient">СНО ОмГУПС</span>
          </>
        }
        subtitle="Все члены студенческого научного общества. Используйте фильтры, чтобы найти участников по институту и курсу."
      />
      <div className="container py-12">
        <MembersBrowser />
      </div>
    </div>
  );
}
