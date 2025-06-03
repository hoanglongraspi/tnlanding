import CryptoJS from 'crypto-js';

interface AdminCredentials {
  email: string;
  password: string;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
}

// Fixed admin credentials
const FIXED_ADMIN_EMAIL = 'admin@tunguyen.film';
const FIXED_ADMIN_PASSWORD = '0x0nhiMdmWEk%doh';

// Hash password with salt
const hashPassword = (password: string): string => {
  const salt = CryptoJS.lib.WordArray.random(32).toString();
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
  return `${salt}:${hash}`;
};

// Verify password against hash
const verifyPassword = (password: string, hash: string): boolean => {
  const [salt, originalHash] = hash.split(':');
  const testHash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
  return testHash === originalHash;
};

// Initialize admin credentials with fixed values
export const initializeAdminCredentials = (): AdminCredentials => {
  const credentials: AdminCredentials = {
    email: FIXED_ADMIN_EMAIL,
    password: FIXED_ADMIN_PASSWORD,
    passwordHash: hashPassword(FIXED_ADMIN_PASSWORD),
    createdAt: new Date().toISOString()
  };
  
  // Store in localStorage (in production, use a secure backend)
  localStorage.setItem('tn_admin_credentials', JSON.stringify({
    email: credentials.email,
    passwordHash: credentials.passwordHash,
    createdAt: credentials.createdAt
  }));
  
  return credentials;
};

// Get or create admin credentials
export const getOrCreateAdminCredentials = (): { email: string; password?: string; isNew: boolean } => {
  const stored = localStorage.getItem('tn_admin_credentials');
  
  if (stored) {
    try {
      const credentials = JSON.parse(stored);
      // Always return the fixed email, never show password after initialization
      return {
        email: FIXED_ADMIN_EMAIL,
        isNew: false
      };
    } catch (error) {
      console.error('Error parsing stored credentials:', error);
    }
  }
  
  // Initialize credentials if not found
  const newCredentials = initializeAdminCredentials();
  return {
    email: newCredentials.email,
    isNew: true // Show credentials only on first initialization
  };
};

// Authenticate admin
export const authenticateAdmin = (email: string, password: string): boolean => {
  // Check against fixed credentials first
  if (email === FIXED_ADMIN_EMAIL && password === FIXED_ADMIN_PASSWORD) {
    // Set auth token
    const token = CryptoJS.AES.encrypt(
      JSON.stringify({ email, timestamp: Date.now() }),
      'tn-films-secret-key'
    ).toString();
    localStorage.setItem('admin_token', token);
    
    // Update last login if stored credentials exist
    const stored = localStorage.getItem('tn_admin_credentials');
    if (stored) {
      try {
        const credentials = JSON.parse(stored);
        credentials.lastLogin = new Date().toISOString();
        localStorage.setItem('tn_admin_credentials', JSON.stringify(credentials));
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    } else {
      // Initialize credentials if they don't exist
      initializeAdminCredentials();
    }
    
    return true;
  }
  
  // Fallback to checking stored hashed credentials (for backward compatibility)
  const stored = localStorage.getItem('tn_admin_credentials');
  
  if (!stored) {
    return false;
  }
  
  try {
    const credentials = JSON.parse(stored);
    
    if (credentials.email !== email) {
      return false;
    }
    
    const isValid = verifyPassword(password, credentials.passwordHash);
    
    if (isValid) {
      // Update last login
      credentials.lastLogin = new Date().toISOString();
      localStorage.setItem('tn_admin_credentials', JSON.stringify(credentials));
      
      // Set auth token
      const token = CryptoJS.AES.encrypt(
        JSON.stringify({ email, timestamp: Date.now() }),
        'tn-films-secret-key'
      ).toString();
      localStorage.setItem('admin_token', token);
    }
    
    return isValid;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};

// Verify auth token
export const verifyAuthToken = (): boolean => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return false;
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(token, 'tn-films-secret-key');
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
    // Check if token is less than 24 hours old
    const tokenAge = Date.now() - decrypted.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return tokenAge < maxAge;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// Clear auth data
export const clearAuth = (): void => {
  localStorage.removeItem('admin_token');
};

// Reset admin credentials (reinitialize with fixed credentials)
export const resetAdminCredentials = (): AdminCredentials => {
  localStorage.removeItem('tn_admin_credentials');
  localStorage.removeItem('admin_token');
  return initializeAdminCredentials();
}; 