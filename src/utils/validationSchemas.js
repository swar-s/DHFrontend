import { z } from 'zod';

// Password regex for strong password (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Basic information schema that's common for both customer and landlord
export const basePersonSchema = z.object({
  name: z.string()
    .min(2, { message: "Name should be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  
  email: z.string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email is too short" })
    .max(50, { message: "Email cannot exceed 50 characters" }),
  
  mob: z.string()
    .regex(/^[0-9]{10}$/, { message: "Mobile number must be exactly 10 digits" }),
  
  password: z.string()
    .regex(
      passwordRegex, 
      { message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character" }
    ),
  
  confirmPassword: z.string(),
  
  location: z.string()
    .min(2, { message: "Location is required and should be at least 2 characters" })
});

// Add password match refinement
const withPasswordMatch = schema => 
  schema.refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

// Customer schema with date of birth validation
export const customerSchema = withPasswordMatch(
  basePersonSchema.extend({
    dob: z.string()
      .refine(date => {
        if (!date) return false;
        const dobDate = new Date(date);
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return dobDate <= today;
      }, { message: "You must be at least 18 years old" })
  })
);

// Landlord schema with Aadhar and PAN validation
export const landlordSchema = withPasswordMatch(
  basePersonSchema.extend({
    adhar: z.string()
      .regex(/^[0-9]{12}$/, { message: "Aadhar number must be exactly 12 digits" }),
    
    pan: z.string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Invalid PAN format. Example: ABCDE1234F" })
  })
);

// Function to validate a specific field
export const validateField = (schema, field, value, formData) => {
  try {
    const dataToValidate = { 
      ...formData,
      [field]: value 
    };
    
    schema.pick({ [field]: true }).parse(dataToValidate);
    return { valid: true, message: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(e => e.path[0] === field);
      return { valid: false, message: fieldError?.message || "Invalid value" };
    }
    return { valid: false, message: "Validation failed" };
  }
};

// For password match validation
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword 
    ? { valid: true, message: null }
    : { valid: false, message: "Passwords do not match" };
};

// Password strength indicators
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: "Password is required" };
  
  let score = 0;
  let feedback = [];
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Password should be at least 8 characters");
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add an uppercase letter");
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a lowercase letter");
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a number");
  }
  
  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add a special character (@$!%*?&)");
  }
  
  let strengthText = "";
  
  if (score === 0) strengthText = "Very Weak";
  else if (score === 1) strengthText = "Weak";
  else if (score === 2) strengthText = "Fair";
  else if (score === 3) strengthText = "Good";
  else if (score === 4) strengthText = "Strong";
  else strengthText = "Very Strong";
  
  return { 
    score, 
    strengthText,
    feedback: feedback.join(", ") || "Strong password"
  };
}; 