import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconGradient?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconGradient = "from-cyber-cyan to-blue-500",
  badge,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-cyber-cyan font-mono uppercase tracking-wide">
                {title}
              </h1>
              {badge && (
                <Badge variant="outline" className="text-cyber-cyan/80">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-cyber-cyan/60 text-sm mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
