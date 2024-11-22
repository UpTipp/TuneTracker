import { TextInput, Label } from "flowbite-react";

interface Item {
  id: string;
  name: string;
}

interface SearchDropdownProps {
  label: string;
  searchValue: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onFocus: () => void;
  showDropdown: boolean;
  items: Item[];
  onItemSelect: (item: Item) => void;
  placeholder?: string;
}

const SearchDropdown = ({
  label,
  searchValue,
  onSearchChange,
  onBlur,
  onFocus,
  showDropdown,
  items,
  onItemSelect,
  placeholder,
}: SearchDropdownProps) => {
  return (
    <div className="relative">
      <div className="mb-2 block">
        <Label htmlFor={label} value={label} />
      </div>
      <div className="flex">
        <TextInput
          id={label}
          value={searchValue}
          onChange={onSearchChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          className="w-full"
        />
      </div>
      {showDropdown && items.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onItemSelect(item)}
            >
              <span className="flex-grow">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
