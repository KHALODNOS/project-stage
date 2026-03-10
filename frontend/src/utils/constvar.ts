export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3500';
export const urlimage = import.meta.env.VITE_IMAGE_URL || 'http://localhost:3500/uploads';

export const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '';
    // If the path is already a full URL (Firebase storage, etc.), return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Otherwise, prefix it with the local uploads URL
    return `${urlimage}/${imagePath}`;
};