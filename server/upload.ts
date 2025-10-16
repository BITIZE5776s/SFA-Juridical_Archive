import { supabase } from "./supabase";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class FileUploadService {
  private bucketName = "archive-documents";

  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    blockLabel: string,
    documentTitle: string
  ): Promise<UploadResult> {
    try {
      // Create folder structure: blockLabel/documentTitle/fileName
      const filePath = `${blockLabel}/${documentTitle}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  async getFileUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Get URL error:', error);
      return null;
    }
  }

  // Helper method to generate unique file names
  generateFileName(originalName: string, documentId: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `${documentId}_${timestamp}.${extension}`;
  }

  // Helper method to get file type from content type
  getFileTypeFromMimeType(mimeType: string): string {
    const mimeToType: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'image/jpeg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image',
      'text/plain': 'text',
      'application/rtf': 'rtf'
    };
    
    return mimeToType[mimeType] || 'unknown';
  }
}

export const fileUploadService = new FileUploadService();
