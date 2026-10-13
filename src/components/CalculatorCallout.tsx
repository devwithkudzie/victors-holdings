import Link from "next/link";

/** "Have a plan?" prompt pointing to the brick calculator */
export function CalculatorCallout() {
  return (
    <Link href="/brick-calculator" className="calc-callout">
      <span className="calc-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        <b>Have a house plan?</b>
        <small>Upload it and get your brick count and a quotation in about a minute.</small>
      </span>
      <em aria-hidden>→</em>
    </Link>
  );
}
