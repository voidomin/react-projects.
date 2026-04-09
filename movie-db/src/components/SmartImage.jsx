import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

export default function SmartImage({
  src,
  alt,
  fallbackSrc = "",
  className = "",
  wrapperClassName = "",
  loading = "lazy",
}) {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [didFallback, setDidFallback] = useState(false);

  const resolvedSrc = useMemo(
    () => src || fallbackSrc || "",
    [src, fallbackSrc],
  );

  useEffect(() => {
    setIsLoaded(false);
    setDidFallback(false);
  }, [resolvedSrc]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [resolvedSrc]);

  function handleImageError(event) {
    if (
      !didFallback &&
      fallbackSrc &&
      event.currentTarget.src !== fallbackSrc
    ) {
      setDidFallback(true);
      event.currentTarget.src = fallbackSrc;
      return;
    }

    setIsLoaded(true);
  }

  return (
    <div
      className={`smart-image-wrap ${wrapperClassName} ${isLoaded ? "loaded" : ""}`}
    >
      <div className="smart-image-skeleton" aria-hidden="true" />
      <img
        ref={imgRef}
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        className={`smart-image ${className} ${isLoaded ? "loaded" : ""} ${didFallback ? "is-fallback" : ""}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
      />
      {didFallback && (
        <div className="fallback-badge" aria-hidden="true">
          No Image
        </div>
      )}
    </div>
  );
}

SmartImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  loading: PropTypes.oneOf(["eager", "lazy"]),
};
