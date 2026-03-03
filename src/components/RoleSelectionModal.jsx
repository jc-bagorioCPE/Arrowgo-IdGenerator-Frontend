import React, { useState } from 'react';
import { X, Shield, User, ChevronRight } from 'lucide-react';
import LoginModal from '../components/LandingPage/Login'; // Adjust path as needed
import VerifyEmployeeModal from '@/pages/Public/VerifyEmployee';

export default function RoleSelectionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showVerifyEmployee, setShowVerifyEmployee] = useState(false);

  const roles = [
    {
      type: 'admin',
      title: 'Admin / HR',
      description: 'Access admin dashboard, verify employees, and manage ID generation',
      icon: Shield,
      color: 'from-green-600 to-emerald-600',
      hoverColor: 'hover:from-green-700 hover:to-emerald-700',
    },
    {
      type: 'employee',
      title: 'Employee',
      description: 'Register, upload documents, and claim your employee ID',
      icon: User,
      color: 'from-blue-600 to-cyan-600',
      hoverColor: 'hover:from-blue-700 hover:to-cyan-700',
    },
  ];

  const handleRoleSelect = (roleType) => {
    if (roleType === 'admin') {
      // Close role selection modal
      setIsOpen(false);
      // Open admin login modal after animation
      setTimeout(() => {
        setShowAdminLogin(true);
      }, 200);
    } else {
      // Navigate to employee registration
      setIsOpen(false);
      setShowVerifyEmployee(true);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-800 transition-colors"
      >
        Get Started
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-green-600 to-blue-600 px-8 py-10 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Welcome to ARROWGO
              </h2>
              <p className="text-green-50 text-lg">
                Choose your role to continue
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="p-8 space-y-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.type}
                    onClick={() => handleRoleSelect(role.type)}
                    className={`w-full group relative overflow-hidden bg-gradient-to-r ${role.color} ${role.hoverColor} rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    </div>

                    {/* Content */}
                    <div className="relative flex items-center gap-6">
                      {/* Icon */}
                      <div className="flex-shrink-0 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>

                      {/* Text */}
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {role.title}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {role.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  Need help choosing?{' '}
                  <button className="text-green-600 hover:text-green-700 font-semibold underline">
                    Contact Support
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Employee Modal */}
      <VerifyEmployeeModal 
        open={showVerifyEmployee} 
        onOpenChange={setShowVerifyEmployee}
      />
      
      {/* Admin Login Modal */}
      <LoginModal 
        open={showAdminLogin} 
        onOpenChange={setShowAdminLogin}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}