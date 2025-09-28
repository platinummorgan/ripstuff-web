"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type SafeImageProps = Omit<ImageProps, "onError"> & {
  fallback?: ReactNode;
  onImageError?: (event: Event) => void;
};

export function SafeImage({ fallback, onImageError, ...imageProps }: SafeImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageProps.src]);

  useEffect(() => {
    const node = imageRef.current;
    if (!node) {
      return;
    }

    const handleError = (event: Event) => {
      setHasError(true);
      if (onImageError) {
        onImageError(event);
      }
    };

    node.addEventListener("error", handleError);

    return () => {
      node.removeEventListener("error", handleError);
    };
  }, [onImageError, imageProps.src]);

  if (hasError) {
    return fallback ? <>{fallback}</> : null;
  }

  const forwardedProps = imageProps as ImageProps;

  return <Image {...forwardedProps} ref={imageRef} />;
}
