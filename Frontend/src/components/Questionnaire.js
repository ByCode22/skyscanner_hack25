import React, { useState } from 'react';
import './Questionnaire.css';

const Questionnaire = () => {
  const [periods, setPeriods] = useState([{ startDate: '', endDate: '' }]);

  const handleDateChange = (index, field, value) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index][field] = value;
    setPeriods(updatedPeriods);
  };

  const addPeriod = () => {
    setPeriods([...periods, { startDate: '', endDate: '' }]);
  };

  const mergePeriods = () => {
    const sortedPeriods = periods
      .map(p => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }))
      .sort((a, b) => a.startDate - b.startDate);

    let mergedPeriods = [];
    sortedPeriods.forEach(period => {
      if (mergedPeriods.length === 0 || mergedPeriods[mergedPeriods.length - 1].endDate < period.startDate) {
        mergedPeriods.push(period);
      } else {
        mergedPeriods[mergedPeriods.length - 1].endDate = new Date(
          Math.max(mergedPeriods[mergedPeriods.length - 1].endDate, period.endDate)
        );
      }
    });

    return mergedPeriods;
  };

  const submitAvailability = () => {
    const mergedPeriods = mergePeriods();
    console.log('Disponibilidad:', mergedPeriods);
  };

  return (
    <div className="questionnaire-container">
      <h2>Selecciona tu disponibilidad para el viaje</h2>
      <div className="periods-container">
        {periods.map((period, index) => (
          <div className="period" key={index}>
            <input
              type="date"
              value={period.startDate}
              onChange={(e) => handleDateChange(index, 'startDate', e.target.value)}
            />
            <input
              type="date"
              value={period.endDate}
              onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
            />
          </div>
        ))}
      </div>
      <button onClick={addPeriod}>Agregar periodo</button>
      <button onClick={submitAvailability}>Enviar Disponibilidad</button>
    </div>
  );
};

export default Questionnaire;
