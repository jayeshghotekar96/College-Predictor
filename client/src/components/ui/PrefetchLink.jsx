import React from "react";
import { Link } from "react-router-dom";
import { collegesAPI } from "../../services/api";
import { predictionsAPI } from "../../services/api";

export function PrefetchLink({ to, prefetchAction, children, ...props }) {
  const handlePrefetch = () => {
    if (prefetchAction) {
      prefetchAction();
    } else if (typeof to === 'string') {
      // Automatic heuristic prefetching based on route
      if (to.startsWith('/colleges/')) {
        const code = to.split('/').pop();
        if (code && code !== 'colleges') {
          collegesAPI.getCollegeByCode(code).catch(() => {});
        }
      } else if (to === '/colleges') {
        collegesAPI.getLight().catch(() => {});
      } else if (to === '/predict') {
        collegesAPI.getMeta().catch(() => {});
      }
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
