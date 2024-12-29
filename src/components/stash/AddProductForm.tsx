import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProductFormFields from "./ProductFormFields";
import ProductPreview from "./ProductPreview";

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  brand: z.string().optional(),
  affiliateLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  image: z.instanceof(FileList).optional(),
});

const AddProductForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingAmazon, setIsFetchingAmazon] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      affiliateLink: "",
      categoryId: "",
    },
  });

  const fetchAmazonProduct = async (url: string) => {
    try {
      setIsFetchingAmazon(true);
      const response = await supabase.functions.invoke('fetch-amazon-product', {
        body: { url }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch product data');
      }

      const data = response.data;
      console.log('Amazon product data:', data);
      
      if (data.name) form.setValue("name", data.name);
      if (data.brand) form.setValue("brand", data.brand);
      if (data.image_url) {
        setPreviewUrl(data.image_url);
        // Convert image URL to File object
        const imageResponse = await fetch(data.image_url);
        const blob = await imageResponse.blob();
        const file = new File([blob], "product-image.jpg", { type: "image/jpeg" });
        const fileList = new DataTransfer();
        fileList.items.add(file);
        form.setValue("image", fileList.files);
      }
    } catch (error: any) {
      console.error('Error fetching Amazon product:', error);
      toast.error(error.message || "Failed to fetch product data");
    } finally {
      setIsFetchingAmazon(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      let imageUrl = null;

      if (values.image?.[0]) {
        const file = values.image[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error: insertError } = await supabase.from("products").insert({
        name: values.name,
        brand: values.brand || null,
        affiliate_link: values.affiliateLink || null,
        image_url: imageUrl,
        user_id: user.id,
        category_id: values.categoryId,
      });

      if (insertError) {
        throw insertError;
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully!");
      form.reset();
      setPreviewUrl(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAffiliateLinkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url && url.includes("amazon")) {
      await fetchAmazonProduct(url);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="space-y-6">
      {(watchedValues.name || previewUrl) && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Preview</h3>
          <ProductPreview
            name={watchedValues.name}
            brand={watchedValues.brand}
            imageUrl={previewUrl || undefined}
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ProductFormFields
            form={form}
            categories={categories}
            isFetchingAmazon={isFetchingAmazon}
            onAffiliateLinkChange={handleAffiliateLinkChange}
          />

          <Button type="submit" className="w-full" disabled={isUploading || isFetchingAmazon}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddProductForm;