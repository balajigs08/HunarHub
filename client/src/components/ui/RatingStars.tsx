import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  showCount?: boolean;
  count?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 0,
  max = 5,
  size = 16,
  showCount = false,
  count,
}) => {
  const safeRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < Math.floor(safeRating);
        const isHalf = i === Math.floor(safeRating) && safeRating % 1 >= 0.5;

        return (
          <Star
            key={i}
            size={size}
            className={`${
              isFilled || isHalf
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }`}
          />
        );
      })}
      <span className="text-xs font-semibold text-gray-700 ml-1">
        {safeRating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
};
