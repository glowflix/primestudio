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
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    setHasError(true);
    onError?.();
    console.warn(`Failed to load image: ${src}`);
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {showLoader && !isLoaded && (
        <div className={`absolute inset-0 bg-gray-900 flex items-center justify-center z-10 animate-pulse`}>
          <Loader size={24} className="text-pink-500 animate-spin" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={fill ? 75 : 80}
        onError={handleImageError}
        onLoadingComplete={handleImageLoad}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        decoding="async"
      />
    </>
  );
}
