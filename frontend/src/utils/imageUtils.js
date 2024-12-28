import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { toast } from 'react-toastify';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const validateFile = (file) => {
  try {
    // Check if file exists and is an object
    if (!file || typeof file !== 'object') {
      console.error('Invalid file object:', file);
      toast.error('Invalid file object provided');
      return false;
    }

    // Log raw file for debugging
    console.log('Validating file:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      lastModified: file?.lastModified
    });

    // Check name property
    if (!file.name || typeof file.name !== 'string') {
      console.error('File missing valid name:', file);
      toast.error('File missing name property');
      return false;
    }

    // Check type property
    if (!file.type || typeof file.type !== 'string') {
      console.error('File missing valid type:', file);
      toast.error('File missing type property');
      return false;
    }

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      toast.error(`Invalid file type: ${file.name}. Please upload images only.`);
      return false;
    }

    // Validate file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!extension || !validExtensions.includes(extension)) {
      console.error('Invalid file extension:', extension);
      toast.error(`Invalid file extension: ${file.name}. Allowed: ${validExtensions.join(', ')}`);
      return false;
    }

    // Check size property and value
    if (typeof file.size !== 'number' || file.size === 0) {
      console.error('Invalid file size:', file.size);
      toast.error(`Invalid file size: ${file.name}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('File too large:', {
        size: file.size,
        maxSize: MAX_FILE_SIZE,
        name: file.name
      });
      toast.error(`File too large: ${file.name}. Maximum size is 5MB.`);
      return false;
    }

    // Additional validation passed
    console.log('File validation passed:', file.name);
    return true;
  } catch (error) {
    console.error('Error in validateFile:', {
      error: error.message,
      stack: error.stack,
      file: file ? {
        name: file.name,
        type: file.type,
        size: file.size
      } : 'No file'
    });
    toast.error('Error validating file');
    return false;
  }
};

export const handleImageSelection = (files, setImages, setPreviewUrls) => {
  if (!files || files.length === 0) {
    console.log('No files selected');
    return;
  }

  console.log('Raw files received:', files);

  // Convert FileList to Array and ensure proper File objects
  const fileArray = Array.from(files).map(file => {
    // If it's already a File object and valid, use it
    if (file instanceof File && file.name && file.type && file.size) {
      console.log('Valid File object:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      return file;
    }

    // If it's a Blob or similar, create a new File
    if (file instanceof Blob) {
      const fileName = file.name || `image-${Date.now()}.jpg`;
      const fileType = file.type || 'image/jpeg';
      
      console.log('Creating new File from Blob:', {
        name: fileName,
        type: fileType,
        size: file.size
      });
      
      return new File([file], fileName, {
        type: fileType,
        lastModified: file.lastModified || Date.now()
      });
    }

    // If it's neither, log error and return null
    console.error('Invalid file object:', file);
    return null;
  }).filter(Boolean); // Remove any null values

  console.log('Processed file array:', fileArray);

  // Filter valid files
  const validFiles = fileArray.filter(file => {
    try {
      // Verify file has required properties
      if (!file.name || !file.type || !file.size) {
        console.error('File missing required properties:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        toast.error('Invalid file: missing required properties');
        return false;
      }

      // Verify file type
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        toast.error(`${file.name} is not an image file`);
        return false;
      }

      // Verify file size
      if (file.size > MAX_FILE_SIZE) {
        console.error('File too large:', file.size);
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }

      // Verify file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        console.error('Invalid file extension:', extension);
        toast.error(`${file.name} has invalid extension`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating file:', error);
      return false;
    }
  });

  if (validFiles.length === 0) {
    toast.error('No valid images selected');
    return;
  }

  // Update images state with valid files
  setImages(prev => {
    const newFiles = validFiles.filter(file => {
      const isDuplicate = prev.some(p => 
        p.name === file.name && 
        p.size === file.size && 
        p.lastModified === file.lastModified
      );
      return !isDuplicate;
    });

    if (newFiles.length < validFiles.length) {
      toast.warning('Some images were skipped (duplicates)');
    }

    return [...prev, ...newFiles];
  });

  // Create previews
  validFiles.forEach(file => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrls(prev => {
        if (!prev.includes(reader.result)) {
          return [...prev, reader.result];
        }
        return prev;
      });
    };
    reader.readAsDataURL(file);
  });

  toast.success(`${validFiles.length} image(s) selected`);
};

export const uploadImages = async (images, folder, setUploadProgress) => {
  const imageUrls = [];
  let progress = 0;
  const increment = 100 / images.length;

  const uploadToast = toast.loading('Preparing to upload images...', {
    position: "bottom-right",
  });

  try {
    for (const [index, image] of images.entries()) {
      try {
        if (!image || !image.name) {
          console.error('Invalid image object:', image);
          continue;
        }

        console.log('Starting image upload...', image.name);
        
        toast.update(uploadToast, {
          render: `Uploading image ${index + 1} of ${images.length}...`,
        });

        // Ensure proper file extension
        const extension = image.name.split('.').pop()?.toLowerCase() || 
          image.type.split('/')[1] || 'jpg';
        
        // Clean the filename
        const baseName = image.name.split('.')[0]
          .replace(/[^a-zA-Z0-9]/g, '_')
          .toLowerCase();
        
        const uniqueFileName = `${folder}/${Date.now()}-${baseName}.${extension}`;
        console.log('Generated filename:', uniqueFileName);

        const storageRef = ref(storage, uniqueFileName);
        const metadata = {
          contentType: `image/${extension}`,
          customMetadata: {
            originalName: image.name,
            uploadedAt: new Date().toISOString()
          }
        };
        
        const uploadResult = await uploadBytes(storageRef, image, metadata);
        console.log('Image uploaded successfully', uploadResult);
        
        const url = await getDownloadURL(uploadResult.ref);
        console.log('Image URL obtained:', url);
        
        imageUrls.push(url);
        
        progress += increment;
        if (setUploadProgress) {
          setUploadProgress(Math.min(Math.round(progress), 100));
        }

        toast.update(uploadToast, {
          render: `Successfully uploaded ${index + 1} of ${images.length} images`,
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
      } catch (error) {
        console.error('Upload error details:', {
          image: image?.name,
          error: error.message
        });
        toast.error(`Failed to upload ${image?.name || 'image'}: ${error.message}`);
      }
    }
  } finally {
    toast.dismiss(uploadToast);
  }

  return imageUrls;
};

export const ImagePreview = ({ url, onRemove, index }) => (
  <div className="relative group aspect-square animate-fadeIn">
    <img
      src={url}
      alt={`Preview ${index + 1}`}
      className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
    />
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110 hover:bg-red-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export const UploadProgress = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
    <div
      className="bg-red-600 h-2.5 rounded-full transition-all duration-300 ease-out animate-widthExpand"
      style={{ width: `${progress}%` }}
    >
      <div className="h-full w-full bg-white/30 animate-shimmer"></div>
    </div>
  </div>
);

export const ImageUploadZone = ({ onDrop, onDragOver, onChange }) => (
  <div
    onDrop={onDrop}
    onDragOver={onDragOver}
    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-all duration-200 transform hover:scale-[1.01] cursor-pointer"
  >
    <input
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      onChange={onChange}
      className="hidden"
      id="image-upload"
    />
    <label htmlFor="image-upload" className="cursor-pointer">
      <div className="space-y-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600">Drag and drop images here, or click to select files</p>
        <p className="text-sm text-gray-500">Accepted formats: JPEG, PNG, WebP</p>
        <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
      </div>
    </label>
  </div>
); 