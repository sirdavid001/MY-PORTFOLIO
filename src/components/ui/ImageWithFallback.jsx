import { useEffect, useRef, useState } from "react";

export function ImageWithFallback({ src, alt, className, onError, ...rest }) {
  return <ImageAttempt key={src} src={src} alt={alt} className={className} onError={onError} {...rest} />;
}

function ImageAttempt({ src, alt, className, onError, ...rest }) {
  const [failed, setFailed] = useState(false);
  const image = useRef(null);

  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground ${className || ""}`}
        role="img"
        aria-label={`${alt}. Preview unavailable.`}
      >
        Preview unavailable
      </div>
    );
  }

  return (
    <img
      ref={image}
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
