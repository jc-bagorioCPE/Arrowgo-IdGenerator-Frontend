import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Book,
  FileText,
  User,
  Shield,
  QrCode,
  Camera,
  CheckCircle,
  Upload,
  Printer,
  Users,
  Lock,
  Clock,
  ArrowRight,
  ChevronDown,
  Github,
  Linkedin,
  Mail,
  Code
} from 'lucide-react';

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'features', label: 'Features', icon: CheckCircle },
    { id: 'workflow', label: 'Workflow', icon: ArrowRight },
    { id: 'roles', label: 'User Roles', icon: Users },
    { id: 'developer', label: 'Developer', icon: Code },
  ];

  const features = [
    {
      icon: Users,
      title: 'Employee Registration',
      description: 'Streamlined registration process where employees can create their profiles, upload required documents, and submit their information for admin review.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Camera,
      title: 'Photo & Signature Capture',
      description: 'Built-in camera functionality allows employees to capture their photo and signature directly through the system or upload existing images.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: QrCode,
      title: 'QR Code Generation',
      description: 'Automatic generation of unique QR codes for each employee ID, enabling quick verification, tracking, and secure identification.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Admin Verification',
      description: 'Robust admin dashboard for HR personnel to review, approve, or reject employee registrations with complete access control.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Printer,
      title: 'ID Card Printing',
      description: 'Generate print-ready employee ID cards with all necessary information, photo, signature, and QR code in a professional format.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Clock,
      title: 'ID Claiming System',
      description: 'Organized claiming page where employees can check the status of their ID and claim it once approved and printed by HR.',
      color: 'from-teal-500 to-green-500'
    },
  ];

  const workflow = [
    {
      step: 1,
      title: 'Employee Registration',
      description: 'Employee completes the registration form with personal information',
      icon: User
    },
    {
      step: 2,
      title: 'Document Upload',
      description: 'Upload required documents, photo, and signature',
      icon: Upload
    },
    {
      step: 3,
      title: 'QR Code Generation',
      description: 'System automatically generates unique QR code for approved ID',
      icon: QrCode
    },
    {
      step: 4,
      title: 'Admin Review and Creating ID',
      description: 'HR admin reviews and creates an ID for the employee based on the submitted information',
      icon: FileText
    },
    {
      step: 5,
      title: 'ID Printing',
      description: 'Admin prints the employee ID card',
      icon: Printer
    },
    {
      step: 6,
      title: 'Secure Database Storage',
      description: 'Employee data is encrypted and securely stored in the database',
      icon: Shield
    },
    {
      step: 7,
      title: 'ID Claiming',
      description: 'Admin claims the ID from the claiming page once the employee claims their ID in person',
      icon: CheckCircle
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Book className="h-5 w-5" />
              <span className="text-sm font-semibold">System Documentation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              ARROWGO ID Generator
            </h1>
            <p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto leading-relaxed">
              A comprehensive employee ID generation and management system designed for modern organizations
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === section.id
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                      <Book className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">System Overview</h2>
                  </div>
                  <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                    <p className="text-lg leading-relaxed">
                      The <strong>ARROWGO ID Generator</strong> is a modern, web-based employee identification management system designed to streamline the entire ID card creation process for organizations. From employee registration to ID card printing and claiming, the system provides a complete end-to-end solution.
                    </p>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-6 rounded-r-xl my-6">
                      <h3 className="text-xl font-bold text-green-800 mb-2">Purpose</h3>
                      <p className="text-gray-700">
                        To eliminate manual, paper-based ID generation processes and provide organizations with a secure, efficient, and user-friendly digital platform for managing employee identification cards with integrated QR code technology for enhanced security and verification.
                      </p>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-4">Key Benefits</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <span><strong>Efficiency:</strong> Reduces ID processing time from days to hours</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <span><strong>Security:</strong> QR code verification and admin authentication</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <span><strong>Accuracy:</strong> Digital validation reduces human errors</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        <span><strong>Transparency:</strong> Real-time status tracking for employees</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">System Features</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {features.map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                          <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Workflow Section */}
            {activeSection === 'workflow' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                      <ArrowRight className="h-6 w-6 text-purple-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">System Workflow</h2>
                  </div>
                  <div className="space-y-6">
                    {workflow.map((step, index) => {
                      const IconComponent = step.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="flex gap-6 items-start"
                        >
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {step.step}
                              </div>
                              {index < workflow.length - 1 && (
                                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-green-600 to-emerald-600"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex-grow bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <IconComponent className="h-5 w-5 text-green-600" />
                              <h3 className="text-xl font-bold text-gray-800">
                                {step.title}
                              </h3>
                            </div>
                            <p className="text-gray-600">
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* User Roles Section */}
            {activeSection === 'roles' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">User Roles & Permissions</h2>
                  </div>

                  {/* Admin Role */}
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-8 w-8" />
                        <h3 className="text-2xl font-bold">Admin / HR Personnel</h3>
                      </div>
                      <p className="text-green-50">
                        Full system access with administrative privileges
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                      {[
                        'Review and verify employee registrations',
                        'Approve or reject ID applications',
                        'Generate and manage QR codes',
                        'Print employee ID cards',
                        'Access admin dashboard and analytics',
                        'Manage employee database',
                        'Update ID claiming status',
                        'System configuration and settings'
                      ].map((permission, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Role */}
                  <div>
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="h-8 w-8" />
                        <h3 className="text-2xl font-bold">Employee</h3>
                      </div>
                      <p className="text-blue-50">
                        Limited access for registration and ID claiming
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pl-4">
                      {[
                        'Complete registration form',
                        'Upload personal documents',
                        'Capture or upload photo',
                        'Capture or upload signature',
                        'View application status',
                        'Check ID claiming page',
                        'Claim approved ID cards',
                      ].map((permission, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Developer Section */}
            {activeSection === 'developer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                      <Code className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Developer Information</h2>
                  </div>

                  {/* Developer Card */}
                  <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-xl">
                          <span className="text-4xl font-bold">JB</span>
                        </div>
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">
                          JOHN CARLO BAGORIO
                        </h3>
                        <p className="text-xl text-green-600 font-semibold mb-4">
                          Full Stack Developer
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          Creator and web developer of the ARROWGO ID Generator system. Specialized in building modern web applications with focus on user experience, security, and scalability.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                          <a
                            href="mailto:johncarlo.bagorio@example.com"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <Mail className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700 font-medium">Email</span>
                          </a>
                          <a
                            href="#"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <Github className="h-4 w-4 text-gray-700" />
                            <span className="text-gray-700 font-medium">GitHub</span>
                          </a>
                          <a
                            href="#"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                          >
                            <Linkedin className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700 font-medium">LinkedIn</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 fxlex items-center gap-2">
                      <Code className="h-6 w-6 text-green-600" />
                      Technology Stack
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { category: 'Frontend', techs: ['Vite React.js', 'Tailwind CSS', 'Framer Motion', 'Shadcn UI'] },
                        { category: 'Backend', techs: ['Node.js', 'Express.js', 'MYSQL'] },
                        { category: 'Features', techs: ['QR Code Generation', 'Image Upload', 'PDF Generation'] }
                      ].map((stack, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                          <h4 className="font-bold text-gray-800 mb-3">{stack.category}</h4>
                          <ul className="space-y-2">
                            {stack.techs.map((tech, i) => (
                              <li key={i} className="flex items-center gap-2 text-gray-600">
                                <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                {tech}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">Project Information</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-green-50">
                      <div>
                        <span className="font-semibold">Project Name:</span> ARROWGO ID Generator
                      </div>
                      <div>
                        <span className="font-semibold">Version:</span> 1.0.0
                      </div>
                      <div>
                        <span className="font-semibold">Release Date:</span> 2026
                      </div>
                      <div>
                        <span className="font-semibold">License:</span> Proprietary
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-2">ARROWGO ID Generator</h3>
            <p className="text-gray-400">Developed by John Carlo Bagorio</p>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 ARROWGO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}