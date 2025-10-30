
'use client';
import React from 'react';

// Regex to match URLs (http, https, ftp, www)
const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b(www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

type LinkRendererProps = {
  text: string;
};

export function LinkRenderer({ text }: LinkRendererProps) {
  if (!text) {
    return null;
  }

  const parts = text.split(urlRegex);

  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part && (part.startsWith('http') || part.startsWith('www'))) {
          const href = part.startsWith('www.') ? `http://${part}` : part;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
              onClick={(e) => e.stopPropagation()} // Prevents parent link behavior
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </p>
  );
}
