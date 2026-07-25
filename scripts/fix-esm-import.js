const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/jwks-rsa/src/utils.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  if (content.includes("const jose = require('jose');")) {
    console.log('Patching jwks-rsa to use dynamic import for jose...');
    
    // Replace const jose = require('jose'); with let jose;
    content = content.replace("const jose = require('jose');", "let jose;");
    
    // Inject the import inside retrieveSigningKeys
    if (content.includes("async function retrieveSigningKeys(jwks) {")) {
      content = content.replace(
        "async function retrieveSigningKeys(jwks) {",
        "async function retrieveSigningKeys(jwks) {\n  if (!jose) {\n    jose = await import('jose');\n  }"
      );
    } else if (content.includes("async function retrieveSigningKeys(jwks) \n{")) {
      content = content.replace(
        "async function retrieveSigningKeys(jwks) \n{",
        "async function retrieveSigningKeys(jwks) \n{\n  if (!jose) {\n    jose = await import('jose');\n  }"
      );
    }
    
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('✅ jwks-rsa patched successfully!');
  } else if (content.includes("await import('jose')")) {
    console.log('jwks-rsa is already patched.');
  } else {
    console.log('Could not find standard require statement for jose in utils.js.');
  }
} else {
  console.log('jwks-rsa/src/utils.js not found. Skipping patch.');
}
