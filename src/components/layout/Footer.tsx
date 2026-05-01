import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 isolate overflow-hidden">
      <div className="absolute inset-0 gradient-brand opacity-95 -z-10" />
      <div className="absolute inset-0 bg-noise opacity-60 -z-10" />
      <div className="container relative py-14 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-semibold text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <GraduationCap className="h-5 w-5" />
              </span>
              СНО ОмГУПС
            </div>
            <p className="mt-3 text-sm text-white/80 max-w-sm">
              Студенческое научное общество. Объединяем тех, кто хочет
              заниматься наукой и развиваться вместе.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Навигация
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { href: "/members", label: "Состав" },
                { href: "/events", label: "Мероприятия" },
                { href: "/news", label: "Новости" },
                { href: "/gallery", label: "Галерея" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:underline underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Действия
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/apply" className="hover:underline underline-offset-4">
                  Подать заявку на вступление
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:underline underline-offset-4"
                >
                  Войти в личный кабинет
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col md:flex-row justify-between gap-2 text-sm text-white/70">
          <span>© {new Date().getFullYear()} Студенческое научное общество Омского государственного университета путей сообщения</span>
          <span>Сделано с любовью к науке</span>
        </div>
      </div>
    </footer>
  );
}
