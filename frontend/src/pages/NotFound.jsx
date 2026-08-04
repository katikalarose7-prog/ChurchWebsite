import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-container py-24 text-center">
      <p className="font-display text-6xl font-bold text-ink">404</p>
      <p className="text-ink-300 mt-2">This page could not be found.</p>
      <Link to="/" className="btn-gold mt-6 inline-flex">
        Back to Home
      </Link>
    </div>
  );
}
