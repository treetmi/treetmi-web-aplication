/**
 * treetmi.id Centralized API Client Configurations
 */

// Centralized API Base URL - Change this single value or configure NEXT_PUBLIC_API_URL in .env to redirect all services.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-system.treetmi.id/api/v1";

/**
 * Drop-in replacement for fetch() that automatically retries on transient network failures
 * (TypeError: Failed to fetch). This prevents console spam when the backend starts slower
 * than the Next.js dev server. No UI/layout impact – purely a resilience wrapper.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 3,
  backoffMs = 2000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(input, init);
      return response;
    } catch (err: unknown) {
      const isNetworkError =
        err instanceof TypeError &&
        (err.message === "Failed to fetch" || err.message.includes("fetch"));
      if (!isNetworkError || attempt === retries) {
        throw err;
      }
      // Wait with exponential backoff before retrying
      await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
    }
  }
  // Unreachable, but satisfies TypeScript
  throw new Error("fetchWithRetry exhausted all retries");
}

// Centralized Superadmin API Endpoint Router
export const ADMIN_API = {
  creators: `${API_BASE_URL}/admin/creators`,
  creatorById: (id: string) => `${API_BASE_URL}/admin/creators/${id}`,
  withdrawals: `${API_BASE_URL}/admin/withdrawals`,
  approveWithdrawal: (id: string) => `${API_BASE_URL}/admin/withdrawals/${id}/approve`,
  rejectWithdrawal: (id: string) => `${API_BASE_URL}/admin/withdrawals/${id}/reject`,
  transactions: `${API_BASE_URL}/admin/transactions`,
  simulateTransaction: `${API_BASE_URL}/admin/transactions/simulate`,
  profile: `${API_BASE_URL}/admin/profile`,
  settings: `${API_BASE_URL}/admin/settings`,
  avatars: `${API_BASE_URL}/admin/avatars`,
  avatarById: (id: string) => `${API_BASE_URL}/admin/avatars/${id}`,
  trustBadges: `${API_BASE_URL}/admin/trust-badges`,
  trustBadgeById: (id: string) => `${API_BASE_URL}/admin/trust-badges/${id}`,
  approveVerification: (userId: string) => `${API_BASE_URL}/admin/verification/${userId}/approve`,
  rejectVerification: (userId: string) => `${API_BASE_URL}/admin/verification/${userId}/reject`,
  partners: `${API_BASE_URL}/partners/admin/list`,
  createPartner: `${API_BASE_URL}/partners/admin/create`,
  updatePartner: (id: string) => `${API_BASE_URL}/partners/admin/update/${id}`,
  togglePartner: (id: string) => `${API_BASE_URL}/partners/admin/toggle/${id}`,
  deletePartner: (id: string) => `${API_BASE_URL}/partners/admin/delete/${id}`,
  login: `${API_BASE_URL}/admin/login`,
  login2FA: `${API_BASE_URL}/admin/login/2fa`,
  changePassword: `${API_BASE_URL}/admin/change-password`,
  setup2FA: `${API_BASE_URL}/admin/2fa/setup`,
  enable2FA: `${API_BASE_URL}/admin/2fa/enable`,
  disable2FA: `${API_BASE_URL}/admin/2fa/disable`,
  status2FA: `${API_BASE_URL}/admin/2fa/status`,
  filterWords: `${API_BASE_URL}/admin/filter-words`,
  filterWordById: (id: string) => `${API_BASE_URL}/admin/filter-words/${id}`,
  whatsappLogs: `${API_BASE_URL}/admin/whatsapp/logs`,
  reports: `${API_BASE_URL}/reports/admin`,
  updateReport: (id: string) => `${API_BASE_URL}/reports/admin/${id}`,
};

// Centralized Public API Endpoint Router
export const PUBLIC_API = {
  profile: (username: string) => `${API_BASE_URL}/users/profile/${username}`,
  publicSettings: `${API_BASE_URL}/users/settings/public`,
  simulateTransaction: `${API_BASE_URL}/users/transactions/simulate`,
  resolveMedia: `${API_BASE_URL}/users/media/resolve`,
  checkProjectAccess: (email: string, streamerId: string) => `${API_BASE_URL}/projects/check-access?email=${encodeURIComponent(email)}&streamerId=${encodeURIComponent(streamerId)}`,
  trustBadges: `${API_BASE_URL}/users/trust-badges`,
  partners: `${API_BASE_URL}/partners`,
  whatsappAlarm: (username: string) => `${API_BASE_URL}/users/profile/${username}/whatsapp-alarm`,
  reports: `${API_BASE_URL}/reports`,
  recentFeed: `${API_BASE_URL}/users/transactions/recent-feed`,
};

// Centralized User Account / Creator Portal API Router
export const USER_API = {
  register: `${API_BASE_URL}/users/register`,
  login: `${API_BASE_URL}/users/login`,
  googleAuth: `${API_BASE_URL}/users/google-auth`,
  updateProfile: `${API_BASE_URL}/users/update`,
  resetToken: `${API_BASE_URL}/users/reset-token`,
};
