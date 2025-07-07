'use client'

import { useState } from 'react'
import { ServiceInfo, ServiceEndpoint } from '@/lib/navigation'
import { EndpointTester } from './endpoint-tester'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface ServiceExplorerProps {
  service: ServiceInfo
}

export function ServiceExplorer({ service }: ServiceExplorerProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ServiceEndpoint | null>(null)

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800'
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Endpoints List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Endpoints</h2>
        <div className="space-y-2">
          {service.endpoints.map((endpoint, index) => (
            <Card 
              key={`${endpoint.method}-${endpoint.path}-${index}`}
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedEndpoint === endpoint ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedEndpoint(endpoint)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                </div>
                <CardTitle className="text-base">{endpoint.summary || endpoint.operationId}</CardTitle>
                {endpoint.description && (
                  <CardDescription className="text-sm">
                    {endpoint.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {endpoint.parameters.length > 0 && (
                    <span>{endpoint.parameters.length} parameter(s)</span>
                  )}
                  {endpoint.requestBody && (
                    <span>Request body required</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Endpoint Tester */}
      <div className="lg:sticky lg:top-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Try It Out</h2>
        {selectedEndpoint ? (
          <EndpointTester 
            endpoint={selectedEndpoint} 
            service={service}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Select an endpoint to test it</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
