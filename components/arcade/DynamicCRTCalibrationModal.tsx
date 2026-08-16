import dynamic from "next/dynamic";
import type { CRTCalibrationModalProps } from "./CRTCalibrationModal";

export const DynamicCRTCalibrationModal = dynamic<CRTCalibrationModalProps>(
  () => import("./CRTCalibrationModal").then((mod) => mod.CRTCalibrationModal),
  { ssr: false }
);
