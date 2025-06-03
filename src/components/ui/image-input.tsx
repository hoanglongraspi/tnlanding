import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Link as LinkIcon, 
  AlertCircle,
  CheckCircle,
  Globe
} from 'lucide-react';
import FileUpload from './file-upload';
import { convertGoogleDriveImageUrl } from '@/lib/utils';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  bucket?: string;
  folder?: string;
  showGoogleDriveHelp?: boolean;
  maxSize?: number;
}

const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter image URL or upload a file",
  required = false,
  className = '',
  bucket = 'images',
  folder = 'uploads',
  showGoogleDriveHelp = true,
  maxSize = 5,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlValue, setUrlValue] = useState(value);
  const [uploadError, setUploadError] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');

  // Update local state when value prop changes (important for edit mode)
  useEffect(() => {
    setUrlValue(value);
  }, [value]);

  const handleUrlChange = (newUrl: string) => {
    setUrlValue(newUrl);
    setUrlError('');
    
    if (newUrl.trim()) {
      // Convert Google Drive URLs automatically
      const convertedUrl = convertGoogleDriveImageUrl(newUrl);
      onChange(convertedUrl);
    } else {
      onChange('');
    }
  };

  const handleUploadSuccess = (uploadedUrl: string) => {
    setUploadError('');
    onChange(uploadedUrl);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
  };

  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com');
  };

  const hasValue = Boolean(value);

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="text-white text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>

      <Tabs value={inputMode} onValueChange={(mode) => setInputMode(mode as 'upload' | 'url')}>
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger 
            value="upload" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger 
            value="url" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Enter URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <FileUpload
            onUpload={handleUploadSuccess}
            onError={handleUploadError}
            accept="image/*"
            maxSize={maxSize}
            bucket={bucket}
            folder={folder}
            currentValue={value}
            placeholder="Upload an image file"
            preview={true}
          />
          {uploadError && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-3">
            <Input
              value={urlValue}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="bg-gray-700 border-gray-600 text-white"
            />
            
            {/* Google Drive URL Detection */}
            {urlValue && isGoogleDriveUrl(urlValue) && (
              <div className="flex items-start space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-green-400 text-sm font-medium">✅ Google Drive URL detected</p>
                  <p className="text-gray-300 text-xs">
                    Will be automatically converted to direct image URL for better performance
                  </p>
                  {value !== urlValue && (
                    <p className="text-xs text-gray-400 font-mono bg-gray-800/50 p-1 rounded">
                      → {value}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Image Preview */}
            {value && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Preview:</p>
                <img
                  src={value}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg object-cover border border-gray-600"
                  onError={() => setUrlError('Failed to load image from this URL')}
                  onLoad={() => setUrlError('')}
                />
              </div>
            )}

            {urlError && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{urlError}</span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Google Drive Help */}
      {showGoogleDriveHelp && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Globe className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-blue-400 text-xs font-medium">💡 Google Drive Support</p>
              <div className="text-gray-300 text-xs space-y-1">
                <p>• Paste Google Drive sharing links - they'll be auto-converted</p>
                <p>• Make sure files are shared as "Anyone with the link"</p>
                <p>• Example: https://drive.google.com/file/d/FILE_ID/view</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageInput; 