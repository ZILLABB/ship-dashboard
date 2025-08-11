// Settings page with glassmorphism design

'use client';

import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { formatAddress, getRoleDisplayName } from '@/lib/utils';

export default function SettingsPage() {
  const { address, roles, user } = useUserStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddress, setShowAddress] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    deliveryUpdates: true,
    signatureRequests: true,
    paymentReceived: true,
    roleAssignments: false,
  });
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'advanced', label: 'Advanced', icon: Globe },
  ];

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="glass-input w-full"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input w-full"
              placeholder="Enter your email"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connected Address
            </label>
            <div className="flex items-center gap-2">
              <div className="glass-input flex-1 font-mono text-sm">
                {showAddress ? address : formatAddress(address || '')}
              </div>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="glass-button p-2"
              >
                {showAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map(role => (
                <span
                  key={role}
                  className="glass px-3 py-1 rounded-full text-sm text-gray-700"
                >
                  {getRoleDisplayName(role)}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </p>
              <p className="text-sm text-white/60">
                Get notified about {key.toLowerCase().replace(/([A-Z])/g, ' $1')}
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value ? 'bg-blue-600' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="glass p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-medium text-white">Wallet Connected</span>
            </div>
            <p className="text-sm text-white/70">
              Your wallet is securely connected and all transactions require your signature.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-white">Security Tips</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Never share your seed phrase with anyone</li>
              <li>• Always verify transaction details before signing</li>
              <li>• Keep your wallet software updated</li>
              <li>• Use hardware wallets for large amounts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Theme
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="glass-input w-full"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="glass-input w-full"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="glass p-4 rounded-lg border border-yellow-400/30">
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-white">Development Mode</span>
            </div>
            <p className="text-sm text-white/70 mb-3">
              This application is running in development mode with mock data and simulated blockchain interactions.
            </p>
            <div className="text-xs text-white/60 space-y-1">
              <p>• Wallet connections are simulated</p>
              <p>• Transactions are mocked</p>
              <p>• Real-time updates are simulated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'glass bg-white/20 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
