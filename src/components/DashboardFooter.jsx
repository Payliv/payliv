import React from 'react';
import { Heart } from 'lucide-react';

const DashboardFooter = () => {
  return (
    <footer className="py-4 px-6 text-center text-muted-foreground text-sm border-t border-border mt-auto">
      <p className="flex items-center justify-center">
        Conçu avec <Heart className="h-4 w-4 mx-1.5 text-red-500 fill-red-500" /> par
        <a
          href="https://gstartup.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 font-semibold text-primary hover:underline"
        >
          G-STARTUP
        </a>
      </p>
    </footer>
  );
};

export default DashboardFooter;
