import { redirect } from 'next/navigation'
import { SERVICES } from '@/lib/navigation'

export default function HomePage() {
  // Redirect to the first service
  if (SERVICES.length > 0) {
    redirect(`/service/${SERVICES[0].id}`)
  }
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Services Available
        </h1>
        <p className="text-gray-600">
          No services were found in the specifications directory.
        </p>
      </div>
    </div>
  )
}
