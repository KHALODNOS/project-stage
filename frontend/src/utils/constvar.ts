export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3500';
export const urlimage = import.meta.env.VITE_IMAGE_URL || 'http://localhost:3500/uploads';

export const getImageUrl = (imagePath: string | undefined | null): string => {
    // If it's the default image name, missing, or literally 'undefined'
    if (!imagePath || imagePath === 'images.png' || imagePath === 'undefined' || imagePath === 'null') {
        return '/images.png';
    }
    // Block broken Firebase URLs and replace them with default image
    // Since Firebase credentials (invalid_grant) caused all signed URLs to become 403
    if (imagePath.includes('storage.googleapis.com') || imagePath.includes('firebasestorage.googleapis.com')) {
        return '/images.png';
    }
    // If the path is already a full URL, return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Otherwise, prefix it with the local uploads URL
    const baseUrl = (urlimage && urlimage !== 'undefined') ? urlimage : 'http://localhost:3500/uploads';
    return `${baseUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`;
};