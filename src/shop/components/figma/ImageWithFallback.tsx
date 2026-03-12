import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  query?: string;
};

function normalizeImageSrc(src: ImageWithFallbackProps['src']) {
  if (typeof src !== 'string') return undefined;
  const trimmed = src.trim();
  return trimmed ? trimmed : undefined;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const { src, alt, style, className, onError, query: _query, ...rest } = props;
  const normalizedSrc = normalizeImageSrc(src);
  const [didError, setDidError] = useState(false);

  useEffect(() => {
    setDidError(false);
  }, [normalizedSrc]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = event => {
    setDidError(true);
    onError?.(event);
  };

  if (!normalizedSrc || didError) {
    const fallbackLabel = alt || (normalizedSrc ? 'Image unavailable' : 'No image available');

    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className ?? ''}`.trim()}
        style={style}
        role="img"
        aria-label={fallbackLabel}
        data-original-url={normalizedSrc}
      >
        <ImageOff className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
