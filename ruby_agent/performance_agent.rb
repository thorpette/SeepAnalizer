#!/usr/bin/env ruby

require 'net/http'
require 'uri'
require 'json'
require 'time'
require 'benchmark'

class PerformanceAgent
  attr_reader :url, :results

  def initialize(url)
    @url = url
    @results = {}
    @start_time = Time.now
  end

  def analyze
    puts "🔍 Iniciando análisis de rendimiento para: #{@url}"
    
    # Análisis de conectividad y headers
    analyze_connectivity
    analyze_headers
    analyze_response_time
    analyze_ssl_certificate if @url.start_with?('https')
    
    # Análisis específico de Ruby/Rails si se detecta
    analyze_rails_specifics if rails_detected?
    
    # Análisis de recursos
    analyze_page_resources
    
    # Generar reporte
    generate_report
    
    @results
  end

  private

  def analyze_connectivity
    puts "📡 Analizando conectividad..."
    
    uri = URI(@url)
    
    begin
      response_time = Benchmark.measure do
        @response = Net::HTTP.get_response(uri)
      end
      
      @results[:connectivity] = {
        status: @response.code.to_i,
        response_time: (response_time.real * 1000).round(2), # en ms
        success: @response.code.to_i < 400,
        redirect_count: count_redirects(uri)
      }
      
    rescue => e
      @results[:connectivity] = {
        status: 0,
        response_time: 0,
        success: false,
        error: e.message
      }
    end
  end

  def analyze_headers
    puts "🔍 Analizando headers HTTP..."
    
    return unless @response
    
    headers = @response.to_hash
    
    @results[:headers] = {
      server: headers['server']&.first || 'Unknown',
      content_type: headers['content-type']&.first,
      content_length: headers['content-length']&.first&.to_i || 0,
      cache_control: headers['cache-control']&.first,
      etag: headers['etag']&.first,
      last_modified: headers['last-modified']&.first,
      
      # Headers de seguridad
      security: {
        https: @url.start_with?('https://'),
        hsts: headers['strict-transport-security']&.any?,
        csp: headers['content-security-policy']&.any?,
        x_frame_options: headers['x-frame-options']&.any?,
        x_content_type_options: headers['x-content-type-options']&.any?
      },
      
      # Headers de compresión
      compression: {
        content_encoding: headers['content-encoding']&.first,
        transfer_encoding: headers['transfer-encoding']&.first,
        compressed: headers['content-encoding']&.any? { |enc| 
          ['gzip', 'deflate', 'br'].include?(enc) 
        }
      }
    }
  end

  def analyze_response_time
    puts "⏱️  Analizando tiempos de respuesta..."
    
    # Múltiples mediciones para obtener promedio
    times = []
    5.times do
      time = Benchmark.measure do
        begin
          Net::HTTP.get_response(URI(@url))
        rescue
          # Ignorar errores en mediciones adicionales
        end
      end
      times << (time.real * 1000).round(2)
      sleep(0.1) # Pequeña pausa entre mediciones
    end
    
    @results[:response_times] = {
      average: (times.sum / times.length).round(2),
      min: times.min,
      max: times.max,
      measurements: times
    }
  end

  def analyze_ssl_certificate
    puts "🔒 Analizando certificado SSL..."
    
    uri = URI(@url)
    
    begin
      socket = TCPSocket.new(uri.host, uri.port)
      ssl_context = OpenSSL::SSL::SSLContext.new
      ssl_socket = OpenSSL::SSL::SSLSocket.new(socket, ssl_context)
      ssl_socket.connect
      
      cert = ssl_socket.peer_cert
      
      @results[:ssl] = {
        valid: true,
        issuer: cert.issuer.to_s,
        subject: cert.subject.to_s,
        expires_at: cert.not_after,
        days_until_expiry: ((cert.not_after - Time.now) / 86400).round,
        algorithm: cert.signature_algorithm
      }
      
      ssl_socket.close
      socket.close
      
    rescue => e
      @results[:ssl] = {
        valid: false,
        error: e.message
      }
    end
  end

  def rails_detected?
    return false unless @response
    
    server_header = @response['server']
    powered_by = @response['x-powered-by']
    
    # Detectar Rails por headers comunes
    rails_indicators = [
      @response['x-runtime'], # Header típico de Rails
      @response['x-request-id'], # UUID requests de Rails
      server_header&.match?(/puma|unicorn|passenger/i),
      powered_by&.match?(/ruby|rails/i)
    ]
    
    rails_indicators.any?
  end

  def analyze_rails_specifics
    puts "💎 Detectado Ruby/Rails - Análisis específico..."
    
    @results[:rails] = {
      detected: true,
      runtime: @response['x-runtime']&.to_f,
      request_id: @response['x-request-id'],
      server_timing: parse_server_timing(@response['server-timing'])
    }
    
    # Intentar detectar versión de Rails desde headers o contenido
    detect_rails_version
    
    # Análizar rendimiento específico de Rails
    analyze_rails_performance
  end

  def detect_rails_version
    # Buscar en el contenido de la página
    content = @response.body if @response
    
    if content
      # Buscar meta tags o comentarios que indiquen versión
      version_patterns = [
        /Rails\s+(\d+\.\d+\.\d+)/i,
        /ruby\s+on\s+rails\s+(\d+\.\d+)/i,
        /data-rails-version="([^"]+)"/i
      ]
      
      version_patterns.each do |pattern|
        match = content.match(pattern)
        if match
          @results[:rails][:version] = match[1]
          break
        end
      end
    end
  end

  def analyze_rails_performance
    # Simular métricas típicas de una aplicación Rails
    runtime = @results[:rails][:runtime] || 0
    
    @results[:rails][:performance] = {
      database_time: (runtime * 0.6).round(2), # ~60% típicamente DB
      view_rendering: (runtime * 0.25).round(2), # ~25% rendering
      controller_time: (runtime * 0.15).round(2), # ~15% controller
      
      # Estimaciones basadas en el tiempo de respuesta
      estimated_queries: estimate_query_count(runtime),
      cache_hit_ratio: estimate_cache_performance,
      memory_usage: estimate_memory_usage
    }
  end

  def analyze_page_resources
    puts "📦 Analizando recursos de la página..."
    
    content = @response&.body
    return unless content
    
    # Contar diferentes tipos de recursos
    css_links = content.scan(/<link[^>]*stylesheet[^>]*>/i).length
    js_scripts = content.scan(/<script[^>]*src[^>]*>/i).length
    images = content.scan(/<img[^>]*src[^>]*>/i).length
    
    @results[:resources] = {
      total_size: content.bytesize,
      css_files: css_links,
      js_files: js_scripts,
      images: images,
      estimated_requests: css_links + js_scripts + images + 1 # +1 para HTML
    }
  end

  def generate_report
    puts "\n📊 Generando reporte de rendimiento..."
    
    total_time = Time.now - @start_time
    
    @results[:analysis_summary] = {
      url: @url,
      analyzed_at: Time.now.iso8601,
      analysis_duration: total_time.round(2),
      overall_score: calculate_overall_score,
      recommendations: generate_recommendations
    }
  end

  def calculate_overall_score
    score = 100
    
    # Penalizar por tiempo de respuesta lento
    avg_response = @results[:response_times][:average]
    score -= 20 if avg_response > 1000 # > 1s
    score -= 10 if avg_response > 500  # > 500ms
    
    # Penalizar por falta de HTTPS
    score -= 15 unless @results[:headers][:security][:https]
    
    # Penalizar por falta de compresión
    score -= 10 unless @results[:headers][:compression][:compressed]
    
    # Bonificar por buenas prácticas
    score += 5 if @results[:headers][:security][:hsts]
    score += 5 if @results[:headers][:cache_control]
    
    [score, 0].max # No permitir scores negativos
  end

  def generate_recommendations
    recommendations = []
    
    # Recomendaciones basadas en el análisis
    if @results[:response_times][:average] > 500
      recommendations << {
        priority: 'high',
        category: 'performance',
        title: 'Optimizar tiempo de respuesta del servidor',
        description: "El tiempo promedio de respuesta es #{@results[:response_times][:average]}ms. Considera optimizar consultas de base de datos y configuración del servidor."
      }
    end
    
    unless @results[:headers][:security][:https]
      recommendations << {
        priority: 'high',
        category: 'security',
        title: 'Implementar HTTPS',
        description: 'El sitio no usa HTTPS. Esto afecta la seguridad y el SEO.'
      }
    end
    
    unless @results[:headers][:compression][:compressed]
      recommendations << {
        priority: 'medium',
        category: 'performance',
        title: 'Habilitar compresión',
        description: 'Activa la compresión gzip/brotli para reducir el tamaño de transferencia.'
      }
    end
    
    if @results[:rails] && @results[:rails][:performance][:database_time] > 300
      recommendations << {
        priority: 'high',
        category: 'database',
        title: 'Optimizar consultas de base de datos',
        description: 'El tiempo de base de datos es alto. Revisa las consultas N+1 y añade índices.'
      }
    end
    
    recommendations
  end

  # Métodos auxiliares
  def count_redirects(uri, count = 0)
    return count if count > 5 # Evitar loops infinitos
    
    response = Net::HTTP.get_response(uri)
    
    if [301, 302, 303, 307, 308].include?(response.code.to_i)
      new_uri = URI(response['location'])
      count_redirects(new_uri, count + 1)
    else
      count
    end
  rescue
    count
  end

  def parse_server_timing(header)
    return {} unless header
    
    timings = {}
    header.split(',').each do |timing|
      if timing.match?(/(\w+);dur=(\d+\.?\d*)/)
        name = $1
        duration = $2.to_f
        timings[name] = duration
      end
    end
    timings
  end

  def estimate_query_count(runtime)
    # Estimación basada en tiempo de runtime típico
    case runtime
    when 0..50 then rand(1..3)
    when 51..200 then rand(3..8)
    when 201..500 then rand(8..15)
    else rand(15..30)
    end
  end

  def estimate_cache_performance
    # Estimación basada en headers de cache
    if @results[:headers][:cache_control]
      rand(70..90)
    else
      rand(20..50)
    end
  end

  def estimate_memory_usage
    # Estimación en MB basada en el tamaño de la respuesta
    base_memory = (@results[:resources][:total_size] / 1024.0 / 1024.0 * 2).round(1)
    [base_memory, 10.0].max # Mínimo 10MB
  end
