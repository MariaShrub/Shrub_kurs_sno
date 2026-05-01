import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface Props {
  firstName: string;
  kind: "join" | "conference";
  eventTitle?: string;
  topic?: string;
}

export function ApplicationReceivedEmail({
  firstName,
  kind,
  eventTitle,
  topic,
}: Props) {
  const subject =
    kind === "join"
      ? "Мы получили вашу заявку в СНО"
      : `Мы получили вашу заявку на «${eventTitle ?? "конференцию"}»`;
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
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
          <Heading>Заявка получена</Heading>
          <Text>Здравствуйте, {firstName}!</Text>
          <Text>
            {kind === "join"
              ? "Мы получили вашу заявку на вступление в Студенческое Научное Общество. Администратор рассмотрит её в ближайшие дни — на этот же email придёт письмо с решением."
              : `Мы получили вашу заявку на конференцию «${eventTitle ?? ""}»${topic ? ` с темой «${topic}»` : ""}. После рассмотрения вы получите письмо с решением.`}
          </Text>
          <Text style={{ marginTop: 24, color: "#6b7280", fontSize: 12 }}>
            Это автоматическое сообщение от СНО. Отвечать на него не нужно.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ApplicationReceivedEmail;
