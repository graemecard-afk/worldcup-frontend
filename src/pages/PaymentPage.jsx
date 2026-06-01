import React from "react";

export default function PaymentPage() {
  return (
    <div
      style={{
        padding: "24px 32px",
        maxWidth: "1100px",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ marginTop: 0, marginBottom: 32, fontSize: "2.2rem" }}>
        Payment Instructions
      </h1>

      <p
  style={{
    fontWeight: 700,
    fontSize: "1.05rem",
    padding: "12px 16px",
    border: "1px solid rgba(34, 197, 94, 0.5)",
    borderRadius: 12,
    background: "rgba(34, 197, 94, 0.08)",
  }}
>
      Predictions can be entered before payment is received. However, from three
    days before the start of the tournament, unpaid entrants will be unable to
    save new or updated predictions until payment has been confirmed.
</p>

     <p>
  Paying by PayPal is the preferred method and instructions can be found at:
</p>

<p>
  <a
    href="https://graemegardengarbage.blogspot.com/2026/05/world-cup-payment-instructions.html"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "#38bdf8",
      fontWeight: 700,
      textDecoration: "none",
    }}
  >
    SAHD - Stay at home Dad: World Cup 2026 Payment Instructions
  </a>
</p>

      <h2 style={{ marginTop: 32 }}>Entrance fee</h2>

      <p>
                 <strong>USD$25.00</strong>
          <br />
          if paying with PayPal from within the USA
      </p>

      <p>
        <strong>USD$26.75</strong>
        <br />
        if paying with PayPal from outside the USA
        <br />
        <span style={{ opacity: 0.85 }}>
          USD$25 entry fee + 5% PayPal fee + USD$0.50 transaction fee
        </span>
      </p>

      <p>
        Please make sure the payment is sent in <strong>US dollars</strong>.
        Also please ensure that any PayPal fees are paid by the sender. This is
        important so that the full entry fee is received into the prize pool.
      </p>

      <h2 style={{ marginTop: 32 }}>NZ bank transfer</h2>

      <p>
        <strong>NZD$43.00</strong>
        <br />
        can be paid directly into my bank account:
        <br />
        <strong>06-0103-0325692-05</strong>
      </p>

      <p>Or you can come and find me and hand the cash over.</p>

      <p style={{ marginTop: 32 }}>
        <strong>All fees must be paid by 12 noon on 10 June 2026.</strong>
      </p>

      <p
  style={{
    fontWeight: 700,
    fontSize: "1.05rem",
    padding: "12px 16px",
    border: "1px solid rgba(34, 197, 94, 0.5)",
    borderRadius: 12,
    background: "rgba(34, 197, 94, 0.08)",
  }}
>
      Predictions can be entered before payment is received. However, from three
    days before the start of the tournament, unpaid entrants will be unable to
    save new or updated predictions until payment has been confirmed.
</p>
    </div>
  );
}