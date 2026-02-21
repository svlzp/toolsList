export interface ServerFile {
    id?: number;
    filename: string;
    originalName: string;
    path: string;
}


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const getFileUrl = (
    filePath: string | null | undefined,
    accessToken?: string | null,
    baseUrl: string = API_BASE_URL
): string => {
    if (!filePath) return '';
    
  
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return accessToken ? `${filePath}?token=${accessToken}` : filePath;
    }
    
  
    const url = `${baseUrl}/${filePath}`;
    return accessToken ? `${url}?token=${accessToken}` : url;
};


export const getFileUrls = (
    files: ServerFile[] | undefined,
    accessToken?: string
): string[] => {
    if (!files || !Array.isArray(files)) return [];
    
    return files.map(file => getFileUrl(file.path, accessToken));
};


export const getFirstFileUrl = (
    files: ServerFile[] | undefined,
    accessToken?: string
): string => {
    const urls = getFileUrls(files, accessToken);
    return urls.length > 0 ? urls[0] : '';
};


export const isLocalPath = (path: string): boolean => {
    return !path.startsWith('http://') && !path.startsWith('https://');
};
