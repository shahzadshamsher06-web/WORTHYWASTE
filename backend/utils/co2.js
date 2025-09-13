// CO2 utility functions for environmental impact calculations
// These are simplified mock calculations for demo purposes

/**
 * Calculate CO2 savings from waste diversion
 * @param {number} weightKg - Weight of waste in kg
 * @param {string} wasteType - Type of waste (compostable, recyclable, non-usable)
 * @returns {number} CO2 saved in kg
 */
function calculateCO2Savings(weightKg, wasteType = 'compostable') {
  if (!weightKg || weightKg <= 0) return 0;

  // CO2 emission factors (kg CO2 per kg of waste)
  const emissionFactors = {
    compostable: 2.5,  // Organic waste decomposition in landfills produces methane
    recyclable: 1.8,   // Manufacturing new materials vs recycling
    'non-usable': 0.5  // Lower factor as these need special handling anyway
  };

  const factor = emissionFactors[wasteType] || emissionFactors.compostable;
  return Math.round(weightKg * factor * 100) / 100;
}

/**
 * Calculate equivalent trees planted based on CO2 savings
 * @param {number} co2SavedKg - CO2 saved in kg
 * @returns {number} Equivalent trees planted
 */
function calculateTreesEquivalent(co2SavedKg) {
  if (!co2SavedKg || co2SavedKg <= 0) return 0;
  
  // Average tree absorbs ~22kg CO2 per year
  const co2PerTree = 22;
  return Math.round((co2SavedKg / co2PerTree) * 100) / 100;
}

/**
 * Calculate water savings from waste reduction
 * @param {number} weightKg - Weight of waste in kg
 * @param {string} wasteType - Type of waste
 * @returns {number} Water saved in liters
 */
function calculateWaterSavings(weightKg, wasteType = 'compostable') {
  if (!weightKg || weightKg <= 0) return 0;

  // Water usage factors (liters per kg of waste)
  const waterFactors = {
    compostable: 1000,  // Food production water footprint
    recyclable: 800,    // Manufacturing water usage
    'non-usable': 200   // Lower factor for non-recyclable items
  };

  const factor = waterFactors[wasteType] || waterFactors.compostable;
  return Math.round(weightKg * factor);
}

/**
 * Calculate energy savings from recycling
 * @param {number} weightKg - Weight of recyclable material in kg
 * @returns {number} Energy saved in kWh
 */
function calculateEnergySavings(weightKg) {
  if (!weightKg || weightKg <= 0) return 0;
  
  // Average energy savings from recycling (kWh per kg)
  const energyFactor = 3.5;
  return Math.round(weightKg * energyFactor * 100) / 100;
}

/**
 * Calculate landfill space saved
 * @param {number} weightKg - Weight of waste in kg
 * @returns {number} Landfill space saved in cubic meters
 */
function calculateLandfillSpaceSaved(weightKg) {
  if (!weightKg || weightKg <= 0) return 0;
  
  // Average waste density in landfills (kg per cubic meter)
  const wasteDensity = 500;
  return Math.round((weightKg / wasteDensity) * 1000) / 1000;
}

/**
 * Get comprehensive environmental impact
 * @param {number} weightKg - Weight of waste in kg
 * @param {string} wasteType - Type of waste
 * @returns {object} Complete environmental impact data
 */
function getEnvironmentalImpact(weightKg, wasteType = 'compostable') {
  if (!weightKg || weightKg <= 0) {
    return {
      co2Saved: 0,
      treesEquivalent: 0,
      waterSaved: 0,
      energySaved: 0,
      landfillSpaceSaved: 0
    };
  }

  const co2Saved = calculateCO2Savings(weightKg, wasteType);
  
  return {
    co2Saved,
    treesEquivalent: calculateTreesEquivalent(co2Saved),
    waterSaved: calculateWaterSavings(weightKg, wasteType),
    energySaved: wasteType === 'recyclable' ? calculateEnergySavings(weightKg) : 0,
    landfillSpaceSaved: calculateLandfillSpaceSaved(weightKg),
    wasteType,
    weightKg
  };
}

/**
 * Calculate monthly environmental impact for a user
 * @param {Array} transactions - Array of user transactions
 * @returns {object} Monthly environmental impact summary
 */
function calculateMonthlyImpact(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      totalCO2Saved: 0,
      totalTreesEquivalent: 0,
      totalWaterSaved: 0,
      totalEnergySaved: 0,
      totalLandfillSpaceSaved: 0,
      transactionCount: 0
    };
  }

  let totalCO2 = 0;
  let totalWater = 0;
  let totalEnergy = 0;
  let totalLandfillSpace = 0;

  transactions.forEach(transaction => {
    const impact = getEnvironmentalImpact(transaction.amountKg, transaction.wasteCategory);
    totalCO2 += impact.co2Saved;
    totalWater += impact.waterSaved;
    totalEnergy += impact.energySaved;
    totalLandfillSpace += impact.landfillSpaceSaved;
  });

  return {
    totalCO2Saved: Math.round(totalCO2 * 100) / 100,
    totalTreesEquivalent: calculateTreesEquivalent(totalCO2),
    totalWaterSaved: Math.round(totalWater),
    totalEnergySaved: Math.round(totalEnergy * 100) / 100,
    totalLandfillSpaceSaved: Math.round(totalLandfillSpace * 1000) / 1000,
    transactionCount: transactions.length
  };
}

/**
 * Get environmental impact message for user feedback
 * @param {object} impact - Environmental impact data
 * @returns {string} User-friendly message
 */
function getImpactMessage(impact) {
  if (!impact || impact.co2Saved <= 0) {
    return "Start selling or donating waste to see your environmental impact!";
  }

  const messages = [];
  
  if (impact.co2Saved >= 1) {
    messages.push(`You've saved ${impact.co2Saved}kg of CO2 emissions`);
  }
  
  if (impact.treesEquivalent >= 0.1) {
    messages.push(`equivalent to planting ${impact.treesEquivalent} trees`);
  }
  
  if (impact.waterSaved >= 1000) {
    messages.push(`and saved ${Math.round(impact.waterSaved/1000)}k liters of water`);
  }

  return messages.length > 0 
    ? messages.join(', ') + '! 🌱'
    : "Great start on your environmental journey! 🌍";
}

module.exports = {
  calculateCO2Savings,
  calculateTreesEquivalent,
  calculateWaterSavings,
  calculateEnergySavings,
  calculateLandfillSpaceSaved,
  getEnvironmentalImpact,
  calculateMonthlyImpact,
  getImpactMessage
};
