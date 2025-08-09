export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  scores: number[];
  totalScore: number;
  hand: Card[]; // Player's dealt cards
  position?: number; // Current position in game
}

export interface Card {
  id: string;
  name: string;
  category: 'Before Throw' | 'After Throw' | 'Self' | 'Wild';
  description: string;
  copies: number; // How many copies in the deck
  effect: string; // What the card does
}

export interface GameState {
  id: string;
  gameCode: string;
  hostId: string;
  courseName?: string;
  totalHoles: number;
  currentHole: number;
  currentPar: number;
  pars?: number[]; // Per-hole par values indexed by (hole - 1)
  gamePhase: 'lobby' | 'playing' | 'finished';
  players: Record<string, Player>;
  gameActivity: string[];
  deck: Card[]; // Full deck of 65 cards
  discardPile: Card[]; // Cards that have been played
  currentPlayerTurn?: string; // Whose turn it is
  gameRound: 'before_throw' | 'after_throw' | 'scoring'; // Current game phase
}

// Card definitions
export const CARD_DECK: Card[] = [
  // Before Throw Cards (4 copies each)
  {
    id: 'stranger',
    name: 'The Stranger',
    category: 'Before Throw',
    description: 'Make an opponent throw their next throw with their offhand.',
    copies: 4,
    effect: 'force_offhand'
  },
  {
    id: 'shrink_ray',
    name: 'Shrink Ray',
    category: 'Before Throw',
    description: 'Make an opponent throw a mini on their next throw.',
    copies: 4,
    effect: 'force_mini'
  },
  {
    id: 'because_i_said_so',
    name: 'Because I Said So',
    category: 'Before Throw',
    description: 'Make a mando all other players must make. (mando must be on current hole)',
    copies: 4,
    effect: 'force_mando'
  },
  {
    id: 'im_you_silly',
    name: "I'm You Silly",
    category: 'Before Throw',
    description: 'Take an opponent\'s throw for them.',
    copies: 4,
    effect: 'take_throw'
  },
  {
    id: 'is_that_what_youre_throwing',
    name: 'Is That What You\'re Throwing',
    category: 'Before Throw',
    description: 'Make an opponent throw a disc of your choosing from yours or their bag.',
    copies: 4,
    effect: 'force_disc_choice'
  },

  // After Throw Cards (4 copies each)
  {
    id: 'gremlins',
    name: 'Gremlins',
    category: 'After Throw',
    description: 'Move an opponent\'s disc 10 paces in any direction.',
    copies: 4,
    effect: 'move_opponent_disc'
  },
  {
    id: 'thats_my_disc',
    name: 'That\'s My Disc',
    category: 'After Throw',
    description: 'Swap lies with an opponent.',
    copies: 4,
    effect: 'swap_lies'
  },
  {
    id: 'merely_a_flesh_wound',
    name: 'Merely a Flesh Wound',
    category: 'After Throw',
    description: 'Make all opponents throw from their knees (both knees must be touching the ground).',
    copies: 4,
    effect: 'force_knees'
  },
  {
    id: 'thats_not_fair',
    name: 'That\'s Not Fair',
    category: 'After Throw',
    description: 'Make an opponent rethrow last throw and take worst lie.',
    copies: 4,
    effect: 'force_rethrow_worst'
  },
  {
    id: 'instant_replay',
    name: 'Instant Replay',
    category: 'After Throw',
    description: 'Make all opponents rethrow last throw and take the worst lie.',
    copies: 4,
    effect: 'force_all_rethrow_worst'
  },

  // Self Cards (4 copies each)
  {
    id: 'im_rubber_you_glue',
    name: 'I\'m Rubber You Glue',
    category: 'Self',
    description: 'Reflects a card played on you back at the person who played it.',
    copies: 4,
    effect: 'reflect_card'
  },
  {
    id: 'i_reject_your_reality',
    name: 'I Reject Your Reality',
    category: 'Self',
    description: 'Redirects a card played on you to another opponent.',
    copies: 4,
    effect: 'redirect_card'
  },
  {
    id: 'it_was_here_i_swear',
    name: 'It Was Here I Swear',
    category: 'Self',
    description: 'Move your disc 10 paces in any direction.',
    copies: 4,
    effect: 'move_own_disc'
  },
  {
    id: 'mulligan',
    name: 'Mulligan',
    category: 'Self',
    description: 'Rethrow last throw and take best lie.',
    copies: 4,
    effect: 'rethrow_best'
  },
  {
    id: 'seeing_double',
    name: 'Seeing Double',
    category: 'Self',
    description: 'Putt twice take the best lie.',
    copies: 4,
    effect: 'double_putt_best'
  },

  // Wild Cards (1 copy each)
  {
    id: 'jealousy',
    name: 'Jealousy',
    category: 'Wild',
    description: 'Change scorecards with an opponent of your choosing. If reflected back, trade with last place or +3 if you\'re last.',
    copies: 1,
    effect: 'swap_scorecards'
  },
  {
    id: 'i_need_some_space',
    name: 'I Need Some Space',
    category: 'Wild',
    description: 'Move your disc 10 paces closer to the basket and all other players must move theirs 10 further away.',
    copies: 1,
    effect: 'move_closer_others_further'
  },
  {
    id: 'hear_it_ring',
    name: 'Hear It Ring',
    category: 'Wild',
    description: 'If your disc hits metal it counts as in the basket.',
    copies: 1,
    effect: 'metal_counts_in'
  },
  {
    id: 'whats_par_again',
    name: 'What\'s Par Again',
    category: 'Wild',
    description: 'Add +1 to par for you and -1 to par for all opponents on this hole.',
    copies: 1,
    effect: 'adjust_par'
  },
  {
    id: 'ace_run',
    name: 'Ace Run',
    category: 'Wild',
    description: 'Next throw counts as an ace.',
    copies: 1,
    effect: 'next_throw_ace'
  }
];
