import { motion } from "framer-motion";
import PropTypes from "prop-types";

export default function Hero({ movie }) {
  if (!movie) return null;

  return (
    <div className="hero-container">
      <div 
        className="hero-backdrop" 
        style={{ backgroundImage: `linear-gradient(to bottom, transparent, var(--bg-primary)), url(${movie.poster_path})` }}
      />
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="hero-badge">Featured Today</span>
        <h1 className="hero-title">{movie.title}</h1>
        <p className="hero-overview">{movie.overview}</p>
        <div className="hero-actions">
          <button className="btn-primary">View Details</button>
          <button className="btn-subtle">Save to Watchlist</button>
        </div>
      </motion.div>
    </div>
  );
}

Hero.propTypes = {
  movie: PropTypes.object
};
