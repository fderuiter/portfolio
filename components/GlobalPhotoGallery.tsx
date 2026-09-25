"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PhotoGalleryModal = dynamic(
  () => import("./PhotoGalleryModal").then((mod) => mod.PhotoGalleryModal),
  { ssr: false }
);

/**
 * GlobalPhotoGallery listens for the 'open-photo-gallery' custom event
 * and displays the PhotoGalleryModal across any page without prop drilling.
 */
export function GlobalPhotoGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPhotoId, setInitialPhotoId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ photoId?: string }>;
      if (customEvent.detail?.photoId) {
        setInitialPhotoId(customEvent.detail.photoId);
      } else {
        setInitialPhotoId(undefined);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-photo-gallery", handleOpen);
    return () => window.removeEventListener("open-photo-gallery", handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <PhotoGalleryModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      initialPhotoId={initialPhotoId}
    />
  );
}
