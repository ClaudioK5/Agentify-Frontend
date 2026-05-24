/** Subscription fields from Pulse DB (via auth/profile API). */
export type UserSubscriptionFields = {
  plan?: string | null;
  subscription_status?: string | null;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
};

export type SubscriptionState = {
  plan: string;
  subscriptionStatus: string;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  remainingTrialDays: number;
  isTrialing: boolean;
  isActive: boolean;
  isTrialExpired: boolean;
  showTrialBanner: boolean;
  isWorkflowBlocked: boolean;
};
