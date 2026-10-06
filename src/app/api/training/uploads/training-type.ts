import { ValidationError } from "@/utils/errors";
import type { TrainingResourceType } from "@/types/training.types";

const TYPES: TrainingResourceType[] = ["video", "pdf", "ppt", "assignment"];

/** The `?type=` of a training upload request. */
export function trainingTypeFrom(url: string): TrainingResourceType {
  const type = new URL(url).searchParams.get("type") as TrainingResourceType | null;
  if (!type || !TYPES.includes(type)) throw new ValidationError("Choose the resource type before uploading");
  return type;
}
