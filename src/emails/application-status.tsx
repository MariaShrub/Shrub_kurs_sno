import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  firstName: string;
  status: "approved" | "rejected" | "pending";
  note?: string | null;
}

export function JoinApplicationEmail({ firstName, status, note }: Props) {
  const approved = status === "approved";
  const subject = approved
    ? "Ваша заявка в СНО одобрена"
    : "Решение по вашей заявке в СНО";
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
          <Heading>{approved ? "Поздравляем!" : "Уведомление"}</Heading>
          <Text>
            Здравствуйте, {firstName}! {""}
            {approved
              ? "Ваша заявка на вступление в Студенческое Научное Общество одобрена. Мы свяжемся с вами в ближайшее время."
              : "К сожалению, ваша заявка на вступление в СНО была отклонена."}
          </Text>
          {note ? (
            <Section
              style={{
                marginTop: 16,
                background: "#f3f4f6",
                padding: 12,
                borderRadius: 6,
              }}
            >
              <Text style={{ margin: 0 }}>
                <strong>Комментарий администратора:</strong>
              </Text>
              <Text style={{ margin: "8px 0 0" }}>{note}</Text>
            </Section>
          ) : null}
          <Text style={{ marginTop: 24, color: "#6b7280", fontSize: 12 }}>
            Это автоматическое сообщение от СНО.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default JoinApplicationEmail;
