/**
 * treetmi.id client-side real-time WebP Image Compressor and Transcoder
 */

interface WebpConversionResult {
  file: File;
  previewUrl: string;
}

/**
 * Converts a standard browser File (JPG, PNG, SVG) into a compressed WebP File in real-time.
 * @param file The uploaded raw image File from an <input type="file" />
 * @param quality Compression factor from 0.0 to 1.0 (defaults to 0.85 for professional balance)
 */
export function convertImageToWebp(file: File, quality = 0.85): Promise<WebpConversionResult> {
  return new Promise((resolve, reject) => {
    // If it's already a webp and we don't want to re-compress, we can optionally skip,
    // but transcoding guarantees resolution bounds and strict standard encoding.
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi Canvas 2D context."));
          return;
        }

        // Set dimensions (we can restrict max sizing here for perfect page performance)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image onto canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export to WebP format
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal melakukan transkoding gambar ke WebP."));
              return;
            }

            // Create a clean File name with .webp extension
            const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpFile = new File([blob], `${originalNameWithoutExt}.webp`, {
              type: "image/webp",
              lastModified: Date.now()
            });

            // Generate instant client-side preview URL
            const previewUrl = URL.createObjectURL(webpFile);

            resolve({
              file: webpFile,
              previewUrl
            });
          },
          "image/webp",
          quality
        );
      };

      img.onerror = (err) => {
        reject(new Error("Gagal membaca source data gambar."));
      };
    };

    reader.onerror = (err) => {
      reject(new Error("Gagal membaca file dari disk."));
    };
  });
}
