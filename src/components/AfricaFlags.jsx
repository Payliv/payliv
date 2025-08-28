import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const countries = [
  { code: 'SN', name: 'Sénégal' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'CM', name: 'Cameroun' },
  { code: 'BJ', name: 'Bénin' },
  { code: 'TG', name: 'Togo' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'ML', name: 'Mali' },
  { code: 'GN', name: 'Guinée' },
  { code: 'GA', name: 'Gabon' },
  { code: 'CG', name: 'Congo' },
  { code: 'NE', name: 'Niger' },
  { code: 'TD', name: 'Tchad' },
];

export const Flag = ({ code, className }) => {
  return (
    <img 
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
      width="40"
      alt={`${code} flag`}
      className={`rounded-md shadow-md ${className || ''}`}
    />
  );
};

export function AfricaFlags() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 150,
      },
    },
  };
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex justify-center items-center flex-wrap gap-4 max-w-3xl mx-auto"
    >
      {countries.map((country) => (
        <Tooltip key={country.code}>
          <TooltipTrigger asChild>
            <motion.div
              variants={itemVariants}
              className="p-2 bg-card/50 rounded-lg backdrop-blur-sm border border-border/50 shadow-sm flex flex-col items-center gap-2 transition-transform hover:scale-110"
            >
              <Flag code={country.code} />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{country.name} - Disponible</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </motion.div>
  );
}