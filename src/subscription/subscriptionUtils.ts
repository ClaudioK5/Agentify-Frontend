import type { UserSubscriptionFields } from "./types";
import type { SubscriptionState } from "./types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseApiDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function computeRemainingTrialDays(trialEndsAt: Date | null, now = new Date()): number {
  if (!trialEndsAt) return 0;
  const diff = trialEndsAt.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_DAY);
}

export function formatSubscriptionDate(
  date: Date | null,
  locale: string,
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatPlanLabel(plan: string | null | undefined): string {
  const p = (plan ?? "").trim().toLowerCase();
  if (!p || p === "free" || p === "free_trial" || p === "trial") return "free_trial";
  return p;
}

export function formatStatusLabel(status: string | null | undefined): string {
  const s = (status ?? "").trim().toLowerCase();
  if (!s) return "unknown";
  return s;
}

/** True when /me indicates paid Pro (status and/or plan). */
export function isProUnlocked(
  fields: UserSubscriptionFields | null | undefined,
): boolean {
  const state = resolveSubscriptionState(fields);
  if (state.isActive) return true;
  const plan = formatPlanLabel(fields?.plan);
  return plan === "pro" || plan === "premium" || plan === "paid";
}

export function resolveSubscriptionState(
  fields: UserSubscriptionFields | null | undefined,
  now = new Date(),
): SubscriptionState {
  const plan = formatPlanLabel(fields?.plan);
  const subscriptionStatus = formatStatusLabel(fields?.subscription_status);
  const trialStartedAt = parseApiDate(fields?.trial_started_at ?? null);
  const trialEndsAt = parseApiDate(fields?.trial_ends_at ?? null);

  const isActive = subscriptionStatus === "active";
  const remainingTrialDays = computeRemainingTrialDays(trialEndsAt, now);
  const isTrialExpired =
    Boolean(trialEndsAt && now.getTime() > trialEndsAt.getTime()) && !isActive;

  const isTrialing =
    subscriptionStatus === "trialing" ||
    (plan === "free_trial" && !isActive && !isTrialExpired && remainingTrialDays > 0);

  const showTrialBanner =
    isAuthenticatedTrialing(isTrialing, isActive, isTrialExpired, remainingTrialDays, trialEndsAt);

  const isWorkflowBlocked = isTrialExpired;

  return {
    plan,
    subscriptionStatus,
    trialStartedAt,
    trialEndsAt,
    remainingTrialDays,
    isTrialing,
    isActive,
    isTrialExpired,
    showTrialBanner,
    isWorkflowBlocked,
  };
}

function isAuthenticatedTrialing(
  isTrialing: boolean,
  isActive: boolean,
  isTrialExpired: boolean,
  remainingTrialDays: number,
  trialEndsAt: Date | null,
): boolean {
  if (isActive || isTrialExpired) return false;
  if (!trialEndsAt) return isTrialing;
  return isTrialing && remainingTrialDays > 0;
}

export function extractSubscriptionFromUser(
  user: Record<string, unknown> | null | undefined,
): UserSubscriptionFields {
  if (!user) return {};
  return {
    plan: pickString(user, "plan"),
    subscription_status: pickString(user, "subscription_status"),
    trial_started_at: pickString(user, "trial_started_at"),
    trial_ends_at: pickString(user, "trial_ends_at"),
  };
}

function pickString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}
