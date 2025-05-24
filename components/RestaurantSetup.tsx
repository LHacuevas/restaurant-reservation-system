import React, { useState } from 'react';
import { DefaultRestaurantConfig } from '../types';
import { APP_TITLE, VIEW_TITLES } from '../constants';
import { TableIcon } from './icons';

interface RestaurantSetupProps {
  onConfigSubmit: (config: DefaultRestaurantConfig) => void;
  initialConfig?: DefaultRestaurantConfig;
}

export const RestaurantSetup: React.FC<RestaurantSetupProps> = ({ onConfigSubmit, initialConfig }) => {
  const [fourSeaters, setFourSeaters] = useState<string>(initialConfig?.fourSeaterTables.toString() || '5');
  const [sixSeaters, setSixSeaters] = useState<string>(initialConfig?.sixSeaterTables.toString() || '3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numFour = parseInt(fourSeaters, 10);
    const numSix = parseInt(sixSeaters, 10);

    if (isNaN(numFour) || numFour < 0 || isNaN(numSix) || numSix < 0) {
      alert('Si us plau, introduïu números vàlids i no negatius per a les taules.');
      return;
    }
    if (numFour + numSix === 0) {
        alert('Si us plau, afegiu almenys una taula.');
        return;
    }
     if (numFour + numSix > 50) { // Límit arbitrari
        alert('Es permet un màxim de 50 taules en total.');
        return;
    }

    onConfigSubmit({
      fourSeaterTables: numFour,
      sixSeaterTables: numSix,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-6">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md text-center">
        <TableIcon className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{VIEW_TITLES.setup}</h1>
        <p className="text-gray-600 mb-8">Definiu el nombre de taules per defecte del vostre restaurant.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fourSeaters" className="block text-sm font-medium text-gray-700 text-left mb-1">
              Taules per a 4 persones (per defecte)
            </label>
            <input
              type="number"
              id="fourSeaters"
              value={fourSeaters}
              onChange={(e) => setFourSeaters(e.target.value)}
              min="0"
              max="30"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="p.ex., 5"
            />
          </div>
          <div>
            <label htmlFor="sixSeaters" className="block text-sm font-medium text-gray-700 text-left mb-1">
              Taules per a 6 persones (per defecte)
            </label>
            <input
              type="number"
              id="sixSeaters"
              value={sixSeaters}
              onChange={(e) => setSixSeaters(e.target.value)}
              min="0"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              placeholder="p.ex., 3"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-lg"
          >
            Desar Configuració per Defecte
          </button>
        </form>
      </div>
       <footer className="mt-8 text-center">
        <p className="text-sm text-indigo-200">&copy; {new Date().getFullYear()} {APP_TITLE}. Creat amb cura.</p>
      </footer>
    </div>
  );
};