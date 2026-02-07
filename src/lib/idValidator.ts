import mongoose from 'mongoose';

/**
 * Validates if an ID is in a valid format
 * Supports both MongoDB ObjectId (24 hex chars) and UUID formats
 * @param id - The ID to validate
 * @returns true if the ID is valid, false otherwise
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // Check if it's a valid MongoDB ObjectId (24 hex characters)
  if (mongoose.Types.ObjectId.isValid(id)) {
    return true;
  }

  // Check if it's a valid UUID (36 characters with hyphens or 32 without)
  // Supports both standard UUID format (8-4-4-4-12) and without hyphens
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates if a string is a valid UUID
 * @param id - The ID to validate
 * @returns true if the ID is a valid UUID, false otherwise
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The ID to validate
 * @returns true if the ID is a valid MongoDB ObjectId, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  return mongoose.Types.ObjectId.isValid(id);
}
