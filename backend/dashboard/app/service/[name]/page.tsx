import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SERVICES } from '@/lib/navigation'
import { ServiceExplorer } from '@/components/service-explorer'

interface ServicePageProps {
  params: {
    name: string
  }
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = SERVICES.find(s => s.id === params.name)
  
  if (!service) {
    return {
      title: 'Service Not Found'
    }
  }

  return {
    title: `${service.name} - Scorpius Dashboard`,
    description: service.description
  }
}

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    name: service.id,
  }))
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = SERVICES.find(s => s.id === params.name)
  
  if (!service) {
    notFound()
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
        <p className="text-gray-600 mt-2">{service.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{service.baseUrl}</code></span>
          <span>{service.endpointCount} endpoints</span>
        </div>
      </div>
      
      <ServiceExplorer service={service} />
    </div>
  )
}
