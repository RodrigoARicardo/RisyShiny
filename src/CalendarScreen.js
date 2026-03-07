import React from 'react';
import './App.css';

function CalendarScreen(){
    const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);
    const [editingHour, setEditingHour] = React.useState(null); // Track which hour is being typed in
    const [routines, setRoutines] = React.useState({}); // Store the actual text for each hour

    const handleInputChange = (hour, value) => {
        setRoutines({ ...routines, [hour]: value });
    };

    return (
        <div className="calendar-day-view">
            {hoursOfDay.map((hour) => {
                const isEditing = editingHour === hour;
                const timeLabel = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

                return (
                    <div className="time-slot" key={hour} style={{ display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                        <div style={{ width: '100px', fontWeight: 'bold' }}>{timeLabel}</div>

                        <div className="event-area" style={{ flexGrow: 1 }} onClick={() => setEditingHour(hour)}>
                            {isEditing ? (
                                <input
                                    autoFocus
                                    type="text"
                                    value={routines[hour] || ''}
                                    onChange={(e) => handleInputChange(hour, e.target.value)}
                                    onBlur={() => setEditingHour(null)} // "Closes" the input when you click away
                                    style={{ width: '100%', padding: '5px' }}
                                />
                            ) : (
                                <span style={{ color: routines[hour] ? '#333' : '#007bff', cursor: 'pointer' }}>
                  {routines[hour] || '+ Click to schedule routine'}
                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default CalendarScreen