'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onError?: () => void;
  showLoader?: boolean;
  blurDataURL?: string; // Low quality placeholder
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  className = '',
  onError,
  showLoader = true,
  blurDataURL, // Use Instagram-style blur-up loading
}: OptimizedImageProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setIsShowing(false);
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    setHasError(true);
    onError?.();
    console.warn(`Failed to load image: ${src}`);
  };

  const handleImageLoad = () => {
    // Small delay for smooth transition (Instagram effect)
    setTimeout(() => setIsShowing(true), 50);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      {/* Placeholder with blur effect - shows while loading */}
      {!isShowing && blurDataURL && (
        <Image
          src={blurDataURL}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          priority={false}
          sizes={sizes}
          quality={50}
          className={`${className} blur-sm scale-110 object-cover`}
          decoding="async"
        />
      )}

      {/* Loading spinner - Instagram style */}
      {showLoader && !isShowing && (
        <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-xs">
          <Loader size={28} className="text-pink-500 animate-spin" />
        </div>
      )}

      {/* Main high-quality image with fade-in transition */}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={fill ? 80 : 85}
        onError={handleImageError}
        onLoad={handleImageLoad}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={`
          ${className}
          ${isShowing ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}
          transition-all duration-500 ease-out
          object-cover
        `}
        decoding="async"
      />
    </div>
  );
}
