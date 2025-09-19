// First, install the required dependencies:
// npm install @supabase/supabase-js

// 1. Create supabase client configuration
// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Database Schema - Run this SQL in your Supabase SQL editor:
/*
-- Create prescriptions table
CREATE TABLE prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    prescription_file_url TEXT,
    prescription_file_name VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts from anyone (you might want to restrict this later)
CREATE POLICY "Allow prescription submissions" ON prescriptions
    FOR INSERT TO anon
    WITH CHECK (true);

-- Policy to allow pharmacy staff to view prescriptions (you'll need authentication for this)
CREATE POLICY "Allow staff to view prescriptions" ON prescriptions
    FOR SELECT TO authenticated
    USING (true);

-- Create storage bucket for prescription files
INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);

-- Create storage policy
CREATE POLICY "Allow prescription file uploads" ON storage.objects
    FOR INSERT TO anon
    WITH CHECK (bucket_id = 'prescriptions');

CREATE POLICY "Allow prescription file access to authenticated users" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'prescriptions');
*/

// 3. Updated PrescriptionUploadPage component with Supabase integration
import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Adjust path as needed
import { Upload } from 'lucide-react';

const PrescriptionUploadPage = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    email: "",
    prescriptionFile: null,
    notes: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const uploadPrescriptionFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `prescriptions/${fileName}`;

    const { data, error } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, file);

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    return {
      path: data.path,
      fileName: file.name,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      let prescriptionFileUrl = null;
      let prescriptionFileName = null;

      // Upload file if provided
      if (formData.prescriptionFile) {
        const uploadResult = await uploadPrescriptionFile(formData.prescriptionFile);
        prescriptionFileUrl = uploadResult.path;
        prescriptionFileName = uploadResult.fileName;
      }

      // Insert prescription data into database
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([
          {
            patient_name: formData.patientName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            prescription_file_url: prescriptionFileUrl,
            prescription_file_name: prescriptionFileName,
            notes: formData.notes,
            status: 'pending'
          }
        ])
        .select();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      // Success - reset form and show success message
      setFormData({
        patientName: "",
        phoneNumber: "",
        email: "",
        prescriptionFile: null,
        notes: "",
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      setSubmitStatus({
        type: 'success',
        message: 'Prescription submitted successfully! We will contact you within 24 hours.'
      });

      // Optional: Send confirmation email or SMS here
      // await sendConfirmationNotification(data[0]);

    } catch (error) {
      console.error('Prescription submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: `Failed to submit prescription: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Upload Prescription</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="font-semibold mb-4">How to Upload Your Prescription</h2>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Take a clear photo or scan of your prescription</li>
          <li>• Ensure all text is readable and the doctor's signature is visible</li>
          <li>• Supported formats: JPG, PNG, PDF (max 5MB)</li>
          <li>• Our pharmacist will verify your prescription within 24 hours</li>
        </ul>
      </div>

      {/* Status Messages */}
      {submitStatus.message && (
        <div className={`mb-6 p-4 rounded-lg ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient Name *
          </label>
          <input
            type="text"
            required
            value={formData.patientName}
            onChange={(e) =>
              setFormData({ ...formData, patientName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter patient's full name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your contact number"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your email address"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Prescription *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">JPG, PNG or PDF (max 5MB)</p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  prescriptionFile: e.target.files?.[0] || null,
                })
              }
              className="mt-4"
              required
              disabled={isSubmitting}
            />
            {formData.prescriptionFile && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {formData.prescriptionFile.name}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special instructions or questions..."
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? 'Submitting...' : 'Upload Prescription'}
        </button>
      </form>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Our licensed pharmacist will review your prescription</li>
          <li>2. We'll contact you within 24 hours with availability and pricing</li>
          <li>3. Once confirmed, we'll prepare your medication for delivery</li>
          <li>4. Your medication will be delivered safely to your address</li>
        </ol>
      </div>
    </div>
  );
};

// 4. Optional: Admin Dashboard Component to view prescriptions
const PrescriptionDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePrescriptionStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the list
      fetchPrescriptions();
    } catch (error) {
      console.error('Error updating prescription:', error);
    }
  };

  const downloadFile = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('prescriptions')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  React.useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading) return <div>Loading prescriptions...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Prescription Dashboard</h1>
      
      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{prescription.patient_name}</h3>
                <p className="text-gray-600">{prescription.email}</p>
                <p className="text-gray-600">{prescription.phone_number}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  prescription.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  prescription.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {prescription.status}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(prescription.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {prescription.notes && (
              <p className="text-gray-700 mb-4">
                <strong>Notes:</strong> {prescription.notes}
              </p>
            )}

            <div className="flex space-x-2">
              {prescription.prescription_file_url && (
                <button
                  onClick={() => downloadFile(prescription.prescription_file_url)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download File
                </button>
              )}
              
              <select
                value={prescription.status}
                onChange={(e) => updatePrescriptionStatus(prescription.id, e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { PrescriptionUploadPage, PrescriptionDashboard };