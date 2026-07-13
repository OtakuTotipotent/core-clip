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
  aspectRatio?: string;
  targetLength?: number;
  uploadedImages?: string[];
  generatedImage?: string;
  generatedVideo?: string;
  isGenerating?: boolean;
  isPublished?: boolean;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: UserRecord;
}