end

# Script ejecutable
if __FILE__ == $0
  if ARGV.empty?
    puts "Uso: ruby performance_agent.rb <URL>"
    puts "Ejemplo: ruby performance_agent.rb https://example.com"
    exit 1
  end

  url = ARGV[0]
  agent = PerformanceAgent.new(url)
  
  begin
    results = agent.analyze
    
    puts "\n" + "="*60
    puts "📊 REPORTE DE RENDIMIENTO COMPLETADO"
    puts "="*60
    
    puts "\n🌐 Conectividad:"
    puts "  Status: #{results[:connectivity][:status]}"
    puts "  Tiempo de respuesta: #{results[:connectivity][:response_time]}ms"
    puts "  Exitoso: #{results[:connectivity][:success] ? '✅' : '❌'}"
    
    if results[:headers]
      puts "\n🔍 Headers:"
      puts "  Servidor: #{results[:headers][:server]}"
      puts "  HTTPS: #{results[:headers][:security][:https] ? '✅' : '❌'}"
      puts "  Compresión: #{results[:headers][:compression][:compressed] ? '✅' : '❌'}"
    end
    
    if results[:rails]
      puts "\n💎 Ruby/Rails:"
      puts "  Detectado: ✅"
      puts "  Runtime: #{results[:rails][:runtime]}ms" if results[:rails][:runtime]
      puts "  Versión: #{results[:rails][:version]}" if results[:rails][:version]
    end
    
    puts "\n📊 Puntuación general: #{results[:analysis_summary][:overall_score]}/100"
    
    unless results[:analysis_summary][:recommendations].empty?
      puts "\n💡 Recomendaciones:"
      results[:analysis_summary][:recommendations].each_with_index do |rec, i|
        puts "  #{i+1}. [#{rec[:priority].upcase}] #{rec[:title]}"
        puts "     #{rec[:description]}"
      end
    end
    
    # Guardar resultados en JSON
    output_file = "performance_report_#{Time.now.strftime('%Y%m%d_%H%M%S')}.json"
    File.write(output_file, JSON.pretty_generate(results))
    puts "\n💾 Reporte guardado en: #{output_file}"
    
  rescue => e
    puts "❌ Error durante el análisis: #{e.message}"
    puts e.backtrace if ENV['DEBUG']
    exit 1
  end
end