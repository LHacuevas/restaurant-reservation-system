import React, { useState, useEffect, useRef } from 'react';
import { Person } from '../types';

interface PersonSelectorProps {
  id: string;
  label: string;
  people: Person[];
  selectedPersonId?: string; // For single select
  selectedPersonIds?: string[]; // For multi select
  onChange: (selectedId: string | string[]) => void;
  maxSelections?: number; // For multi select
  allowMultiple?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export const PersonSelector: React.FC<PersonSelectorProps> = ({
  id,
  label,
  people,
  selectedPersonId,
  selectedPersonIds,
  onChange,
  maxSelections,
  allowMultiple = false,
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredPeople: Person[] = people.filter((person: Person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (personId: string) => {
    if (allowMultiple) {
      const currentSelectedIds = selectedPersonIds || [];
      let newSelectedIds;
      if (currentSelectedIds.includes(personId)) {
        newSelectedIds = currentSelectedIds.filter(id => id !== personId);
      } else {
        if (maxSelections && currentSelectedIds.length >= maxSelections) {
          // Optional: notify user about max selections
          return;
        }
        newSelectedIds = [...currentSelectedIds, personId];
      }
      onChange(newSelectedIds);
    } else {
      onChange(personId);
      setIsOpen(false);
      setSearchTerm(''); // Clear search term on single select
    }
  };

  const getButtonLabel = (): string => {
    if (allowMultiple) {
      const numSelected: number = selectedPersonIds?.length || 0;
      if (numSelected === 0) return `Selecciona ${label.toLowerCase()}...`;
      if (numSelected === 1 && selectedPersonIds) {
         const person: Person | undefined = people.find(p => p.id === selectedPersonIds[0]);
         return person ? person.name : `${numSelected} seleccionat/s`;
      }
      return `${numSelected} seleccionat/s`;
    } else { // Single select mode
      const person: Person | undefined = people.find(p => p.id === selectedPersonId);
      return person ? person.name : `Selecciona ${label.toLowerCase()}...`;
    }
  };

  const isSelected = (personId: string): boolean => {
    if (allowMultiple) {
      return selectedPersonIds?.includes(personId) || false;
    }
    return selectedPersonId === personId;
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label htmlFor={id + '-button'} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <button
        id={id + '-button'}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500" // disabled styles improved
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate text-gray-900">{getButtonLabel()}</span> {/* Ensure button text is dark */}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.53 7.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.78 9.53a.75.75 0 011.06 0L10 15.19l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0l-3.25-3.25a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" role="listbox">
          {(allowMultiple || people.length > 10) && ( 
             <div className="p-2">
                <input
                    type="text"
                    placeholder="Cerca..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
            </div>
          )}
          {filteredPeople.length === 0 && searchTerm && (
            <div className="px-3 py-2 text-sm text-gray-500">No s'han trobat coincidències.</div>
          )}
          {filteredPeople.map((person: Person) => (
            <div
              key={person.id}
              onClick={() => handleSelect(person.id)}
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white ${isSelected(person.id) ? 'bg-indigo-500 text-white' : 'text-gray-900'}`} // Slightly lighter selected bg for better text contrast
              role="option"
              aria-selected={isSelected(person.id)}
            >
              <span className={`block truncate ${isSelected(person.id) ? 'font-semibold' : 'font-normal'}`}>
                {person.name}
              </span>
              {isSelected(person.id) && allowMultiple && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-white">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};