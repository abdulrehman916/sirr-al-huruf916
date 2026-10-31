/**
 * Direct UPI payment to the owner's bank account. The browser only builds the
 * UPI payment link and records the customer's UPI reference (UTR); access is
 * granted when the owner approves it in the Owner Panel.
 */
import { supabase } from '@/api/platformClient';

/** Standard UPI deep link understood by GPay, PhonePe, Paytm and bank apps. */
export function buildUpiLink({ upiId, payeeName, amountMinor, note }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: (payeeName || 'Sirr al-Huruf').slice(0, 50),
    am: (Number(amountMinor) / 100).toFixed(2),
    cu: 'INR',
    tn: (note || 'Sirr al-Huruf').slice(0, 60),
  });
  return `upi://pay?${params.toString().replace(/\+/g, '%20')}`;
}

/** UPI references (UTR / RRN) are 12 digits; spaces are allowed while typing. */
export function normalizeUtr(value) {
  const digits = String(value || '').replace(/\s/g, '');
  return /^[0-9]{12}$/.test(digits) ? digits : null;
}

let optionsPromise = null;
/** Which payment methods are switched on. Cached for the page session. */
export function getPaymentOptions({ refresh = false } = {}) {
  if (optionsPromise && !refresh) return optionsPromise;
  optionsPromise = (async () => {
    const [upi, razorpay] = await Promise.all([
      supabase ? supabase.rpc('payment_options').then(({ data }) => data || {}, () => ({})) : {},
      fetch('/api/payments/status').then(r => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    return {
      upi: upi?.upi_enabled ? { upiId: upi.upi_id, payeeName: upi.payee_name } : null,
      razorpay: Boolean(razorpay?.ready),
    };
  })();
  return optionsPromise;
}

const UPI_ERRORS = {
  INVALID_UTR: 'UPI reference നമ്പർ 12 അക്കം ആയിരിക്കണം.',
  UTR_ALREADY_USED: 'ഈ UPI reference നമ്പർ ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്.',
  TOO_MANY_PENDING: 'നിങ്ങളുടെ 5 payments approval കാത്തിരിക്കുന്നു. Owner approve ചെയ്ത ശേഷം വീണ്ടും ശ്രമിക്കുക.',
  NOT_FOR_SALE: 'ഈ page ഇപ്പോൾ വിൽപ്പനയ്ക്കില്ല.',
  ALREADY_LIFETIME: 'ഈ page നിങ്ങൾക്ക് ഇതിനകം lifetime ആയി തുറന്നിട്ടുണ്ട്.',
  UPI_DISABLED: 'UPI payment ഇപ്പോൾ ലഭ്യമല്ല.',
  EMAIL_NOT_VERIFIED: 'ആദ്യം നിങ്ങളുടെ email confirm ചെയ്യുക.',
  SIGN_IN_REQUIRED: 'ആദ്യം email ഉപയോഗിച്ച് login ചെയ്യുക.',
};

export function upiErrorMessage(error) {
  const text = String(error?.message || error || '');
  const code = Object.keys(UPI_ERRORS).find(key => text.includes(key));
  return code ? UPI_ERRORS[code] : 'Payment വിവരം അയക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.';
}

export async function submitUpiPayment(resourceId, utr) {
  const clean = normalizeUtr(utr);
  if (!clean) throw new Error(UPI_ERRORS.INVALID_UTR);
  const { data, error } = await supabase.rpc('upi_submit_payment', { p_resource_id: resourceId, p_utr: clean });
  if (error) throw new Error(upiErrorMessage(error));
  return data;
}
