interface ProductImageProps {
  imageUrl: string | null;
  name: string;
}

const ProductImage = ({ imageUrl, name }: ProductImageProps) => {
  if (!imageUrl) return null;

  return (
    <div className="aspect-square w-full overflow-hidden">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};

export default ProductImage;