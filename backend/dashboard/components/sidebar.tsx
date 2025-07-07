'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SERVICES } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { 
  Activity, 
  Shield, 
  Brain, 
  Cpu, 
  Database, 
  FileSearch, 
  Globe, 
  Lock, 
  Monitor, 
  Network, 
  Search, 
  Settings, 
  Timer, 
  Wallet,
  Bot,
  Zap
} from 'lucide-react'

const serviceIcons: Record<string, React.ComponentType<any>> = {
  'ai-forensics-service': Brain,
  'api-gateway': Globe,
  'bridge-service': Network,
  'bytecode-service': Cpu,
  'exploit-testing-service': Shield,
  'honeypot-service': Lock,
  'integration-hub': Network,
  'mempool-service': Database,
  'mev-bot-service': Bot,
  'mev-protection-service': Shield,
  'quantum-crypto-service': Lock,
  'quantum-service': Zap,
  'reporting-service': FileSearch,
  'scanner-ai-orchestrator': Search,
  'scanner-manticore': Search,
  'scanner-mythril': Search,
  'scanner-mythx': Search,
  'scanner-slither': Search,
  'settings-service': Settings,
  'simulation-service': Monitor,
  'time-machine-service': Timer,
  'wallet-guard-service': Wallet,
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Scorpius</h1>
        <p className="text-sm text-gray-600 mt-1">API Dashboard</p>
      </div>
      
      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {SERVICES.map((service) => {
            const IconComponent = serviceIcons[service.id] || Activity
            const isActive = pathname === `/service/${service.id}`
            
            return (
              <Link
                key={service.id}
                href={`/service/${service.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{service.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {service.endpointCount} endpoints
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                >
                  {service.endpointCount}
                </Badge>
              </Link>
            )
          })}
        </div>
      </nav>
      
      <div className="px-4 py-4 border-t border-gray-200 mt-4">
        <div className="text-xs text-gray-500">
          <div>Total Services: {SERVICES.length}</div>
          <div>Total Endpoints: {SERVICES.reduce((acc, s) => acc + s.endpointCount, 0)}</div>
        </div>
      </div>
    </div>
  )
}
