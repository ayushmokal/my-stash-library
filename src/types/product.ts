export interface Product {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  affiliate_link: string | null;
  category_id: string;
  user_id: string;
}

export interface Category {
  id: string;
  name: string;
}