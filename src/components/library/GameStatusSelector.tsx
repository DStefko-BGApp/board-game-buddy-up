import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type GameStatus = 'owned' | 'wishlist' | 'played_unowned' | 'want_trade_sell' | 'on_order';

export const gameStatusOptions: { value: GameStatus; label: string; description: string }[] = [
  { value: 'owned', label: 'Owned', description: 'Games you own' },
  { value: 'wishlist', label: 'Wish List', description: 'Games you want to buy' },
  { value: 'played_unowned', label: 'Played (unowned)', description: 'Games you\'ve played but don\'t own' },
  { value: 'want_trade_sell', label: 'Want to Trade/Sell', description: 'Games you want to trade or sell' },
  { value: 'on_order', label: 'On Order', description: 'Games you\'ve ordered but haven\'t received' },
];

interface GameStatusSelectorProps {
  value: GameStatus;
  onValueChange: (value: GameStatus) => void;
  placeholder?: string;
  className?: string;
}

export const GameStatusSelector = ({
  value,
  onValueChange,
  placeholder = "Select status...",
  className
}: GameStatusSelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {gameStatusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};