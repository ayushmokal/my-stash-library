import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

interface Category {
  id: string;
  name: string;
}

interface ProductFormFieldsProps {
  form: UseFormReturn<any>;
  categories: Category[];
  isFetchingAmazon: boolean;
  onAffiliateLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductFormFields = ({ 
  form, 
  categories, 
  isFetchingAmazon, 
  onAffiliateLinkChange 
}: ProductFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="affiliateLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Link (Optional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="url"
                placeholder="Enter product URL or Amazon affiliate link"
                onChange={(e) => {
                  field.onChange(e);
                  onAffiliateLinkChange(e);
                }}
                disabled={isFetchingAmazon}
              />
            </FormControl>
            {isFetchingAmazon && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching product details...
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Product Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand (Optional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="image"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>Product Image (Optional)</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onChange(e.target.files)}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ProductFormFields;