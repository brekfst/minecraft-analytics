
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

export default GamemodeSelect;
