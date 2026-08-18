"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { RetroChaosModal } from "./RetroChaosModal";

export const RetroChaosOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKonami = useCallback(() => {
    setIsOpen(true);
  }, []);

  const { resetActivation } = useKonamiCode(handleKonami);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetActivation();
  }, [resetActivation]);

  // Listen for manual trigger events from Command Palette or Secret buttons
  useEffect(() => {
    const handleTrigger = () => setIsOpen(true);
    window.addEventListener("trigger_retro_chaos", handleTrigger);
    return () => window.removeEventListener("trigger_retro_chaos", handleTrigger);
  }, []);

  if (!isOpen) {
    return null;
  }

  return <RetroChaosModal isOpen={isOpen} onClose={handleClose} />;
};
