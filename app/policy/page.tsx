'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Lock, UserCheck, Database, Cookie, RefreshCcw, Mail } from 'lucide-react';

export default function PolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Policies</h1>
        </div>

        {/* Title Section */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">SolarXpert Policies</h2>
              <p className="text-muted-foreground text-sm">Solar Energy Management System</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            This document outlines the policies governing the use of the SolarXpert platform, 
            including privacy practices, terms of service, data handling, and user responsibilities. 
            By accessing or using SolarXpert, you agree to comply with all policies described below.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Last Updated: January 2026
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">1. Privacy Policy</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              SolarXpert is committed to protecting the privacy of all users, including administrators, 
              registrars, engineers, partners, and customers. This policy explains how we collect, use, 
              and safeguard your personal information.
            </p>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Personal Information:</strong> Name, email address, phone number, and location details provided during registration.</li>
                <li><strong>Account Data:</strong> Login credentials, role assignments, and authentication history.</li>
                <li><strong>System Data:</strong> Solar installation details, system size, energy consumption patterns, and maintenance records.</li>
                <li><strong>Usage Data:</strong> Pages visited, features accessed, and interaction logs within the platform.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">How We Use Your Information</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide and maintain the SolarXpert platform and its services.</li>
                <li>To manage user accounts, roles, and access permissions.</li>
                <li>To process service requests, installations, and subscription management.</li>
                <li>To send important notifications regarding system updates, maintenance, and billing.</li>
                <li>To improve platform functionality and user experience.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Protection</h4>
              <p>
                We implement industry-standard security measures including encryption, secure authentication, 
                and role-based access control to protect your data from unauthorized access, alteration, 
                or disclosure. All data is stored securely in compliance with applicable data protection regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">2. Terms of Service</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              By accessing the SolarXpert platform, you agree to the following terms and conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate and complete information during registration and maintain the confidentiality of your login credentials.</li>
              <li>You are responsible for all activities conducted under your account.</li>
              <li>Unauthorized access, data manipulation, or interference with platform operations is strictly prohibited.</li>
              <li>SolarXpert reserves the right to suspend or terminate accounts that violate these terms.</li>
              <li>The platform is provided "as is" without warranties of any kind, express or implied.</li>
              <li>SolarXpert may update these terms periodically. Continued use of the platform constitutes acceptance of revised terms.</li>
            </ul>
          </div>
        </div>

        {/* User Roles & Access */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">3. User Roles & Access Policy</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              SolarXpert provides role-based access to ensure appropriate permissions and data visibility:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Administrator</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full platform access and configuration</li>
                  <li>Manage customers, agents, and engineers</li>
                  <li>Oversee subscriptions and services</li>
                  <li>Access to all system reports and analytics</li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Registrar</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Register and manage customer accounts</li>
                  <li>Process subscription enrollments</li>
                  <li>Manage service request assignments</li>
                  <li>View customer and service information</li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Engineer</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>View assigned service requests</li>
                  <li>Manage installations and maintenance</li>
                  <li>Access customer lookup for assigned tasks</li>
                  <li>Update service status and documentation</li>
                </ul>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Partner</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Access via mobile application</li>
                  <li>View assigned customer information</li>
                  <li>Track sales and customer assignments</li>
                  <li>Limited access to platform features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Usage & Security */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">4. Data Usage & Security Policy</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Collection</h4>
              <p>
                SolarXpert collects data necessary for the operation of solar energy management services, 
                including customer information, system specifications, service history, and subscription details.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Storage & Retention</h4>
              <p>
                All data is stored in secure cloud infrastructure with encryption at rest and in transit. 
                Data is retained for the duration of the customer relationship and as required by applicable 
                laws and regulations. Customers may request data deletion in accordance with privacy regulations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Sharing</h4>
              <p>
                We do not sell or rent personal data to third parties. Data may be shared with authorized 
                personnel within the SolarXpert platform for service delivery purposes, or with regulatory 
                authorities when required by law.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Security Measures</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Secure authentication with role-based access control</li>
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Firebase security rules for database protection</li>
                <li>Session management and automatic timeout</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Service & Subscription Policy */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCcw className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">5. Service & Subscription Policy</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Service Requests</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Service requests must be submitted through the platform with accurate details.</li>
                <li>Requests are assigned to available engineers based on expertise and location.</li>
                <li>Service status updates are provided in real-time through the platform.</li>
                <li>Emergency maintenance requests are prioritized accordingly.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Subscriptions</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Subscription plans are defined by the administrator and may be modified with notice.</li>
                <li>Billing is processed according to the selected plan terms.</li>
                <li>Subscription renewals are automatic unless cancelled before the renewal date.</li>
                <li>Customers are notified of any changes to subscription terms in advance.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Installations</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Installation schedules are coordinated between customers and assigned engineers.</li>
                <li>All installations comply with local regulations and safety standards.</li>
                <li>Post-installation inspections and documentation are completed through the platform.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cookie Policy */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">6. Cookie Policy</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              SolarXpert uses cookies and similar technologies to enhance your browsing experience and 
              provide essential platform functionality:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for authentication and secure session management.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and role-based settings.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand platform usage to improve performance.</li>
            </ul>
            <p>
              You can control cookie preferences through your browser settings. However, disabling essential 
              cookies may prevent you from accessing certain platform features.
            </p>
          </div>
        </div>

        {/* Refund & Cancellation Policy */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCcw className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">7. Refund & Cancellation Policy</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscription cancellations must be submitted at least 7 days before the next billing cycle.</li>
              <li>Refunds for unused subscription periods are processed within 10-15 business days.</li>
              <li>Service fees for completed work are non-refundable.</li>
              <li>Deposits for installations are refundable if cancellation occurs before work begins.</li>
              <li>Refund requests are reviewed and processed by the administrator.</li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-card rounded-xl shadow-lg border border-border p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-primary" size={20} />
            <h3 className="text-xl font-semibold text-foreground">8. Contact Information</h3>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              For questions, concerns, or requests regarding these policies, please contact our support team:
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p><strong>Email:</strong> support@solarxpert.com</p>
              <p><strong>Phone:</strong> +91 98765-43210</p>
              <p><strong>Address:</strong> SolarXpert Headquarters, Mumbai, Maharashtra, India</p>
              <p><strong>Support Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2026 SolarXpert. All rights reserved.</p>
          <p className="mt-1">Solar Energy Management System</p>
        </div>
      </div>
    </div>
  );
}