import { useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";
import { resolveSubscriptionState } from "./subscriptionUtils";
import type { SubscriptionState } from "./types";

export function useSubscription(): SubscriptionState {
  const { session, isAuthenticated } = useAuth();

  return useMemo(() => {
    if (!isAuthenticated) {
      return resolveSubscriptionState(null);
    }
    return resolveSubscriptionState(session?.user?.subscription ?? null);
  }, [isAuthenticated, session?.user?.subscription]);
}
