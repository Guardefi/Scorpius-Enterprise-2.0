import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-cyber-cyan/70 text-sm">{description}</p>
    </div>
  );
}
