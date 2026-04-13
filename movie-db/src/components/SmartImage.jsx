import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartImage({
  src,
  srcs = [],
  alt,
  fallbackSrc = "",
  className = "",
  wrapperClassName = "",
  loading = "lazy",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Combine single src and srcs array
  const allSources = [src, ...srcs, fallbackSrc].filter(Boolean);
  const resolvedSources = [...new Set(allSources)];

  useEffect(() => {
    setCurrentIndex(0);
    setIsLoaded(false);
    setHasFailedAll(false);
  }, [src, srcs.join(",")]);

  function handleImageError() {
    if (currentIndex < resolvedSources.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
      setIsLoaded(true); // Stop loading state even if failed
    }
  }

  const currentSrc = resolvedSources[currentIndex] || "";

  return (
    <div
      className={`smart-image-wrap ${wrapperClassName} ${isLoaded ? "loaded" : ""}`}
    >
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="smart-image-skeleton"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.img
        key={currentSrc}
        src={currentSrc}
        alt={alt}
        loading={loading}
        className={`smart-image ${className} ${isLoaded ? "loaded" : ""} ${hasFailedAll ? "is-failed" : ""}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleImageError}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {hasFailedAll && (
        <div className="fallback-badge" aria-hidden="true">
          No Image
        </div>
      )}
    </div>
  );
}

SmartImage.propTypes = {
  src: PropTypes.string,
  srcs: PropTypes.arrayOf(PropTypes.string),
  alt: PropTypes.string.isRequired,
  fallbackSrc: PropTypes.string,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  loading: PropTypes.oneOf(["eager", "lazy"]),
};
