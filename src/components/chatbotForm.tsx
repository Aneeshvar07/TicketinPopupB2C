import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Send, MessageSquare } from 'lucide-react';
import LogoElc from '../assets/logo.png';


interface ChatFormData {
  name: string;
  phone: string;
  email: string;
  instituteName: string;
  problemType: string;
  problemDescription: string;
  image: File | null;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  instituteName?: string;
  problemType?: string;
  problemDescription?: string;
}

const ChatbotForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // All the required fields of the ticketing form 
  const [formData, setFormData] = useState<ChatFormData>({
    name: '',
    phone: '',
    email: '',
    instituteName: '',
    problemType: '',
    problemDescription: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/institutes')
      .then(res => res.ok ? res.json() : Promise.reject('No API'))
      .catch(() => {
        console.log('Error in filling your form');
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    }
    
    if (!formData.problemType.trim()) {
      newErrors.problemType = 'Problem type is required';
    }
    
    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = 'Problem description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    
    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('phone', formData.phone);
    submissionData.append('email', formData.email);
    submissionData.append('instituteName', formData.instituteName);
    submissionData.append('problemType', formData.problemType);
    submissionData.append('problemDescription', formData.problemDescription);
    if (formData.image) {
      submissionData.append('fileUpload', formData.image);
    }

    try {
      const response = await fetch(' https://48e6-103-106-138-4.ngrok-free.app/support/create', {
        method: 'POST',
        body: submissionData
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const responseData = await response.json();
      console.log('Response from backend:', responseData);
      console.log('Submitting form data:');
      for(const [key, value] of submissionData.entries()) {
        console.log(`${key}:`, value);
      }

      // Reset form after submission
      setFormData({ 
        name: '',  
        phone: '', 
        email: '', 
        instituteName: '', 
        problemType: '',
        problemDescription: '',
        image: null
      });
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
      setErrors({});
      
      // Hide loading and show success popup
      setIsLoading(false);
      setShowSuccessPopup(true);
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setIsLoading(false);
      alert('Something went wrong. Please try again later.');
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  const toggleChatbot = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Creating your ticket...</h3>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className={`absolute bottom-16 right-4 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          Need Help?
          <div className="absolute top-full right-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700"></div>
        </div>

        {/* Chat form */}
        <div className={`absolute bottom-20 right-0 w-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-2xl transition-all duration-300 transform ${!isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
          {/* Header */}
          <div className="p-6 text-center border-b border-blue-200">
            <div className="flex justify-center mb-4">
              <img 
                src={LogoElc} 
                alt="Company Logo" 
                className="max-h-24 object-contain"
              />
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Hey! Drop us the issue details below and we will get back to you asap :)
            </p>
          </div>

          
          <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your registered phone number"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                />              
                {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <label htmlFor="instituteName" className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
                <input
                  type="text"
                  id="instituteName"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleChange}
                  placeholder="Enter Institute Name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.instituteName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.instituteName && <span className="text-red-500 text-xs mt-1 block">{errors.instituteName}</span>}
              </div>

              <div>
                <label htmlFor="problemType" className="block text-sm font-medium text-gray-700 mb-1">Problem Type</label>
                <input 
                  type="text"
                  id="problemType"
                  name="problemType"
                  value={formData.problemType}
                  onChange={handleChange}
                  placeholder="e.g Login issue, Payment issue, UI issue"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.problemType ? 'border-red-500' : 'border-gray-300'}`}
                />       
                {errors.problemType && <span className="text-red-500 text-xs mt-1 block">{errors.problemType}</span>}
              </div>

              <div>
                <label htmlFor="problemDescription" className="block text-sm font-medium text-gray-700 mb-1">Problem Description</label>
                <textarea
                  id="problemDescription"
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleChange}
                  placeholder="Elaborate your problem in detail"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.problemDescription ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.problemDescription && <span className="text-red-500 text-xs mt-1 block">{errors.problemDescription}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attach Screenshot (optional)</label>
                <div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Upload size={16} />
                    <span>Upload Image</span>
                  </button>
                </div>

                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-200 font-medium"
              >
                <Send size={16} />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>

        
        <button
          onClick={toggleChatbot}
          className="w-14 h-14 bg-gradient-to-r from-orange-400 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
          aria-label={isOpen ? "Close support chat" : "Open support chat"}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>

        {/* Success Popup */}
        {showSuccessPopup && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={closeSuccessPopup} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-2xl z-[70] max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {formData.name}, your ticket has been created successfully!
              </h3>
              <button 
                onClick={closeSuccessPopup}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatbotForm;