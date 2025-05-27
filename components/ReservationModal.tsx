import React, { useState, useEffect } from 'react';
import { Person, Reservation, Table, AttendeeInfo } from '../types'; // Added AttendeeInfo
import { PersonSelector } from './PersonSelector';
import { UsersIcon, XCircleIcon as RemoveIcon } from './icons'; 
import type { ReservationModalProps } from '../types'; 

const RESERVATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
  .header { background-color: #0044cc; color: #ffffff; padding: 10px 0; text-align: center; border-radius: 8px 8px 0 0; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { padding: 20px; line-height: 1.6; color: #333333; }
  .content h2 { font-size: 20px; color: #0044cc; margin-top: 0; }
  .footer { text-align: center; padding: 15px; font-size: 12px; color: #777777; margin-top: 20px; border-top: 1px solid #eeeeee; }
  .details-table { width: 100%; margin-top: 15px; border-collapse: collapse; }
  .details-table th, .details-table td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
  .details-table th { background-color: #f2f2f2; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Confirmació de Reserva a [RestaurantName]</h1></div>
    <div class="content">
      <h2>Hola [GuestName],</h2>
      <p>La teva reserva ha estat confirmada. Aquí tens els detalls:</p>
      <table class="details-table">
        <tr><th>Data:</th><td>[ReservationDate]</td></tr>
        <tr><th>Hora:</th><td>[ReservationTime]</td></tr>
        <tr><th>Taula:</th><td>[TableName]</td></tr>
        <tr><th>Nombre de Comensals:</th><td>[NumberOfGuests]</td></tr>
        <tr><th>Llista d'Assistents:</th><td>[AttendeesList]</td></tr>
        <tr><th>Notes:</th><td>[ReservationNotes]</td></tr>
      </table>
      <p>Esperem veure't aviat!</p>
      <p>Si necessites modificar o cancel·lar la teva reserva, si us plau, contacta amb nosaltres.</p>
    </div>
    <div class="footer">
      <p>[RestaurantName]</p>
      <p>[RestaurantAddress]</p>
      <p>Tel: [RestaurantPhone]</p>
    </div>
  </div>
</body>
</html>`;

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  table,
  date,
  reservablePeople,
  attendablePeople,
  existingReservation,
  allReservations, 
  addNotification,
}) => {
  const [reservedById, setReservedById] = useState<string>('');
  const [attendeeIds, setAttendeeIds] = useState<string[]>([]); // Stores IDs for PersonSelector
  const [attendedData, setAttendedData] = useState<Record<string, boolean>>({}); // Stores attendance status
  const [showEmailPreview, setShowEmailPreview] = useState<boolean>(false);
  const [emailHtmlContent, setEmailHtmlContent] = useState<string>('');
  const [isClosedByUser, setIsClosedByUser] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existingReservation) {
      setReservedById(existingReservation.reservedById);
      // Populate attendeeIds for PersonSelector
      setAttendeeIds(existingReservation.attendees.map(a => a.personId));
      // Populate attendedData for checkboxes
      const initialAttendedData: Record<string, boolean> = {};
      existingReservation.attendees.forEach(att => {
          initialAttendedData[att.personId] = att.attended;
      });
      setAttendedData(initialAttendedData);
      setIsClosedByUser(existingReservation.isClosedByUser);
      setNotes(existingReservation.notes || '');
    } else {
      setReservedById('');
      setAttendeeIds([]);
      setAttendedData({});
      setIsClosedByUser(false);
      setNotes('');
    }
    // Reset email preview state when modal is opened/closed or existingReservation changes
    setShowEmailPreview(false);
    setEmailHtmlContent('');
  }, [existingReservation, isOpen]);

  if (!isOpen || !table || !date) return null;

  const handleAttendeeChange = (ids: string[]) => {
    setAttendeeIds(ids);
    // When attendees change, update attendedData:
    // - Keep existing statuses for those still selected.
    // - Add newly selected attendees with a default of `false` (or `true` if preferred for new adds).
    // - Remove statuses for those deselected.
    setAttendedData(prevAttendedData => {
        const newAttendedData: Record<string, boolean> = {};
        ids.forEach(id => {
            newAttendedData[id] = prevAttendedData[id] || false; // Default new attendees to not attended
        });
        return newAttendedData;
    });
  };

  const removeAttendee = (idToRemove: string) => {
    setAttendeeIds((prevIds: string[]) => prevIds.filter((id: string) => id !== idToRemove));
    setAttendedData(prevData => {
        const newData = {...prevData};
        delete newData[idToRemove];
        return newData;
    });
  };

  const handleAttendedChange = (personId: string, isChecked: boolean) => {
    setAttendedData(prev => ({ ...prev, [personId]: isChecked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservedById) {
      addNotification('error', 'Si us plau, seleccioneu qui fa la reserva.');
      return;
    }
    if (attendeeIds.length === 0) {
      addNotification('error', 'Si us plau, afegiu almenys un assistent.');
      return;
    }
    if (attendeeIds.length > table.capacity) {
      addNotification('error', `El nombre d'assistents (${attendeeIds.length}) no pot excedir la capacitat de la taula de ${table.capacity}.`);
      return;
    }

    const reservationsOnSameDate: Reservation[] = allReservations.filter(
      (r: Reservation) => r.date === date && r.id !== (existingReservation?.id || '')
    );

    for (const aid of attendeeIds) {
      const person: Person | undefined = attendablePeople.find((p: Person) => p.id === aid);
      // Check against Reservation.attendees which is AttendeeInfo[]
      if (reservationsOnSameDate.some((r: Reservation) => r.attendees.some(att => att.personId === aid))) {
        addNotification('error', `L'assistent ${person?.name || aid} ja té una altra reserva per a aquest dia (${new Date(date + 'T00:00:00').toLocaleDateString('ca-ES')}).`);
        return;
      }
    }
    
    const finalAttendees: AttendeeInfo[] = attendeeIds.map(personId => ({
        personId: personId,
        attended: attendedData[personId] || false 
    }));

    onSubmit({
      tableId: table.id,
      date,
      reservedById,
      attendees: finalAttendees, // Use the new structure
      isClosedByUser,
      notes,
    });

    const guest = reservablePeople.find(p => p.id === reservedById);
    const guestName = guest ? guest.name.split(' (')[0] : 'Client'; // Get name before email part
    
    // Basic placeholder replacement
    let filledTemplate = RESERVATION_EMAIL_TEMPLATE
        .replace(/\[GuestName\]/g, guestName)
        .replace(/\[ReservationDate\]/g, new Date(date + 'T00:00:00').toLocaleDateString('ca-ES'))
        .replace(/\[ReservationTime\]/g, 'No especificat') // Assuming time is not captured yet
        .replace(/\[TableName\]/g, table.name)
        .replace(/\[NumberOfGuests\]/g, finalAttendees.length.toString())
        .replace(/\[AttendeesList\]/g, finalAttendees.map(a => attendablePeople.find(p=>p.id === a.personId)?.name || 'N/A').join(', '))
        .replace(/\[ReservationNotes\]/g, notes || 'Cap')
        .replace(/\[RestaurantName\]/g, 'El Teu Restaurant') // Placeholder
        .replace(/\[RestaurantAddress\]/g, 'Carrer Fals 123, Ciutat') // Placeholder
        .replace(/\[RestaurantPhone\]/g, '555-1234'); // Placeholder

    setEmailHtmlContent(filledTemplate);
    setShowEmailPreview(true); 
  };
  
  const currentCapacity: number = table.capacity; 
  const selectedAttendeesObjects: Person[] = attendablePeople.filter((p: Person) => attendeeIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="reservation-modal-title">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {!showEmailPreview ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 id="reservation-modal-title" className="text-2xl font-semibold text-gray-800">
                {existingReservation ? 'Editar Reserva' : 'Nova Reserva'}
              </h2>
              <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl" aria-label="Tancar modal">&times;</button>
            </div>

            <div className="mb-4 p-3 bg-indigo-100 rounded-md border border-indigo-200">
              <p className="text-sm text-indigo-800"><span className="font-semibold">Taula:</span> {table.name}</p>
              <p className="text-sm text-indigo-800"><span className="font-semibold">Data:</span> {new Date(date + 'T00:00:00').toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-sm text-indigo-800"><span className="font-semibold">Capacitat:</span> {table.capacity} persones</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonSelector
                id="reservedBy"
                label="Reserva feta per"
                people={reservablePeople}
                selectedPersonId={reservedById}
                onChange={(id) => setReservedById(id as string)}
                required
              />

              <div>
                <PersonSelector
                  id="attendees"
                  label="Assistents"
                  people={attendablePeople}
                  selectedPersonIds={attendeeIds}
                  onChange={(ids) => handleAttendeeChange(ids as string[])}
                  allowMultiple
                  maxSelections={currentCapacity}
                  required
                />
                {selectedAttendeesObjects.length > 0 && (
                  <div className="mt-3 space-y-2 border border-gray-300 rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
                    <p className="text-sm font-medium text-gray-700 mb-1">Marcar assistència:</p>
                    {selectedAttendeesObjects.map((person: Person) => (
                      <div key={person.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-800">{person.name}</span>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendedData[person.id] || false}
                            onChange={(e) => handleAttendedChange(person.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700">Assistirà</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-700 mt-1">
                  <UsersIcon className="w-4 h-4 mr-1 text-gray-500" />
                  <span>Seleccionats {attendeeIds.length} de {currentCapacity} llocs.</span>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    id="isClosedByUser"
                    name="isClosedByUser"
                    type="checkbox"
                    checked={isClosedByUser}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsClosedByUser(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="isClosedByUser" className="font-medium text-gray-900">
                    Tancar aquesta taula
                  </label>
                  <p className="text-gray-600">No es permetran altres reserves. Podeu afegir més convidats més tard fins a la capacitat màxima.</p>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (opcional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Qualsevol petició especial o detall..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {existingReservation ? 'Actualitzar Reserva' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </>
        )}
        {showEmailPreview && (
          <div className="mt-4"> {/* Email preview content, appears within the same modal box */}
            <h3 className="text-lg font-semibold mb-3">Vista Prèvia del Correu</h3>
            <div 
              style={{border: '1px solid #ccc', padding: '10px', minHeight: '200px', maxHeight: '300px', overflowY: 'auto', backgroundColor: '#f9f9f9'}}
              dangerouslySetInnerHTML={{ __html: emailHtmlContent }} 
            />
            <textarea
               value={emailHtmlContent}
               onChange={(e) => setEmailHtmlContent(e.target.value)}
               className="w-full h-40 mt-2 p-2 border rounded"
               aria-label="Contingut del correu HTML"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={() => { 
                    console.log('Simulating email send:', emailHtmlContent); 
                    addNotification('info', 'Enviament de correu simulat.'); 
                    setShowEmailPreview(false); 
                    onClose(); 
                }} 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Enviar Correu
              </button>
              <button 
                onClick={() => { 
                    setShowEmailPreview(false); 
                    onClose(); 
                }} 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Ometre/Tancar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};