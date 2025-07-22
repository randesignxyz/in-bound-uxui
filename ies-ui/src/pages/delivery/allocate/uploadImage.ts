import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

export const uploadFileToFirebase = async (file: File): Promise<string> => {
  console.log("Uploading file:", file.name, file.size, file.type);

  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `image/${fileName}`);

  await uploadBytes(storageRef, file, { contentType: file.type });

  const url = await getDownloadURL(storageRef);
  console.log("File uploaded at URL:", url);

  return url;
};