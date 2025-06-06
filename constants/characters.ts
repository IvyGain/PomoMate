import { colors } from './theme';

// Character types
export type CharacterType = 'balanced' | 'focused' | 'consistent';

// Character ability types
export type AbilityType = 
  | 'timerBoost' 
  | 'xpBoost' 
  | 'streakProtection' 
  | 'focusEnhancement' 
  | 'breakTimeReduction'
  | 'gameScoreBoost'
  | 'achievementBoost'
  | 'specialUnlock';

// Character ability interface
export interface CharacterAbility {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  value: number; // Percentage or value of the boost/effect
  isActive: boolean; // Whether the ability is currently active
}

// Character interface
export interface Character {
  id: string;
  name: string;
  description: string;
  level: number;
  evolutionPath: CharacterType[];
  nextEvolutionExp: number | null;
  image: string;
  color: string;
  personality: string;
  abilities: CharacterAbility[];
}

// Character abilities
const ABILITIES: Record<string, CharacterAbility> = {
  // Basic abilities (Level 1)
  basic_timer: {
    id: 'basic_timer',
    name: '基本的な集中力',
    description: 'ポモドーロタイマーの効果を5%向上させる',
    type: 'timerBoost',
    value: 5,
    isActive: true
  },
  basic_xp: {
    id: 'basic_xp',
    name: '基本的な成長',
    description: 'セッション完了時のXP獲得量を5%増加させる',
    type: 'xpBoost',
    value: 5,
    isActive: true
  },
  basic_focus: {
    id: 'basic_focus',
    name: '基本的な集中',
    description: '集中セッション中の効果を5%向上させる',
    type: 'focusEnhancement',
    value: 5,
    isActive: true
  },
  
  // Balanced abilities
  balanced_adaptability: {
    id: 'balanced_adaptability',
    name: '適応力',
    description: 'すべてのボーナスを均等に10%向上させる',
    type: 'timerBoost',
    value: 10,
    isActive: true
  },
  balanced_versatility: {
    id: 'balanced_versatility',
    name: '多才性',
    description: 'すべてのミニゲームのスコアを10%向上させる',
    type: 'gameScoreBoost',
    value: 10,
    isActive: true
  },
  
  // Focused abilities
  focused_deep_work: {
    id: 'focused_deep_work',
    name: 'ディープワーク',
    description: '集中セッションの効果を20%向上させる',
    type: 'focusEnhancement',
    value: 20,
    isActive: true
  },
  focused_flow_state: {
    id: 'focused_flow_state',
    name: 'フロー状態',
    description: '連続セッション時のXP獲得量を15%増加させる',
    type: 'xpBoost',
    value: 15,
    isActive: true
  },
  
  // Consistent abilities
  consistent_streak: {
    id: 'consistent_streak',
    name: 'ストリーク保護',
    description: '1日休んでもストリークが途切れない（週に1回まで）',
    type: 'streakProtection',
    value: 1,
    isActive: true
  },
  consistent_habit: {
    id: 'consistent_habit',
    name: '習慣化マスター',
    description: '連続日数に応じてXP獲得量が最大20%まで増加する',
    type: 'xpBoost',
    value: 20,
    isActive: true
  },
  
  // Advanced abilities (Level 3+)
  advanced_achievement: {
    id: 'advanced_achievement',
    name: '実績ハンター',
    description: '実績解除時のXP報酬を25%増加させる',
    type: 'achievementBoost',
    value: 25,
    isActive: true
  },
  advanced_game: {
    id: 'advanced_game',
    name: 'ゲームマスター',
    description: 'すべてのミニゲームのスコアを25%向上させる',
    type: 'gameScoreBoost',
    value: 25,
    isActive: true
  },
  advanced_break: {
    id: 'advanced_break',
    name: '効率的な休憩',
    description: '休憩時間を15%短縮しても同じ効果を得られる',
    type: 'breakTimeReduction',
    value: 15,
    isActive: true
  },
  
  // Special abilities (Level 4+)
  special_unlock: {
    id: 'special_unlock',
    name: '特別なアンロック',
    description: '特別なミニゲームや機能をアンロックする',
    type: 'specialUnlock',
    value: 1,
    isActive: true
  },
  special_time_warp: {
    id: 'special_time_warp',
    name: 'タイムワープ',
    description: '週に1回、過去のセッションを記録できる',
    type: 'specialUnlock',
    value: 1,
    isActive: true
  },
  
  // New unique abilities
  ninja_focus: {
    id: 'ninja_focus',
    name: '忍者の集中力',
    description: '集中セッション中の外部通知を自動的にブロックする',
    type: 'focusEnhancement',
    value: 30,
    isActive: true
  },
  samurai_discipline: {
    id: 'samurai_discipline',
    name: '侍の規律',
    description: '連続セッションをこなすごとに集中力が5%ずつ向上する（最大30%）',
    type: 'focusEnhancement',
    value: 30,
    isActive: true
  },
  dragon_breath: {
    id: 'dragon_breath',
    name: 'ドラゴンブレス',
    description: '1日に3回まで、セッション時間を2倍にカウントできる',
    type: 'timerBoost',
    value: 100,
    isActive: true
  },
  phoenix_rebirth: {
    id: 'phoenix_rebirth',
    name: 'フェニックスの再生',
    description: '3日間ストリークが途切れても、1回だけ復活できる',
    type: 'streakProtection',
    value: 3,
    isActive: true
  },
  kitsune_wisdom: {
    id: 'kitsune_wisdom',
    name: '狐の知恵',
    description: '実績解除時のXP報酬が50%増加し、追加の特典を得られる',
    type: 'achievementBoost',
    value: 50,
    isActive: true
  }
};

