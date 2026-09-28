import { WhatsAppButton } from "./WhatsAppButton";

type Props = {
  title?: string;
  body?: string;
  message?: string;
  source: string;
};

export function CtaBand({
  title = "Planning your next build?",
  body = "Send Victors Holdings your material requirements and get the conversation started.",
  message = "Hi Victors, I'd like a quote for building materials.",
  source,
}: Props) {
  return (
    <section className="cta">
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <WhatsAppButton message={message} source={source} className="cta-btn">
        Chat on WhatsApp →
      </WhatsAppButton>
    </section>
  );
}
