import { useState, useCallback } from "react";
import type { Place } from "../types";

export function useGallery(selectedPlace: Place | null) {
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = useCallback((imagePath: string, index: number) => {
    setCurrentImageIndex(index);
    setSelectedGalleryImage(imagePath);
  }, []);

  const handleNextImage = useCallback(() => {
    const images = selectedPlace?.Galerie_Bilder?.length
      ? selectedPlace.Galerie_Bilder
      : selectedPlace?.Galerie;
    if (!images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [selectedPlace]);

  const handlePrevImage = useCallback(() => {
    const images = selectedPlace?.Galerie_Bilder?.length
      ? selectedPlace.Galerie_Bilder
      : selectedPlace?.Galerie;
    if (!images?.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [selectedPlace]);

  const closeGalleryOnly = useCallback(() => {
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);
  }, []);

  return {
    selectedGalleryImage,
    currentImageIndex,
    setSelectedGalleryImage,
    setCurrentImageIndex,
    handleImageClick,
    handleNextImage,
    handlePrevImage,
    closeGalleryOnly,
  };
}