// Character evolution paths with detailed images
export const CHARACTER_EVOLUTIONS: Record<string, Character> = {
  // Level 1 (Starting characters)
  balanced_1: { 
    id: 'balanced_1',
    name: 'ポモたま', 
    description: 'バランス型の初期キャラクター', 
    level: 1,
    evolutionPath: ['balanced'],
    nextEvolutionExp: 500,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y3V0ZSUyMGNoYXJhY3RlcnxlbnwwfHwwfHx8MA%3D%3D',
    color: colors.primary,
    personality: '好奇心旺盛で元気いっぱい',
    abilities: [ABILITIES.basic_timer, ABILITIES.basic_xp]
  },
  focused_1: { 
    id: 'focused_1',
    name: 'フォカたま', 
    description: '集中型の初期キャラクター', 
    level: 1,
    evolutionPath: ['focused'],
    nextEvolutionExp: 500,
    image: 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.secondary,
    personality: '真面目で集中力が高い',
    abilities: [ABILITIES.basic_focus, ABILITIES.basic_timer]
  },
  consistent_1: { 
    id: 'consistent_1',
    name: 'コンたま', 
    description: '継続型の初期キャラクター', 
    level: 1,
    evolutionPath: ['consistent'],
    nextEvolutionExp: 500,
    image: 'https://images.unsplash.com/photo-1563396983906-b3795482a59a?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.warning,
    personality: '忍耐強く継続力がある',
    abilities: [ABILITIES.basic_xp, ABILITIES.basic_focus]
  },
  
  // Level 2 (First evolution)
  balanced_2: { 
    id: 'balanced_2',
    name: 'ポモっこ', 
    description: 'バランス型の第一進化', 
    level: 2,
    evolutionPath: ['balanced', 'balanced'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.primary,
    personality: '協調性があり多才',
    abilities: [ABILITIES.basic_timer, ABILITIES.basic_xp, ABILITIES.balanced_adaptability]
  },
  focused_2: { 
    id: 'focused_2',
    name: 'フォカっこ', 
    description: '集中型の第一進化', 
    level: 2,
    evolutionPath: ['focused', 'focused'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.secondary,
    personality: '分析的で冷静',
    abilities: [ABILITIES.basic_focus, ABILITIES.basic_timer, ABILITIES.focused_deep_work]
  },
  consistent_2: { 
    id: 'consistent_2',
    name: 'コンっこ', 
    description: '継続型の第一進化', 
    level: 2,
    evolutionPath: ['consistent', 'consistent'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.warning,
    personality: '粘り強く安定している',
    abilities: [ABILITIES.basic_xp, ABILITIES.basic_focus, ABILITIES.consistent_streak]
  },
  
  // Mixed Level 2 evolutions
  balanced_focused_2: {
    id: 'balanced_focused_2',
    name: 'ポモフォカっこ',
    description: 'バランス・集中型の進化',
    level: 2,
    evolutionPath: ['balanced', 'focused'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#9370DB', // Purple blend
    personality: '柔軟で集中力も高い',
    abilities: [ABILITIES.basic_timer, ABILITIES.basic_focus, ABILITIES.focused_flow_state]
  },
  balanced_consistent_2: {
    id: 'balanced_consistent_2',
    name: 'ポモコンっこ',
    description: 'バランス・継続型の進化',
    level: 2,
    evolutionPath: ['balanced', 'consistent'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#4ECDC4', // Teal blend
    personality: '安定していて多才',
    abilities: [ABILITIES.basic_xp, ABILITIES.balanced_adaptability, ABILITIES.consistent_streak]
  },
  focused_balanced_2: {
    id: 'focused_balanced_2',
    name: 'フォカポモっこ',
    description: '集中・バランス型の進化',
    level: 2,
    evolutionPath: ['focused', 'balanced'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#7986CB', // Blue-purple blend
    personality: '集中力があり柔軟',
    abilities: [ABILITIES.basic_focus, ABILITIES.balanced_adaptability, ABILITIES.focused_deep_work]
  },
  focused_consistent_2: {
    id: 'focused_consistent_2',
    name: 'フォカコンっこ',
    description: '集中・継続型の進化',
    level: 2,
    evolutionPath: ['focused', 'consistent'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#5E35B1', // Deep purple blend
    personality: '集中力と継続力を兼ね備える',
    abilities: [ABILITIES.basic_focus, ABILITIES.consistent_streak, ABILITIES.focused_deep_work]
  },
  consistent_balanced_2: {
    id: 'consistent_balanced_2',
    name: 'コンポモっこ',
    description: '継続・バランス型の進化',
    level: 2,
    evolutionPath: ['consistent', 'balanced'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#FFA726', // Orange blend
    personality: '継続力があり多才',
    abilities: [ABILITIES.basic_xp, ABILITIES.balanced_adaptability, ABILITIES.consistent_habit]
  },
  consistent_focused_2: {
    id: 'consistent_focused_2',
    name: 'コンフォカっこ',
    description: '継続・集中型の進化',
    level: 2,
    evolutionPath: ['consistent', 'focused'],
    nextEvolutionExp: 1000,
    image: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGN1dGUlMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#FF7043', // Deep orange blend
    personality: '継続的に集中できる',
    abilities: [ABILITIES.basic_focus, ABILITIES.consistent_habit, ABILITIES.focused_flow_state]
  },
  
  // Level 3 (Second evolution - a few examples)
  balanced_balanced_balanced_3: { 
    id: 'balanced_balanced_balanced_3',
    name: 'ポモバラ', 
    description: '超バランス型の進化', 
    level: 3,
    evolutionPath: ['balanced', 'balanced', 'balanced'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.primary,
    personality: '万能で適応力が高い',
    abilities: [
      ABILITIES.basic_timer, 
      ABILITIES.basic_xp, 
      ABILITIES.balanced_adaptability, 
      ABILITIES.balanced_versatility
    ]
  },
  focused_focused_focused_3: { 
    id: 'focused_focused_focused_3',
    name: 'フォカマスター', 
    description: '超集中型の進化', 
    level: 3,
    evolutionPath: ['focused', 'focused', 'focused'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1560807707-4cc77767d783?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.secondary,
    personality: '超集中力の持ち主',
    abilities: [
      ABILITIES.basic_focus, 
      ABILITIES.basic_timer, 
      ABILITIES.focused_deep_work, 
      ABILITIES.focused_flow_state
    ]
  },
  consistent_consistent_consistent_3: { 
    id: 'consistent_consistent_consistent_3',
    name: 'コンマスター', 
    description: '超継続型の進化', 
    level: 3,
    evolutionPath: ['consistent', 'consistent', 'consistent'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: colors.warning,
    personality: '継続の達人',
    abilities: [
      ABILITIES.basic_xp, 
      ABILITIES.basic_focus, 
      ABILITIES.consistent_streak, 
      ABILITIES.consistent_habit
    ]
  },
  
  // Mixed Level 3 evolutions (examples)
  balanced_focused_consistent_3: {
    id: 'balanced_focused_consistent_3',
    name: 'トライフォース',
    description: '三属性バランス型の進化',
    level: 3,
    evolutionPath: ['balanced', 'focused', 'consistent'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#8BC34A', // Light green
    personality: '全ての能力を兼ね備えた万能型',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.focused_deep_work,
      ABILITIES.consistent_streak,
      ABILITIES.advanced_achievement
    ]
  },
  
  // Level 4 (Third evolution - examples)
  balanced_balanced_balanced_balanced_4: {
    id: 'balanced_balanced_balanced_balanced_4',
    name: 'ポモキング',
    description: '究極バランス型',
    level: 4,
    evolutionPath: ['balanced', 'balanced', 'balanced', 'balanced'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#E91E63', // Pink
    personality: '完璧なバランスの達人',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.balanced_versatility,
      ABILITIES.advanced_achievement,
      ABILITIES.advanced_game,
      ABILITIES.special_unlock
    ]
  },
  focused_focused_focused_focused_4: {
    id: 'focused_focused_focused_focused_4',
    name: 'フォカキング',
    description: '究極集中型',
    level: 4,
    evolutionPath: ['focused', 'focused', 'focused', 'focused'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#3F51B5', // Indigo
    personality: '超人的な集中力の持ち主',
    abilities: [
      ABILITIES.focused_deep_work,
      ABILITIES.focused_flow_state,
      ABILITIES.advanced_break,
      ABILITIES.advanced_game,
      ABILITIES.special_time_warp
    ]
  },
  
  // Level 5 (Final evolution - examples)
  balanced_balanced_balanced_balanced_balanced_5: {
    id: 'balanced_balanced_balanced_balanced_balanced_5',
    name: 'ポモゴッド',
    description: '伝説のバランスマスター',
    level: 5,
    evolutionPath: ['balanced', 'balanced', 'balanced', 'balanced', 'balanced'],
    nextEvolutionExp: null,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#C2185B', // Deep pink
    personality: '伝説の存在',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.balanced_versatility,
      ABILITIES.advanced_achievement,
      ABILITIES.advanced_game,
      ABILITIES.special_unlock,
      ABILITIES.special_time_warp
    ]
  },
  
  // New unique character designs
  balanced_focused_balanced_3: {
    id: 'balanced_focused_balanced_3',
    name: 'ポモウィズ',
    description: '知恵と集中のマスター',
    level: 3,
    evolutionPath: ['balanced', 'focused', 'balanced'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFudGFzeSUyMGNoYXJhY3RlcnxlbnwwfHwwfHx8MA%3D%3D',
    color: '#8E44AD', // Purple
    personality: '知的で冷静、バランスの取れた判断力を持つ',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.focused_deep_work,
      ABILITIES.balanced_versatility,
      ABILITIES.advanced_achievement
    ]
  },
  
  consistent_balanced_consistent_3: {
    id: 'consistent_balanced_consistent_3',
    name: 'コンセイジ',
    description: '継続の賢者',
    level: 3,
    evolutionPath: ['consistent', 'balanced', 'consistent'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1535970793482-07de93762dc4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D%3D',
    color: '#D35400', // Orange
    personality: '忍耐強く、安定した成長を続ける',
    abilities: [
      ABILITIES.consistent_streak,
      ABILITIES.balanced_adaptability,
      ABILITIES.consistent_habit,
      ABILITIES.advanced_break
    ]
  },
  
  focused_consistent_focused_3: {
    id: 'focused_consistent_focused_3',
    name: 'フォカゼン',
    description: '禅の集中マスター',
    level: 3,
    evolutionPath: ['focused', 'consistent', 'focused'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D%3D',
    color: '#2980B9', // Blue
    personality: '瞑想的で深い集中力を持つ',
    abilities: [
      ABILITIES.focused_deep_work,
      ABILITIES.consistent_streak,
      ABILITIES.focused_flow_state,
      ABILITIES.advanced_break
    ]
  },
  
  // Unique Level 4 characters
  balanced_consistent_focused_balanced_4: {
    id: 'balanced_consistent_focused_balanced_4',
    name: 'ポモセージ',
    description: '調和の賢者',
    level: 4,
    evolutionPath: ['balanced', 'consistent', 'focused', 'balanced'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFudGFzeSUyMHdpemFyZHxlbnwwfHwwfHx8MA%3D%3D',
    color: '#16A085', // Teal
    personality: '全ての要素を調和させる賢者',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.consistent_streak,
      ABILITIES.focused_deep_work,
      ABILITIES.advanced_achievement,
      ABILITIES.special_unlock
    ]
  },
  
  focused_balanced_focused_consistent_4: {
    id: 'focused_balanced_focused_consistent_4',
    name: 'フォカロード',
    description: '集中の支配者',
    level: 4,
    evolutionPath: ['focused', 'balanced', 'focused', 'consistent'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1514417034809-c7b296354f07?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhbnRhc3klMjB3aXphcmR8ZW58MHx8MHx8fDA%3D%3D',
    color: '#5D3FD3', // Purple
    personality: '強力な集中力と継続性を兼ね備えた支配者',
    abilities: [
      ABILITIES.focused_deep_work,
      ABILITIES.balanced_versatility,
      ABILITIES.focused_flow_state,
      ABILITIES.consistent_streak,
      ABILITIES.special_time_warp
    ]
  },
  
  consistent_focused_consistent_balanced_4: {
    id: 'consistent_focused_consistent_balanced_4',
    name: 'コンタイタン',
    description: '継続の巨人',
    level: 4,
    evolutionPath: ['consistent', 'focused', 'consistent', 'balanced'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGZhbnRhc3klMjB3YXJyaW9yfGVufDB8fDB8fHww',
    color: '#F39C12', // Orange
    personality: '揺るぎない意志と継続力を持つ巨人',
    abilities: [
      ABILITIES.consistent_streak,
      ABILITIES.focused_deep_work,
      ABILITIES.consistent_habit,
      ABILITIES.balanced_versatility,
      ABILITIES.advanced_game
    ]
  },
  
  // Unique Level 5 characters
  balanced_focused_consistent_balanced_focused_5: {
    id: 'balanced_focused_consistent_balanced_focused_5',
    name: 'ポモエンペラー',
    description: '時間の皇帝',
    level: 5,
    evolutionPath: ['balanced', 'focused', 'consistent', 'balanced', 'focused'],
    nextEvolutionExp: null,
    image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFudGFzeSUyMGtpbmd8ZW58MHx8MHx8fDA%3D',
    color: '#6C3483', // Deep Purple
    personality: '時間を支配する皇帝、全ての能力を極めた存在',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.focused_deep_work,
      ABILITIES.consistent_streak,
      ABILITIES.advanced_achievement,
      ABILITIES.special_unlock,
      ABILITIES.special_time_warp
    ]
  },
  
  focused_consistent_focused_consistent_focused_5: {
    id: 'focused_consistent_focused_consistent_focused_5',
    name: 'フォカオーバーロード',
    description: '集中の覇王',
    level: 5,
    evolutionPath: ['focused', 'consistent', 'focused', 'consistent', 'focused'],
    nextEvolutionExp: null,
    image: 'https://images.unsplash.com/photo-1614583225154-5fcdda07019e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGZhbnRhc3klMjBjaGFyYWN0ZXJ8ZW58MHx8MHx8fDA%3D',
    color: '#1A237E', // Deep Blue
    personality: '圧倒的な集中力と継続力を持つ覇王',
    abilities: [
      ABILITIES.focused_deep_work,
      ABILITIES.consistent_streak,
      ABILITIES.focused_flow_state,
      ABILITIES.consistent_habit,
      ABILITIES.advanced_break,
      ABILITIES.special_time_warp
    ]
  },
  
  consistent_balanced_consistent_balanced_consistent_5: {
    id: 'consistent_balanced_consistent_balanced_consistent_5',
    name: 'コンエターナル',
    description: '永遠の継続者',
    level: 5,
    evolutionPath: ['consistent', 'balanced', 'consistent', 'balanced', 'consistent'],
    nextEvolutionExp: null,
    image: 'https://images.unsplash.com/photo-1633077705107-8f67ef96eb56?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFudGFzeSUyMGFuZ2VsfGVufDB8fDB8fHww',
    color: '#FF5722', // Deep Orange
    personality: '永遠に続く意志と安定した成長を持つ存在',
    abilities: [
      ABILITIES.consistent_streak,
      ABILITIES.balanced_adaptability,
      ABILITIES.consistent_habit,
      ABILITIES.balanced_versatility,
      ABILITIES.advanced_achievement,
      ABILITIES.special_unlock
    ]
  },
  
  // New Japanese-themed characters
  ninja_focused_3: {
    id: 'ninja_focused_3',
    name: 'ニンジャフォーカス',
    description: '忍者の集中力を持つキャラクター',
    level: 3,
    evolutionPath: ['focused', 'focused', 'focused'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2F0fGVufDB8fDB8fHww',
    color: '#2C3E50', // Dark blue
    personality: '静かで素早く、影のように集中する',
    abilities: [
      ABILITIES.focused_deep_work,
      ABILITIES.focused_flow_state,
      ABILITIES.ninja_focus,
      ABILITIES.advanced_break
    ]
  },
  
  samurai_consistent_3: {
    id: 'samurai_consistent_3',
    name: 'サムライスピリット',
    description: '侍の精神を持つキャラクター',
    level: 3,
    evolutionPath: ['consistent', 'consistent', 'consistent'],
    nextEvolutionExp: 1500,
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2F0fGVufDB8fDB8fHww',
    color: '#C0392B', // Red
    personality: '規律正しく、揺るぎない意志を持つ',
    abilities: [
      ABILITIES.consistent_streak,
      ABILITIES.consistent_habit,
      ABILITIES.samurai_discipline,
      ABILITIES.advanced_achievement
    ]
  },
  
  dragon_balanced_4: {
    id: 'dragon_balanced_4',
    name: 'ドラゴンマスター',
    description: '龍の力を宿すキャラクター',
    level: 4,
    evolutionPath: ['balanced', 'balanced', 'balanced', 'balanced'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Y2F0fGVufDB8fDB8fHww',
    color: '#E74C3C', // Bright red
    personality: '威厳があり、強大な力を秘める',
    abilities: [
      ABILITIES.balanced_adaptability,
      ABILITIES.balanced_versatility,
      ABILITIES.dragon_breath,
      ABILITIES.advanced_game,
      ABILITIES.special_unlock
    ]
  },
  
  phoenix_consistent_4: {
    id: 'phoenix_consistent_4',
    name: 'フェニックスリバース',
    description: '不死鳥の再生力を持つキャラクター',
    level: 4,
    evolutionPath: ['consistent', 'consistent', 'consistent', 'consistent'],
    nextEvolutionExp: 2000,
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2F0fGVufDB8fDB8fHww',
    color: '#F39C12', // Orange
    personality: '何度でも立ち上がる不屈の精神',
    abilities: [
      ABILITIES.consistent_streak,
      ABILITIES.consistent_habit,
      ABILITIES.phoenix_rebirth,
      ABILITIES.advanced_achievement,
      ABILITIES.special_time_warp
    ]
  },
  
  kitsune_focused_5: {
    id: 'kitsune_focused_5',
    name: 'キツネノチエ',
    description: '九尾の狐の知恵を持つキャラクター',
    level: 5,
    evolutionPath: ['focused', 'focused', 'focused', 'focused', 'focused'],
    nextEvolutionExp: null,
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zm94fGVufDB8fDB8fHww',
    color: '#9B59B6', // Purple
    personality: '神秘的で賢く、古い知恵を持つ',
    abilities: [
      ABILITIES.focused_deep_work,
      ABILITIES.focused_flow_state,
      ABILITIES.kitsune_wisdom,
      ABILITIES.advanced_game,
      ABILITIES.special_unlock,
      ABILITIES.special_time_warp
    ]
  },
  
  // Default fallback
  default: {
    id: 'default',
    name: 'ポモたま',
    description: 'バランス型の初期キャラクター',
    level: 1,
    evolutionPath: ['balanced'],
    nextEvolutionExp: 500,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y3V0ZSUyMGNoYXJhY3RlcnxlbnwwfHwwfHx8MA%3D%3D',
    color: colors.primary,
    personality: '好奇心旺盛で元気いっぱい',
    abilities: [ABILITIES.basic_timer, ABILITIES.basic_xp]
  }
};

// Helper function to get character by evolution path and level
export const getCharacterByEvolutionPath = (evolutionPath: CharacterType[], level: number): Character => {
  // Create the key from the evolution path and level
  const key = [...evolutionPath].slice(0, level).join('_') + '_' + level;
  
  // Try to find the exact character
  if (CHARACTER_EVOLUTIONS[key]) {
    return CHARACTER_EVOLUTIONS[key];
  }
  
  // If not found, try to find a character with the same last type and level
  const lastType = evolutionPath[evolutionPath.length - 1];
  const fallbackKey = Array(level).fill(lastType).join('_') + '_' + level;
  
  if (CHARACTER_EVOLUTIONS[fallbackKey]) {
    return CHARACTER_EVOLUTIONS[fallbackKey];
  }
  
  // If still not found, return the default character
  return CHARACTER_EVOLUTIONS.default;
};

// Helper function to determine character type based on user stats
export const determineCharacterType = (
  sessions: number, 
  streak: number, 
  totalDays: number
): CharacterType => {
  // Simple logic: check which stat is highest
  if (sessions > streak * 3 && sessions > totalDays * 2) {
    return 'focused'; // User completes many sessions
  } else if (streak > sessions / 3 && streak > totalDays) {
    return 'consistent'; // User has long streaks
  } else {
    return 'balanced'; // Default balanced type
  }
};

// Full character list for reference (all possible evolutions)
export const ALL_CHARACTERS = Object.values(CHARACTER_EVOLUTIONS);