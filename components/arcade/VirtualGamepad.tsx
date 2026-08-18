"use client";

import React from "react";
import {
  FloatingHUDOverlay,
  FloatingHUDOverlayProps,
} from "@/components/arcade/FloatingHUDOverlay";
import {
  VirtualDPad as UIVirtualDPad,
  VirtualDPadProps as UIVirtualDPadProps,
} from "@/components/ui/VirtualDPad";

export type VirtualDPadProps = UIVirtualDPadProps;

export const VirtualDPad: React.FC<VirtualDPadProps> = (props) => {
  return <UIVirtualDPad {...props} />;
};

export type VirtualGamepadProps = FloatingHUDOverlayProps;

export const VirtualGamepad: React.FC<VirtualGamepadProps> = (props) => {
  return <FloatingHUDOverlay {...props} />;
};
