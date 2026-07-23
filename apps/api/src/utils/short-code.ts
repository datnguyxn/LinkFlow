import { customAlphabet } from 'nanoid';

// Constants
const SHORT_CODE_LENGTH = 7;

const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const MAX_RETRY = 5;

// Generate a custom nanoid generator with the specified alphabet and length
const generateNanoId = customAlphabet(
  ALPHABET,
  SHORT_CODE_LENGTH,
);


/**
 * Generate unique short code for URL
 * @returns A unique short code
 */
export function generateShortCode(): string {
  return generateNanoId();
}

/**
 * Generate a unique short code that does not exist in the database
 * @param exists - A function that checks if a short code already exists in the database
 * @returns A unique short code
 * @throws An error if unable to generate a unique short code after MAX_RETRY attempts
 */
export async function generateUniqueShortCode(
  exists: (code:string)=>Promise<boolean>,
): Promise<string>{

  // Attempt to generate a unique short code up to MAX_RETRY times
  for(let i = 0; i < MAX_RETRY; i++){

    // Generate a new short code
    const code = generateShortCode();

    // Check if the generated short code already exists in the database
    const existed = await exists(code);

    // If the short code does not exist, return it as a unique short code
    if(!existed){
      return code;
    }

  }

  // If unable to generate a unique short code after MAX_RETRY attempts, throw an error
  throw new Error(
    'Unable to generate unique short code',
  );
}