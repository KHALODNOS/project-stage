// types.ts
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  profileImage: File | null;
  nickname: string;
  birthday: string;

}
export interface LoginFormData {
  username: string;
  password: string;
}

// export interface ApiResponse {
//     success: boolean;
//     message: string;
//     data?: any;
//   }

export type Novel = {
  _id?: string;
  customId: string;
  title: string;
  description?: string;
  status?: string;
  genres?: string[];
  author: string;
  publisher?: string;
  // translators removed
  rating?: number;
  numberOfReaders?: number;
  numberOfAllChapters?: number;
  originalLanguage: string;
  dateOfPublication: number;
  englishName?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  views?: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  chapter_info?: {
    numberOfChapters: number;
    lastThreeChapters: {
      chapterNumber: number;
      chapterId: string;
      createdAt: Date;
    }[];
  };
};

export type Chapter = {
  _id: string;
  novelId: string;
  nextChapterId: string | null;
  prevChapterId: string | null;
  chapterNumber: number;
  title: string;
  content: string;
  // translators removed
  createdAt: Date;
  updatedAt: Date;
};

export interface User {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: 'admin' | 'user';
  birthday: string;
  image: string;
  favorite: string[];
  NovelsCreated: string[];
  Lastview: {
    chapterNumber: number;
    novel: string;
  }[];
  ChaptersCreated: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Userprofile {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: 'admin' | 'user';
  birthday: string;
  image: string;
  favorite: Novel[];
  NovelsCreated: Novel[];
  Lastview: {
    chapterNumber: number;
    novel: Novel;
  }[];
  ChaptersCreated: string[];
  createdAt: string;
  updatedAt: string;
}