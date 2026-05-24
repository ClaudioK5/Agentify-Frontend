import { useEffect } from "react";
import {
  useCreateAgentFlowContext,
  type FlowPhase,
} from "../context/CreateAgentFlowContext";

export type { FlowPhase };

/** Syncs page prompt into layout-level flow state (survives route changes). */
export function useCreateAgentFlow(prompt: string) {
  const flow = useCreateAgentFlowContext();

  useEffect(() => {
    if (prompt !== "") {
      flow.setCreatePrompt(prompt);
    }
  }, [prompt, flow.setCreatePrompt]);

  return flow;
}
