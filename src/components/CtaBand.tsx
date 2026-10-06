import { QuoteButton } from "./QuoteSheet";

type Props = {
  title?: string;
  body?: string;
  source: string;
  /** Product category to preselect in the quote form */
  category?: string;
};

export function CtaBand({
  title = "Planning your next build?",
  body = "Send Victors Holdings your material requirements and get the conversation started.",
  source,
  category,
}: Props) {
  return (
    <section className="cta">
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <QuoteButton source={source} category={category} className="cta-btn" label="Get a quote →" />
    </section>
  );
}
