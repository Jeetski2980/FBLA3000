import React from 'react';

export default function ImageAttribution({ attributions = [], className = '' }) {
  if (!Array.isArray(attributions) || attributions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <span className="mr-1 opacity-70">Photo via Google Maps:</span>
      {attributions.map((attribution, index) => {
        const label = attribution?.displayName || 'Contributor';
        const key = `${label}-${index}`;

        if (attribution?.uri) {
          return (
            <React.Fragment key={key}>
              <a
                href={attribution.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                {label}
              </a>
              {index < attributions.length - 1 ? <span>, </span> : null}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={key}>
            <span>{label}</span>
            {index < attributions.length - 1 ? <span>, </span> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
