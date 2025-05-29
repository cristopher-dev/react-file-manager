const fs = require('fs');
const path = require('path');

const createDirectoryStructure = () => {
  const directories = [
    'public/uploads',
    'temp',
    'logs'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

const validateEnvironment = () => {
  const requiredVars = [
    'MONGO_URI',
    'PORT',
    'CLIENT_URI'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('Please check your .env file');
  }

  return missing.length === 0;
};

const setupApplication = () => {
  console.log('🚀 Setting up File Manager Backend...');
  
  createDirectoryStructure();
  const envValid = validateEnvironment();
  
  if (envValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.log('⚠️  Environment validation failed - check warnings above');
  }
  
  console.log('📁 Directory structure created');
  console.log('🎯 Application setup complete');
};

module.exports = {
  setupApplication,
  createDirectoryStructure,
  validateEnvironment
};
