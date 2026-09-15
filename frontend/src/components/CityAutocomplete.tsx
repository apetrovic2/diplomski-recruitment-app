import { useState } from "react";

interface CityAutocompleteProps {
  cities: string[];
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  inputClass: string;
}

export function CityAutocomplete({ cities, value, onChange, isDark, inputClass }: CityAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(value.toLowerCase())
  );

  function handleSelect(city: string) {
    onChange(city);
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder="Unesite ili izaberite grad"
        className={inputClass}
      />
      {showSuggestions && value && filteredCities.length > 0 && (
        <div
          className={
            isDark
              ? "absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl max-h-48 overflow-y-auto"
              : "absolute z-10 w-full mt-1 bg-white border border-purple-100 rounded-xl max-h-48 overflow-y-auto shadow-lg"
          }
        >
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleSelect(city)}
              className={
                isDark
                  ? "block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                  : "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
              }
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}