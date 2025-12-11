import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { Save, Building, Mail, Phone, MapPin, FileText, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface SettingsEditorProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsEditor: React.FC<SettingsEditorProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit roughly
        alert("File size too large. Please use an image under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logoUrl: undefined });
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your business details and invoice configuration</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            
            {/* Logo Section */}
            <div className="border-b border-gray-100 pb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ImageIcon size={20} className="text-maldives-600" /> Business Logo
              </h3>
              
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {formData.logoUrl ? (
                    <div className="relative group">
                      <div className="w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                          src={formData.logoUrl} 
                          alt="Business Logo" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove Logo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={24} className="mb-2" />
                      <span className="text-xs text-center px-2">No Logo</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Upload Logo</label>
                  <p className="text-xs text-gray-500 mb-3">
                    Recommended size: 300x300px. Max size: 500KB.
                    Supported formats: PNG, JPG.
                  </p>
                  <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload size={16} className="mr-2 text-gray-500" />
                    Select Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building size={20} className="text-maldives-600" /> Business Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.businessName}
                    onChange={e => setFormData({...formData, businessName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Tagline</label>
                  <input 
                    type="text" 
                    value={formData.businessSubtitle}
                    onChange={e => setFormData({...formData, businessSubtitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">GST TIN Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.gstTin}
                    onChange={e => setFormData({...formData, gstTin: e.target.value})}
                    placeholder="e.g. 1010101GST001"
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">This will be displayed on your invoices.</p>
              </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-maldives-600" /> Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> Email
                  </label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" /> Phone
                  </label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <textarea 
                  rows={3}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-maldives-500 outline-none resize-none"
                />
              </div>
            </div>

          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-4">
            {saved && (
              <span className="text-sm text-green-600 font-medium animate-fade-in">
                Settings saved successfully!
              </span>
            )}
            <button 
              type="submit"
              className="px-6 py-2.5 bg-maldives-600 hover:bg-maldives-700 text-white rounded-lg flex items-center gap-2 shadow-sm font-medium transition-colors"
            >
              <Save size={18} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsEditor;