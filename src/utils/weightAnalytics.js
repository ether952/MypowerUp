/**
 * Utilidades para análisis, estadísticas y recomendaciones inteligentes de peso y evolución corporal.
 */

/**
 * Extrae todos los registros de peso ordenados cronológicamente
 */
export function getWeightHistory(data = {}) {
  const dates = Object.keys(data).sort((a, b) => new Date(a) - new Date(b));
  const logs = [];

  dates.forEach((dateStr) => {
    const day = data[dateStr];
    if (day && day.weight !== undefined && day.weight !== null && day.weight !== '') {
      const numericWeight = parseFloat(day.weight);
      if (!isNaN(numericWeight) && numericWeight > 0) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
        logs.push({
          dateStr,
          dateObj,
          label,
          weight: numericWeight,
          note: day.weightNote || '',
        });
      }
    }
  });

  return logs;
}

/**
 * Calcula estadísticas sobre el historial de peso
 */
export function calculateWeightStats(weightLogs = []) {
  if (!weightLogs || weightLogs.length === 0) {
    return {
      hasData: false,
      currentWeight: null,
      startWeight: null,
      deltaTotal: 0,
      deltaPercent: 0,
      minWeight: null,
      maxWeight: null,
      avgWeight: null,
      count: 0,
      daysSinceLastLog: null,
      latestDateStr: null,
    };
  }

  const weights = weightLogs.map((l) => l.weight);
  const currentWeight = weights[weights.length - 1];
  const startWeight = weights[0];
  const deltaTotal = Math.round((currentWeight - startWeight) * 10) / 10;
  const deltaPercent =
    startWeight > 0 ? Math.round(((currentWeight - startWeight) / startWeight) * 1000) / 10 : 0;
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const avgWeight = Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10;

  const latestDate = weightLogs[weightLogs.length - 1].dateObj;
  const today = new Date();
  const diffTime = Math.abs(today - latestDate);
  const daysSinceLastLog = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    hasData: true,
    currentWeight,
    startWeight,
    deltaTotal,
    deltaPercent,
    minWeight,
    maxWeight,
    avgWeight,
    count: weightLogs.length,
    daysSinceLastLog,
    latestDateStr: weightLogs[weightLogs.length - 1].dateStr,
  };
}

/**
 * Genera recomendaciones inteligentes personalizadas según objetivo (bajar, mantener, subir) y peso cargado
 */
export function getWeightRecommendation(weightLogs = [], currentWeight = null, goalType = 'bajar') {
  const stats = calculateWeightStats(weightLogs);

  let frequencyTitle = 'Cada 5 a 7 días';
  let frequencyBadge = '1 vez por semana';
  let reasoning = '';
  let tips = [
    'Pésate siempre al despertar, después de ir al baño y antes de ingerir agua o comida.',
    'El peso varía 1 a 2 kg en el día por agua, sodio y glucógeno.',
    'Utiliza siempre la misma balanza en una superficie plana y firme.',
  ];

  if (goalType === 'bajar') {
    frequencyTitle = 'Cada 5 a 7 días (ej. Viernes en ayunas)';
    frequencyBadge = '1 a 2 veces / sem';
    reasoning = currentWeight
      ? `Para tu peso de ${currentWeight} kg en etapa de descenso, una medición semanal (o promedio de 2 días fijos) permite evaluar la pérdida de grasa real (-0.5% a -1% semanal) sin confundirte con la retención hídrica diaria.`
      : 'Para descenso y definición, pésate 1 o 2 veces por semana para medir la tendencia real de pérdida grasa.';
    tips.push('Si un día sube súbitamente tras una comida alta en sal o carbos, es solo agua retenida.');
  } else if (goalType === 'subir') {
    frequencyTitle = 'Cada 7 a 10 días (ej. Domingos en ayunas)';
    frequencyBadge = 'Cada 7 - 10 días';
    reasoning = currentWeight
      ? `Con tu peso actual de ${currentWeight} kg en etapa de aumento muscular, el superávit calórico debe reflejarse en +0.25% a +0.5% mensual. Pesarte cada 7 a 10 días te asegura que la ganancia sea limpia y constante.`
      : 'Para volumen y masa muscular, pesarte cada 7 a 10 días evita sobreajustes calóricos apresurados.';
    tips.push('El aumento muscular es gradual; busca una ganancia controlada mes a mes.');
  } else {
    // Mantener
    frequencyTitle = 'Cada 10 a 14 días';
    frequencyBadge = 'Quincenal';
    reasoning = currentWeight
      ? `Para mantener tu peso de ${currentWeight} kg o recomponer, una revisión cada 10 a 14 días es óptima para confirmar estabilidad sin obsesionarte con el número.`
      : 'Para mantenimiento y salud, un chequeo cada 10 a 14 días es suficiente para verificar estabilidad.';
    tips.push('En mantenimiento, una oscilación de ±1 kg es completamente fisiológica.');
  }

  return {
    frequencyTitle,
    frequencyBadge,
    bestConditions: 'Por la mañana, en ayunas y post baño',
    reasoning,
    tips,
    stats,
  };
}
