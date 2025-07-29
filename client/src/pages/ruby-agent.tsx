import { Diamond } from "lucide-react";
import RubyAgentStatus from "@/components/ruby-agent-status";

export default function RubyAgentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Diamond className="text-red-500 text-2xl" size={32} />
            <h1 className="text-2xl font-medium text-gray-900">Agente Ruby</h1>
            <span className="text-sm text-gray-500">Análisis Especializado para Ruby/Rails</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Análisis Avanzado de Backend
          </h2>
          <p className="text-gray-600">
            Utiliza nuestro agente Ruby especializado para obtener métricas detalladas de rendimiento, 
            especialmente optimizado para aplicaciones Ruby on Rails.
          </p>
        </div>

        <RubyAgentStatus />

        {/* Documentation Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ¿Qué hace el Agente Ruby?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Análisis de Conectividad</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Múltiples mediciones de tiempo de respuesta</li>
                <li>• Detección de redirecciones</li>
                <li>• Análisis de códigos de estado HTTP</li>
                <li>• Detección de errores de conectividad</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Headers HTTP</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detección automática del servidor web</li>
                <li>• Análisis de compresión (gzip, brotli, deflate)</li>
                <li>• Headers de cache y optimización</li>
                <li>• Headers de seguridad completos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Seguridad SSL/TLS</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Validación de certificados SSL</li>
                <li>• Fechas de expiración</li>
                <li>• Información del emisor y algoritmos</li>
                <li>• Detección de problemas de seguridad</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ruby/Rails Específico</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detección automática de Rails</li>
                <li>• Análisis de X-Runtime y X-Request-ID</li>
                <li>• Detección de Puma, Unicorn, Passenger</li>
                <li>• Estimación de métricas de base de datos</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Integración con el Sistema Principal</h4>
            <p className="text-sm text-blue-800">
              El agente Ruby se integra automáticamente con el sistema de análisis principal. 
              Cuando realizas un análisis desde la página principal, el sistema intentará usar 
              el agente Ruby para obtener datos más precisos y detallados del backend.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}