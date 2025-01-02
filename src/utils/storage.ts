import { supabase } from "@/integrations/supabase/client";

export const copyToPublicStorage = async (imageUrl: string, userId: string) => {
  if (!imageUrl || !userId) return;

  try {
    // Get the original file name from the product image URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    console.log('Copying file to public storage:', { fileName, userId });

    // Download the file from product-images bucket
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('product-images')
      .download(fileName);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return;
    }

    // Upload to public-profiles bucket under user's folder
    const { error: uploadError } = await supabase.storage
      .from('public-profiles')
      .upload(`${userId}/${fileName}`, fileData, {
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading to public storage:', uploadError);
    } else {
      console.log('Successfully copied file to public storage');
    }
  } catch (error) {
    console.error('Error copying to public storage:', error);
  }
};

export const deleteFromStorage = async (imagePath: string, userId: string) => {
  if (!imagePath || !userId) return;

  try {
    // Delete from both storage buckets
    const [{ error: storageError }, { error: publicStorageError }] = await Promise.all([
      supabase.storage
        .from("product-images")
        .remove([imagePath]),
      supabase.storage
        .from("public-profiles")
        .remove([`${userId}/${imagePath}`])
    ]);

    if (storageError || publicStorageError) {
      console.error("Error deleting images:", { storageError, publicStorageError });
    }
  } catch (error) {
    console.error('Error deleting from storage:', error);
  }
};