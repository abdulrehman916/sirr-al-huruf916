/**
 * Shared status configuration for AccessRequests.
 * Used by MyRequests (user) and AdminAccessRequests (admin).
 */
export const REQUEST_STATUSES = {
  PENDING:            { label: "Pending",              color: "#eab308" },
  AWAITING_PAYMENT:   { label: "Waiting for Payment",   color: "#f97316" },
  PAYMENT_CONFIRMED:  { label: "Payment Received",      color: "#22c55e" },
  INFO_REQUESTED:     { label: "Info Requested",        color: "#a855f7" },
  CODE_UPDATED:       { label: "Code Updated",          color: "#3b82f6" },
  APPROVED:           { label: "Approved",              color: "#22c55e" },
  REJECTED:           { label: "Rejected",              color: "#ef4444" },
  CLOSED:             { label: "Closed",                color: "#6b7280" },
};

export const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "AWAITING_PAYMENT", label: "Waiting for Payment" },
  { value: "PAYMENT_CONFIRMED", label: "Payment Received" },
  { value: "INFO_REQUESTED", label: "Info Requested" },
  { value: "CODE_UPDATED", label: "Code Updated" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CLOSED", label: "Closed" },
];

export function getStatusConfig(status) {
  return REQUEST_STATUSES[status] || REQUEST_STATUSES.PENDING;
}