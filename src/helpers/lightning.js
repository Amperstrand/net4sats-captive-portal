import { getTollgateBaseUrl } from "./tollgate";

const invoiceRequestError = (i18n, message) => ({
  status: 0,
  code: "LN003",
  label: i18n("LN003_label"),
  message: message || i18n("LN003_message"),
});

const invoiceStatusError = (i18n, message) => ({
  status: 0,
  code: "LN004",
  label: i18n("LN004_label"),
  message: message || i18n("LN004_message"),
});

// request an invoice for a lightning payment
export const requestInvoice = async (amount, mintUrl, i18n) => {
  if (import.meta.env.VITE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      status: 1,
      quote: "mock_quote_" + Date.now(),
      invoice: "lnbc" + amount + "1pnxyxyx5pp5xpxyz",
      mintUrl,
      amount,
      expiry: 3600,
      state: "pending",
    };
  }

  try {
    const baseUrl = getTollgateBaseUrl();
    const response = await fetch(`${baseUrl}/ln-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, mint_url: mintUrl }),
    });

    const payload = await response.json();

    if (!response.ok || !payload.status) {
      console.error("invoice request failed:", payload);
      return invoiceRequestError(i18n, payload?.error);
    }

    return {
      status: 1,
      quote: payload.quote,
      invoice: payload.invoice,
      mintUrl: payload.mint_url,
      amount: payload.amount,
      expiry: payload.expiry,
      state: payload.state,
    };
  } catch (error) {
    console.error("error requesting invoice:", error);
    return invoiceRequestError(i18n);
  }
};

let mockPollCount = 0;

export const getInvoiceStatus = async (quote, i18n) => {
  if (import.meta.env.VITE_MOCK) {
    mockPollCount++;
    const granted = mockPollCount >= 2;
    if (granted) mockPollCount = 0;
    return {
      status: 1,
      quote,
      mintUrl: "https://mint.domain.net",
      amount: 210,
      state: granted ? "paid" : "pending",
      accessGranted: granted,
    };
  }

  try {
    const baseUrl = getTollgateBaseUrl();
    const response = await fetch(`${baseUrl}/ln-invoice?quote=${encodeURIComponent(quote)}`);
    const payload = await response.json();

    if (!response.ok || !payload.status) {
      console.error("invoice status request failed:", payload);
      return invoiceStatusError(i18n, payload?.error);
    }

    return {
      status: 1,
      quote: payload.quote,
      mintUrl: payload.mint_url,
      amount: payload.amount,
      state: payload.state,
      accessGranted: payload.access_granted,
      allotment: payload.allotment,
      metric: payload.metric,
    };
  } catch (error) {
    console.error("error checking invoice status:", error);
    return invoiceStatusError(i18n);
  }
};
