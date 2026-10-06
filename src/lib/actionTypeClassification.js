/**
 * ACTION TYPE CLASSIFICATION MODULE
 * Determines if action is beneficial or harmful based on manuscript rules
 * 
 * BENEFICIAL ACTIONS: Marriage, Muhabbah, Rizq, Healing, Knowledge, Worship, Prosperity
 * → Use Sa'd Akbar, Sa'd Asghar, suitable mansions, suitable planetary hours
 * 
 * HARMFUL ACTIONS: Fear, Enemy work, Separation, Conflict, Repulsion, Destruction
 * → Use Nahs Asghar, Nahs Akbar, harmful mansions, harmful planetary hours
 * 
 * NEVER recommend Sa'd periods for harmful actions.
 * NEVER recommend Nahs periods for beneficial actions.
 */

import { getRulesForTopic } from './astroClockKnowledgeBaseFramework.js';

/**
 * Classify action type from manuscript rules
 * @param {string} action - User action key
 * @returns {object} Action classification
 */
export function classifyActionType(action) {
  const actionKey = action.toLowerCase().replace(/\s+/g, '_');
  const rules = getRulesForTopic(actionKey);
  
  if (!rules || rules.length === 0) {
    return {
      classified: false,
      action,
      actionType: null,
      message: "Cannot classify - no manuscript rules found",
      message_ml: "വർഗ്ഗീകരിക്കാനായില്ല - ഹസ്തലിഖിത നിയമങ്ങളില്ല"
    };
  }
  
  // Analyze rules for action type indicators
  let beneficialIndicators = 0;
  let harmfulIndicators = 0;
  
  const beneficialKeywords = [
    'marriage', 'wedding', 'muhabbah', 'love', 'affection',
    'rizq', 'wealth', 'prosperity', 'abundance',
    'healing', 'cure', 'health', 'recovery',
    'knowledge', 'learning', 'wisdom', 'understanding',
    'worship', 'prayer', 'devotion', 'spiritual',
    'success', 'victory', 'achievement', 'blessing',
    'sa\'d', 'beneficial', 'good', 'favorable',
    'union', 'reconciliation', 'peace', 'harmony'
  ];
  
  const harmfulKeywords = [
    'fear', 'terror', 'dread',
    'enemy', 'opposition', 'adversary',
    'separation', 'division', 'split', 'break',
    'conflict', 'strife', 'discord', 'fight',
    'repulsion', 'rejection', 'driving away',
    'destruction', 'harm', 'damage', 'ruin',
    'nahs', 'harmful', 'evil', 'unfavorable',
    'war', 'battle', 'combat', 'attack'
  ];
  
  rules.forEach(rule => {
    const ruleText = rule.ruleText.toLowerCase();
    
    beneficialKeywords.forEach(keyword => {
      if (ruleText.includes(keyword)) beneficialIndicators++;
    });
    
    harmfulKeywords.forEach(keyword => {
      if (ruleText.includes(keyword)) harmfulIndicators++;
    });
  });
  
  // Determine action type
  let actionType = null;
  let confidence = 0;
  
  if (beneficialIndicators > harmfulIndicators) {
    actionType = 'beneficial';
    confidence = beneficialIndicators / (beneficialIndicators + harmfulIndicators);
  } else if (harmfulIndicators > beneficialIndicators) {
    actionType = 'harmful';
    confidence = harmfulIndicators / (beneficialIndicators + harmfulIndicators);
  }
  
  // Build timing criteria based on action type
  const timingCriteria = {
    preferred: actionType === 'beneficial' ? ['Sa\'d Akbar', 'Sa\'d Asghar'] : ['Nahs Asghar', 'Nahs Akbar'],
    avoid: actionType === 'beneficial' ? ['Nahs Akbar', 'Nahs Asghar'] : ['Sa\'d Akbar', 'Sa\'d Asghar'],
    mansionType: actionType === 'beneficial' ? 'beneficial' : 'harmful',
    planetType: actionType === 'beneficial' ? 'Sa\'d' : 'Nahs'
  };
  
  return {
    classified: true,
    action,
    actionType,
    confidence,
    beneficialIndicators,
    harmfulIndicators,
    timingCriteria,
    totalRules: rules.length,
    classification: actionType === 'beneficial' 
      ? { en: 'Beneficial Action', ml: 'ഗുണകരമായ പ്രവർത്തനം' }
      : actionType === 'harmful'
        ? { en: 'Harmful Action', ml: 'ഹാനികരമായ പ്രവർത്തനം' }
        : { en: 'Neutral Action', ml: 'സാധാരണ പ്രവർത്തനം' }
  };
}

export default { classifyActionType };