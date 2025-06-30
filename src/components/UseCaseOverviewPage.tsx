import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { 
  ArrowLeft, 
  Award,
  Target,
  CheckCircle,
  ExternalLink,
  Github,
  Sparkles,
  Brain,
  Cloud,
  Code,
  Database,
  Smartphone
} from 'lucide-react'

export default function UseCaseOverviewPage() {
  const navigate = useNavigate()
  const [activeSection] = useState<string>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Landing Page
          </Button>
          
          <div className="text-center mb-8">
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ki-green to-blue-500 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                  Technical Use Case Portfolio
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Perfect Zenkai • Enterprise-Grade Development Showcase
                </p>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                A comprehensive demonstration of modern software engineering excellence, 
                showcasing enterprise-grade architecture, cloud integration, AI implementation, 
                and best practices across the entire software development lifecycle.
              </p>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-ki-green">96.6%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Code Quality</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-500">12+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Domain Modules</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-500">5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Agents</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-500">90%+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Test Coverage</div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-500">90+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lighthouse Score</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Executive Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <Card className="border-l-4 border-l-ki-green">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-ki-green" />
                    Executive Summary
                  </CardTitle>
                  <CardDescription>
                    Perfect Zenkai represents a flagship demonstration of modern enterprise software development
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      Perfect Zenkai is a production-ready Progressive Web Application that demonstrates 
                      mastery across five critical domains of modern software engineering. Built as a 
                      comprehensive wellness and productivity platform, it showcases enterprise-grade 
                      architecture patterns, cloud-native deployment, AI integration, and industry-leading 
                      development practices.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ki-green" />
                        Business Value Delivered
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Complete offline-first wellness tracking platform</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>AI-powered personal insights and recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Enterprise-grade security and data protection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Cross-platform mobile and desktop experience</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Code className="h-4 w-4 text-ki-green" />
                        Technical Excellence
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>TypeScript with 100% type safety</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Comprehensive test coverage (90%+)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Modern React patterns and hooks</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Performance optimization and caching</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technology Stack */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    Core Technology Stack
                  </CardTitle>
                  <CardDescription>
                    Modern enterprise-grade technologies and frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="font-semibold">AI & ML</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">OpenAI GPT-4</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Cloud className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="font-semibold">Cloud</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Azure Functions</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="font-semibold">Database</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Supabase</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="font-semibold">Mobile</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">PWA</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://github.com/Perfectz/PerfectZenkai', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  View Source Code
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Try Live Demo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 