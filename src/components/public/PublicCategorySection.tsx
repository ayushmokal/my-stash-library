import PublicProductCard from "./PublicProductCard";

interface PublicCategorySectionProps {
  category: {
    id: string;
    name: string;
  };
  products: any[];
  accentColor: string;
}

const PublicCategorySection = ({ category, products, accentColor }: PublicCategorySectionProps) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-2 rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold" style={{ color: accentColor }}>{category.name}</h2>
          <span className="px-2 py-1 text-xs rounded-full bg-secondary">
            {products.length} items
          </span>
        </div>
      </div>
      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <PublicProductCard key={product.id} product={product} accentColor={accentColor} />
        ))}
      </div>
    </div>
  );
};

export default PublicCategorySection;