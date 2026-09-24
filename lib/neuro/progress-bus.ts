/**
 * NeuroRecon Event-Driven Progress Bus
 * Pub/Sub Event Bus for real-time external 3D asset download progress streaming.
 */

import { formatNumber } from "../utils";
import { logger } from "@/lib/logger";

export interface AssetProgressEvent {
  url: string;
  loaded: number;
  total: number;
  percentage: number; // 0 to 100
  status: "loading" | "complete" | "error";
  error?: string;
}

export type ProgressSubscriber = (event: AssetProgressEvent) => void;

export class ProgressBus {
  private subscribers: Set<ProgressSubscriber> = new Set();

  /**
   * Subscribe to asset download progress events.
   * Returns an unsubscribe function.
   */
  subscribe(callback: ProgressSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Publish a progress event to all active subscribers.
   */
  publish(event: AssetProgressEvent): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (err) {
        logger.error("Error in progress listener subscriber:", err);
      }
    });
  }

  /**
   * Remove all active subscribers.
   */
  clear(): void {
    this.subscribers.clear();
  }
}

export const progressBus = new ProgressBus();

/**
 * Format raw byte counts into human-readable string (B, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${formatNumber(bytes / Math.pow(k, i), { maximumFractionDigits: dm, useGrouping: false })} ${sizes[i]}`;
}
