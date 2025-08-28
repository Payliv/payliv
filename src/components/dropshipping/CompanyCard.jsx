import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CompanyCard = ({ company, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, boxShadow: "0px 10px 20px hsla(var(--primary-hsl), 0.1)" }}
  >
    <Card className="h-full flex flex-col overflow-hidden glass-effect">
      <CardHeader className="flex-row items-center gap-4">
        <img src={company.logo_url} alt={`${company.name} logo`} className="w-16 h-16 rounded-full object-contain border-2 border-primary/20 p-1" />
        <CardTitle className="text-xl font-bold">{company.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{company.description}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onSelect(company)} className="w-full">Voir les détails</Button>
      </CardFooter>
    </Card>
  </motion.div>
);