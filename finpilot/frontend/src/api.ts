export const BACKEND_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? "http://localhost:8090"
  : (typeof window !== 'undefined' ? window.location.origin : "http://localhost:8090");

export const API_BASE = `${BACKEND_URL}/api/v1`;
export const AGENT_SERVICE_URL = "http://localhost:8100";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("finpilot_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetchApi("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMe: () => fetchApi("/auth/me"),
  getApiKeys: () => fetchApi("/auth/api-keys"),
  createApiKey: (name: string) =>
    fetchApi("/auth/api-keys", { method: "POST", body: JSON.stringify({ name, permissions: ["read", "write", "agent"] }) }),

  // Dashboard & Cash Flow
  getDashboardSummary: () => fetchApi("/dashboard/summary"),
  getCashFlowMetrics: () => fetchApi("/cashflow/metrics"),
  getCashFlowForecast: (days = 60) => fetchApi(`/cashflow/forecast?days=${days}`),
  getCashFlowHistory: (limit = 30) => fetchApi(`/cashflow/history?limit=${limit}`),

  // Invoices & Clients
  getInvoices: (status?: string) => fetchApi(`/invoices${status ? `?status=${status}` : ""}`),
  createInvoice: (data: any) => fetchApi("/invoices", { method: "POST", body: JSON.stringify(data) }),
  markInvoicePaid: (id: string) => fetchApi(`/invoices/${id}/mark-paid`, { method: "POST", body: JSON.stringify({}) }),
  sendInvoiceReminder: (id: string, tone = "polite") =>
    fetchApi(`/invoices/${id}/reminder?tone=${tone}`, { method: "POST" }),
  getClients: () => fetchApi("/clients"),
  createClient: (data: any) => fetchApi("/clients", { method: "POST", body: JSON.stringify(data) }),

  // Expenses & Reports
  getExpenses: (category?: string) => fetchApi(`/expenses${category ? `?category=${category}` : ""}`),
  getExpensesSummary: () => fetchApi("/expenses/summary"),
  createExpense: (data: any) => fetchApi("/expenses", { method: "POST", body: JSON.stringify(data) }),
  getPnlReport: () => fetchApi("/reports/pnl"),
  getHealthReport: () => fetchApi("/reports/health"),
  getTaxSummary: () => fetchApi("/reports/tax-summary"),

  // Financing
  getFinancingProducts: () => fetchApi("/financing/products"),
  matchFinancing: (amount_needed: number, purpose = "working_capital") =>
    fetchApi("/financing/match", { method: "POST", body: JSON.stringify({ amount_needed, purpose }) }),
  preQualifyCheck: (product_id: string) =>
    fetchApi(`/financing/pre-qualify?product_id=${encodeURIComponent(product_id)}`, { method: "POST" }),

  // Copilot Agent
  chatCopilot: (message: string, conversation_id?: string) =>
    fetchApi("/agent/chat", { method: "POST", body: JSON.stringify({ message, conversation_id }) }),
  chatCopilotWithContext: (message: string, context?: any) =>
    fetchApi("/agent/chat", { method: "POST", body: JSON.stringify({ message, context }) }),
  getConversations: () => fetchApi("/agent/conversations"),
};
