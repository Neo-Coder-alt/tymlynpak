import { Star } from 'lucide-react';
import { classNames } from '@/lib/format';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, size = 16, className }: StarRatingProps) {
  return (
    <div className={classNames('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={classNames(
            i <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600 fill-zinc-600'
          )}
        />
      ))}
    </div>
  );
}

interface StarInputProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export function StarInput({ value, onChange, size = 28 }: StarInputProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            style={{ width: size, height: size }}
            className={i <= value ? 'text-amber-400 fill-amber-400' : 'text-zinc-600 fill-zinc-700'}
          />
        </button>
      ))}
    </div>
  );
}
