import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  File
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  bucket?: string;
  folder?: string;
  className?: string;
  preview?: boolean;
  currentValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  onError,
  accept = 'image/*',
  maxSize = 5,
  bucket = 'images',
  folder = 'uploads',
  className = '',
  preview = true,
  currentValue = '',
  placeholder = 'Upload file or drag and drop',
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileName = (originalName: string) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  };

  const uploadFile = useCallback(async (file: File) => {
    if (disabled) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File size must be less than ${maxSize}MB`;
      onError?.(error);
      return;
    }

    // Validate file type
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      const error = `File type not supported. Please upload ${accept} files.`;
      onError?.(error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileName = generateFileName(file.name);
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onUpload(publicUrl);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [disabled, maxSize, accept, bucket, folder, onUpload, onError]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = () => {
    setPreviewUrl('');
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-500/10' 
            : disabled 
            ? 'border-gray-600 bg-gray-800/50'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 text-blue-400 mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">Uploading...</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        ) : previewUrl ? (
          <div className="space-y-4">
            {preview && isImage(previewUrl) ? (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg object-cover"
                />
                <Button
                  onClick={removeFile}
                  size="sm"
                  variant="ghost"
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 h-6 w-6"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">File uploaded</span>
                </div>
                <Button
                  onClick={removeFile}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              Replace File
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <ImageIcon className="w-12 h-12 text-gray-500 mx-auto" />
            <div className="space-y-2">
              <p className="text-gray-300 font-medium">{placeholder}</p>
              <p className="text-gray-500 text-sm">
                {accept.includes('image') ? 'PNG, JPG, GIF, WEBP' : 'Various file types'} up to {maxSize}MB
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </div>

      {/* Error display */}
      <div className="min-h-[20px]">
        {/* Error state will be handled by parent component */}
      </div>
    </div>
  );
};

export default FileUpload; 