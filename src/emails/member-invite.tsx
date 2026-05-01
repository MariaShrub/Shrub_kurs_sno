import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  firstName: string;
  email: string;
  password: string;
  loginUrl: string;
}

export function MemberInviteEmail({
  firstName,
  email,
  password,
  loginUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Добро пожаловать в СНО — данные для входа в личный кабинет</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", background: "#f6f6f6" }}>
        <Container
          style={{
            background: "#ffffff",
            padding: "32px",
            margin: "32px auto",
            maxWidth: 560,
            borderRadius: 8,
          }}
        >
          <Heading>Добро пожаловать в СНО, {firstName}!</Heading>
          <Text>
            Ваша заявка одобрена. Мы создали для вас аккаунт, чтобы вы могли
            заходить в личный кабинет: следить за своими заявками на конференции
            и редактировать профиль.
          </Text>
          <Section
            style={{
              marginTop: 16,
              background: "#f3f4f6",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Логин
            </Text>
            <Text style={{ margin: "4px 0 12px", fontWeight: 600 }}>{email}</Text>
            <Text style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Временный пароль
            </Text>
            <Text
              style={{
                margin: "4px 0 0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                background: "#fff",
                padding: "8px 12px",
                borderRadius: 6,
                display: "inline-block",
                fontWeight: 600,
              }}
            >
              {password}
            </Text>
          </Section>
          <Text style={{ marginTop: 16 }}>
            Войти можно по адресу:{" "}
            <a href={loginUrl} style={{ color: "#5144B0" }}>
              {loginUrl}
            </a>
          </Text>
          <Hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />
          <Text style={{ color: "#6b7280", fontSize: 13 }}>
            Рекомендуем сменить пароль после первого входа в разделе
            «Безопасность» личного кабинета.
          </Text>
          <Text style={{ marginTop: 24, color: "#9ca3af", fontSize: 12 }}>
            Это автоматическое сообщение от СНО.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default MemberInviteEmail;
