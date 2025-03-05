// client/src/components/common/CountrySelect.jsx
import React from 'react';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'BR', name: 'Brazil' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'RU', name: 'Russia' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'PL', name: 'Poland' },
  { code: 'TR', name: 'Turkey' },
  // Add more countries as needed
];

export const CountrySelect = ({ value, onChange, error }) => {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
          error ? 'border-red-300' : ''
        }`}
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name} ({country.code})
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// client/src/components/common/GamemodeSelect.jsx
import React from 'react';

const gamemodes = [
  'Survival',
  'Creative',
  'Adventure',
  'Hardcore',
  'SkyBlock',
  'Factions',
  'Prison',
  'KitPvP',
  'SkyWars',
  'BedWars',
  'Minigames',
  'Parkour',
  'RPG',
  'Towny',
  'Economy',
  'PvP',
  'PvE',
  'Vanilla',
  'Modded',
  'Custom'
];

export const GamemodeSelect = ({ value, onChange, error }) => {
  const handleChange = (e) => {
    const options = [...e.target.selectedOptions];
    const selectedValues = options.map(option => option.value);
    onChange(selectedValues);
  };

  return (
    <div>
      <select
        multiple
        value={value}
        onChange={handleChange}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
          error ? 'border-red-300' : ''
        }`}
        style={{ minHeight: '100px' }}
      >
        {gamemodes.map((gamemode) => (
          <option key={gamemode} value={gamemode}>
            {gamemode}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Hold Ctrl (Windows) or Cmd (Mac) to select multiple
      </p>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};