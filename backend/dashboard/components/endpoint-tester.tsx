'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { ServiceInfo, ServiceEndpoint, EndpointParameter } from '@/lib/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2, Play, Copy, CheckCircle, XCircle } from 'lucide-react'

interface EndpointTesterProps {
  endpoint: ServiceEndpoint
  service: ServiceInfo
}

interface TestResult {
  status: number
  statusText: string
  data: any
  headers: any
  duration: number
}

export function EndpointTester({ endpoint, service }: EndpointTesterProps) {
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [requestBody, setRequestBody] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const startTime = Date.now()
      setError(null)
      setTestResult(null)

      // Build URL with path parameters
      let url = service.baseUrl + endpoint.path
      endpoint.parameters
        .filter(p => p.in === 'path')
        .forEach(param => {
          const value = parameters[param.name] || ''
          url = url.replace(`{${param.name}}`, encodeURIComponent(value))
        })

      // Build query parameters
      const queryParams = new URLSearchParams()
      endpoint.parameters
        .filter(p => p.in === 'query')
        .forEach(param => {
          const value = parameters[param.name]
          if (value) {
            queryParams.append(param.name, value)
          }
        })

      if (queryParams.toString()) {
        url += '?' + queryParams.toString()
      }

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      endpoint.parameters
        .filter(p => p.in === 'header')
        .forEach(param => {
          const value = parameters[param.name]
          if (value) {
            headers[param.name] = value
          }
        })

      // Prepare request config
      const config: any = {
        method: endpoint.method.toLowerCase(),
        url,
        headers,
      }

      // Add request body for POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && requestBody) {
        try {
          config.data = JSON.parse(requestBody)
        } catch {
          config.data = requestBody
        }
      }

      const response = await axios(config)
      const duration = Date.now() - startTime

      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        duration
      }
    },
    onSuccess: (result) => {
      setTestResult(result)
    },
    onError: (err: any) => {
      const startTime = Date.now()
      if (err.response) {
        setTestResult({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers,
          duration: Date.now() - startTime
        })
      } else {
        setError(err.message || 'Request failed')
      }
    }
  })

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 400 && status < 500) return 'text-yellow-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Request Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Configuration</CardTitle>
          <CardDescription>
            Configure parameters and request body for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parameters */}
          {endpoint.parameters.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Parameters</h4>
              <div className="space-y-2">
                {endpoint.parameters.map((param) => (
                  <div key={param.name} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-16 justify-center">
                      {param.in}
                    </Badge>
                    <Input
                      placeholder={`${param.name}${param.required ? ' (required)' : ''}`}
                      value={parameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body */}
          {endpoint.requestBody && (
            <div>
              <h4 className="font-medium mb-2">
                Request Body {endpoint.requestBody.required && '(required)'}
              </h4>
              <Textarea
                placeholder="Enter JSON request body..."
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="font-mono text-sm"
                rows={6}
              />
            </div>
          )}

          {/* Test Button */}
          <Button 
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test Endpoint
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {(testResult || error) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Response</CardTitle>
              {testResult && (
                <div className="flex items-center gap-2">
                  {testResult.status >= 200 && testResult.status < 300 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-mono text-sm ${getStatusColor(testResult.status)}`}>
                    {testResult.status} {testResult.statusText}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({testResult.duration}ms)
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            ) : testResult ? (
              <div className="space-y-4">
                {/* Response Body */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Response Body</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(testResult.data, null, 2))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-auto max-h-96">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </div>

                {/* Response Headers */}
                <div>
                  <h4 className="font-medium mb-2">Response Headers</h4>
                  <div className="bg-gray-50 border rounded-lg p-4 text-sm">
                    {Object.entries(testResult.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-mono text-gray-600">{key}:</span>
                        <span className="font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
