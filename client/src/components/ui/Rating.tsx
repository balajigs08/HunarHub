import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviews?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const Rating: React.FC<RatingProps> = ({
  value, max = 5, size = 'md', showValue = false, reviews, interactive = false, onChange
}) => {
  const [hovered, setHovered] = React.useState(0);

  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const starSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
          const filled = interactive ? (hovered || value) >= star : value >= star;
          const half = !interactive && !filled && value >= star - 0.5;

          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
              onClick={() => interactive && onChange?.(star)}
              onMouseEnter={() => interactive && setHovered(star)}
              onMouseLeave={() => interactive && setHovered(0)}
              aria-label={interactive ? `Rate ${star} stars` : undefined}
            >
              <Star
                className={`${starSize} ${
                  filled ? 'text-yellow-400 fill-yellow-400' :
                  half ? 'text-yellow-400 fill-yellow-200' :
                  'text-gray-300 fill-gray-100'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={`font-semibold text-gray-700 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {value.toFixed(1)}
        </span>
      )}
      {reviews !== undefined && (
        <span className={`text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          ({reviews})
        </span>
      )}
    </div>
  );
};

export default Rating;
