import { z } from "zod";
import type {
  WorkingWithDuckState,
  PortfolioHazardType,
  PortfolioHazard,
} from "@/lib/working-with-duck-engine";
import type { ServiceResult } from "@/lib/services/service-result";

export const InteractHazardInputSchema = z.object({
  state: z.custom<WorkingWithDuckState>((val) =>
    Boolean(val && typeof val === "object")
  ),
  action: z.enum(["distract_with_squeaky", "distract_with_kong", "fix_hazard"]),
  hazardId: z.string().optional(),
  x: z.number().optional().default(400),
  y: z.number().optional().default(250),
});

export type InteractHazardInput = z.input<typeof InteractHazardInputSchema>;

export const InteractHazardErrorCode = z.enum([
  "NO_ACTIVE_HAZARD",
  "HAZARD_NOT_FOUND",
  "INVALID_STATE",
  "ACTION_FAILED",
]);

export type InteractHazardErrorCode = z.infer<typeof InteractHazardErrorCode>;

export interface InteractHazardData {
  state: WorkingWithDuckState;
  savedHazard?: PortfolioHazard;
  activeHazardTarget: PortfolioHazardType | null;
  scoreBonus: number;
}

export type InteractHazardResult = ServiceResult<
  InteractHazardData,
  InteractHazardErrorCode
>;

export interface InteractHazardSpec {
  execute(input: InteractHazardInput): InteractHazardResult;
}
