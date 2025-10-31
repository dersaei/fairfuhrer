// components/CategoryInfoModal.tsx - Positioned directly above clicked icon
"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "focus-trap-react";
import styles from "./CategoryInfoModal.module.css";
import type { Category } from "../types";

interface CategoryInfoModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryInfoModal: React.FC<CategoryInfoModalProps> = ({
  category,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [modalStyle, setModalStyle] = useState<React.CSSProperties>({});
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Intentional mount detection for portal rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Staggered animation: First show modal, then make it visible
  // Animation state management requires effect-based updates
  useEffect(() => {
    if (isOpen && mounted) {
      // Small delay for smooth entrance
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen, mounted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Store the element that opened the modal so we can return focus to it
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isClosing) {
      setIsClosing(true);
      setIsVisible(false);

      // Clear any existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      // Wait for animation to complete (350ms for smoother close)
      closeTimeoutRef.current = setTimeout(() => {
        setIsClosing(false);
        onClose();
        // Return focus to the element that opened the modal
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, 350);
    }
  }, [onClose, isClosing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle backdrop click (click outside modal)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only close if clicking the backdrop itself, not the modal content
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  // Position modal - centered on all viewports
  // Dynamic positioning based on viewport requires effect-based state updates
  useEffect(() => {
    if (isOpen && mounted) {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Modal dimensions
      const modalWidth = Math.min(280, viewport.width - 40);
      const modalHeight = 200; // Approximate height from CSS

      // Center horizontally and vertically
      const left = (viewport.width - modalWidth) / 2;
      const top = (viewport.height - modalHeight) / 2;

      const style: React.CSSProperties = {
        position: "fixed",
        left: `${left}px`,
        top: `${Math.max(20, top)}px`, // Minimum 20px from top
        zIndex: 9999,
      };

      setModalStyle(style);
    }
  }, [isOpen, mounted]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close on Escape key only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !category) {
    return null;
  }

  const modalContent = (
    <div
      className={`${styles.backdrop} ${isVisible ? styles.visible : ""} ${
        isClosing ? styles.closing : ""
      }`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <FocusTrap
        active={isOpen && !isClosing}
        focusTrapOptions={{
          initialFocus: false,
          allowOutsideClick: true,
          escapeDeactivates: false, // We handle Escape ourselves
          returnFocusOnDeactivate: false, // We handle focus return ourselves
        }}
      >
        <div
          className={`${styles.modal} ${isVisible ? styles.visible : ""} ${
            isClosing ? styles.closing : ""
          }`}
          style={modalStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
          aria-describedby="category-modal-description"
        >
          <button
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Zamknij"
            type="button"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div
            id="category-modal-description"
            className={styles.content}
            dangerouslySetInnerHTML={{
              __html: category.description || "Brak opisu.",
            }}
          />
        </div>
      </FocusTrap>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CategoryInfoModal;
