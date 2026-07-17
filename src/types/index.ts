export interface UserRecord {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  credits?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectRecord {
  id: string;
  userId: string;
  name?: string;
  productName: string;
  productDescription?: string;
  userPrompt?: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  uploadedImages?: string[];
  generatedImageA?: string;
  generatedImageB?: string;
  isGenerating?: boolean;
  isPublished?: boolean;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: UserRecord;
}
