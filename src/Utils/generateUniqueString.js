import { customAlphabet } from "nanoid";

const generateUniqueFileName = (length) => {
  const nanoId = customAlphabet("12345abcd", length || 21);
  return nanoId();
};

export default generateUniqueFileName;
