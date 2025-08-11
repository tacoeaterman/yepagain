import { useState, useEffect } from 'react';
import { database, ref, onValue, set, push, update } from '@/lib/firebase';
import { GameState, Player, Card, CARD_DECK } from '@/types/game';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useGame() {
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [hasHostingPrivilege, setHasHostingPrivilege] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Listen for user's hosting privilege status
      const userRef = ref(database, `users/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        setHasHostingPrivilege(userData?.hasHostingPrivilege || false);
      });
      return unsubscribe;
    }
  }, [user]);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Create a shuffled deck of 65 cards
  const createShuffledDeck = (): Card[] => {
    const deck: Card[] = [];
    
    // Add cards based on their copies
    CARD_DECK.forEach(card => {
      for (let i = 0; i < card.copies; i++) {
        deck.push({ ...card, id: `${card.id}_${i}` });
      }
    });
    
    // Shuffle the deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  // Deal cards to players
  const dealCards = (players: Record<string, Player>, deck: Card[]): { players: Record<string, Player>, remainingDeck: Card[] } => {
    const updatedPlayers = { ...players };
    const remainingDeck = [...deck];
    
    Object.keys(updatedPlayers).forEach(playerId => {
      const hand: Card[] = [];
      // Deal 5 cards to each player
      for (let i = 0; i < 5; i++) {
        if (remainingDeck.length > 0) {
          hand.push(remainingDeck.pop()!);
        }
      }
      updatedPlayers[playerId].hand = hand;
    });
    
    return { players: updatedPlayers, remainingDeck };
  };

  const createGame = async (totalHoles: number, gameName?: string) => {
    if (!user || !hasHostingPrivilege) {
      toast({
        title: "Cannot create game",
        description: "You need hosting privileges to create a game",
        variant: "destructive",
      });
      return;
    }

    try {
      const gameCode = generateGameCode();
      const gameRef = push(ref(database, 'games'));
      
      // Create initial player data
      const initialPlayer: Player = {
        id: user.uid,
        name: user.displayName || user.email!,
        isHost: true,
        isReady: true,
        strokes: [],
        scores: [],
        totalScore: 0,
        hand: [], // Will be dealt when game starts
      };

      const gameData: Partial<GameState> = {
        id: gameRef.key!,
        gameCode,
        hostId: user.uid,
        gameName,
        totalHoles,
        currentHole: 1,
        currentPar: 3,
        pars: Array.from({ length: totalHoles }, () => 3),
        parsSet: Array.from({ length: totalHoles }, () => false), // Track which holes have par set
        gamePhase: 'lobby',
        players: {
          [user.uid]: initialPlayer
        },
        gameActivity: [`${user.displayName || user.email} created the game`],
         deck: [], // Will be created when game starts
        discardPile: [],
         gameRound: 'before_throw',
      };

      await set(gameRef, gameData);
      
      toast({
        title: "Game created!",
        description: `Game code: ${gameCode}`,
      });
      
      return gameCode;
    } catch (error: any) {
      toast({
        title: "Error creating game",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinGame = async (gameCode: string) => {
    if (!user) return;

    try {
      // Find game by code
      const gamesRef = ref(database, 'games');
      onValue(gamesRef, (snapshot) => {
        const games = snapshot.val();
        const gameEntry = Object.entries(games || {}).find(
          ([, game]: [string, any]) => game.gameCode === gameCode.toUpperCase()
        );

        if (!gameEntry) {
          toast({
            title: "Game not found",
            description: "Please check the game code and try again",
            variant: "destructive",
          });
          return;
        }

        const [gameId, gameData] = gameEntry as [string, GameState];
        
        if (Object.keys(gameData.players).length >= 6) {
          toast({
            title: "Game is full",
            description: "This game already has 6 players",
            variant: "destructive",
          });
          return;
        }

        // Add player to game
        const playerData: Player = {
          id: user.uid,
          name: user.displayName || user.email!,
          isHost: false,
          isReady: false,
          strokes: [],
          scores: [],
          totalScore: 0,
          hand: [], // Will be dealt when game starts
        };

        const updates = {
          [`games/${gameId}/players/${user.uid}`]: playerData,
          [`games/${gameId}/gameActivity`]: [
            ...(gameData.gameActivity || []),
            `${user.displayName || user.email} joined the game`
          ]
        };

        update(ref(database), updates);
        
        toast({
          title: "Joined game!",
          description: `Welcome to ${gameData.gameName || 'the game'}`,
        });
      }, { onlyOnce: true });
    } catch (error: any) {
      toast({
        title: "Error joining game",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const listenToGame = (gameId: string) => {
    const gameRef = ref(database, `games/${gameId}`);
    return onValue(gameRef, (snapshot) => {
      const gameData = snapshot.val();
      if (gameData) {
        // Preserve the id so subscribers don't lose the identifier
        setCurrentGame((prev) => ({ ...gameData, id: gameId }));
      }
    });
  };

  const findGameByCode = async (gameCode: string) => {
    if (!user) return;

    try {
      const gamesRef = ref(database, 'games');
      return new Promise((resolve, reject) => {
        onValue(gamesRef, (snapshot) => {
          const games = snapshot.val();
          const gameEntry = Object.entries(games || {}).find(
            ([, game]: [string, any]) => game.gameCode === gameCode.toUpperCase()
          );

          if (gameEntry) {
            const [gameId, gameData] = gameEntry as [string, GameState];
            setCurrentGame({ ...gameData, id: gameId });
            resolve(gameData);
          } else {
            reject(new Error('Game not found'));
          }
        }, { onlyOnce: true });
      });
    } catch (error: any) {
      toast({
        title: "Error finding game",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const startGame = async (gameId: string) => {
    if (!user || !currentGame) return;

    try {
      // Create and shuffle the deck
      const shuffledDeck = createShuffledDeck();
      
      // Deal cards to all players
      const { players: dealtPlayers, remainingDeck } = dealCards(currentGame.players, shuffledDeck);
      
      const gameRef = ref(database, `games/${gameId}`);
      await update(gameRef, { 
        gamePhase: 'playing',
        players: dealtPlayers,
        deck: remainingDeck,
        currentPlayerTurn: null,
        gameRound: 'scoring',
        gameActivity: [
          ...(currentGame.gameActivity || []),
          `${user.displayName || user.email} started the game`,
          'Cards have been dealt to all players!'
        ]
      });
      
      toast({
        title: "Game started!",
        description: "Cards have been dealt to all players",
      });
    } catch (error: any) {
      toast({
        title: "Error starting game",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const playCard = async (gameId: string, cardId: string, targetPlayerId?: string) => {
    if (!user || !currentGame) return;

    try {
      const currentPlayer = currentGame.players[user.uid];
      if (!currentPlayer) {
        toast({
          title: "Error",
          description: "Player not found in game",
          variant: "destructive",
        });
        return;
      }

      // Find the card in player's hand
      const cardIndex = currentPlayer.hand.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
        toast({
          title: "Error",
          description: "Card not found in hand",
          variant: "destructive",
        });
        return;
      }

      const playedCard = currentPlayer.hand[cardIndex];
      
      // Remove card from hand
      const updatedHand = [...currentPlayer.hand];
      updatedHand.splice(cardIndex, 1);
      
      // Add to discard pile
      const updatedDiscardPile = [...(currentGame.discardPile || []), playedCard];
      
      // Update game state
      const updates = {
        [`games/${gameId}/players/${user.uid}/hand`]: updatedHand,
        [`games/${gameId}/discardPile`]: updatedDiscardPile,
        [`games/${gameId}/gameActivity`]: [
          ...(currentGame.gameActivity || []),
          `${user.displayName || user.email} played ${playedCard.name}` + (targetPlayerId ? ` on ${currentGame.players[targetPlayerId]?.name || 'a player'}` : '')
        ]
      };

      await update(ref(database), updates);
      
      toast({
        title: "Card played!",
        description: `${playedCard.name} has been played`,
      });
    } catch (error: any) {
      toast({
        title: "Error playing card",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const submitScore = async (gameId: string, holeIndex: number, score: number) => {
    if (!user || !currentGame) return;

    try {
      // Validate score range
      if (!Number.isInteger(score) || score < 1 || score > 30) {
        toast({
          title: "Invalid score",
          description: "Score must be a whole number between 1 and 30 strokes",
          variant: "destructive",
        });
        return;
      }

      // Check if par has been set for this hole
      const parIsSet = currentGame.parsSet?.[holeIndex] ?? false;
      if (!parIsSet) {
        toast({
          title: "Cannot submit score",
          description: "The host must set par for this hole first",
          variant: "destructive",
        });
        return;
      }

      // Ensure player exists and has scores array
      const currentPlayer = currentGame.players[user.uid];
      if (!currentPlayer) {
        toast({
          title: "Error",
          description: "Player not found in game",
          variant: "destructive",
        });
        return;
      }

      // Store raw strokes for the hole
      const playerStrokes = [...(currentPlayer.strokes || [])];
      playerStrokes[holeIndex] = score;
      
      // Calculate golf score (strokes - par) for this hole
      const holeParValue = currentGame.pars?.[holeIndex] ?? currentGame.currentPar ?? 3;
      const holeGolfScore = score - holeParValue;
      
      // Store golf scores for each hole
      const playerScores = [...(currentPlayer.scores || [])];
      playerScores[holeIndex] = holeGolfScore;
      
      // Calculate total golf score (sum of all hole scores relative to par)
      const totalScore = playerScores.reduce((sum, s) => sum + (s || 0), 0);
      
      const updates = {
        [`games/${gameId}/players/${user.uid}/strokes`]: playerStrokes,
        [`games/${gameId}/players/${user.uid}/scores`]: playerScores,
        [`games/${gameId}/players/${user.uid}/totalScore`]: totalScore,
      };

      await update(ref(database), updates);
      
      const scoreDisplay = holeGolfScore > 0 ? `+${holeGolfScore}` : holeGolfScore.toString();
      toast({
        title: "Score submitted!",
        description: `Hole ${holeIndex + 1}: ${score} strokes (${scoreDisplay})`,
      });

      // Check if all players have now scored for this hole (including the player who just scored)
      const checkAllPlayersScoredAndAdvance = () => {
        if (!currentGame) return;
        const idx = currentGame.currentHole - 1;
        const parIsSet = currentGame.parsSet?.[idx] ?? false;
        
        // Only check if all players scored if par is set
        if (!parIsSet) return;
        
        // Check if all players (including the one who just scored) have scores for this hole
        const allPlayersScored = Object.values(currentGame.players).every(player => {
          // For the current player who just scored, use the updated scores
          if (player.id === user.uid) {
            return typeof playerScores[idx] === 'number';
          }
          // For other players, check their existing scores
          return typeof player.scores?.[idx] === 'number';
        });
        
        if (allPlayersScored) {
          // Small delay to let the toast show, then auto-advance
          setTimeout(() => {
            advanceToNextHole(gameId);
          }, 1500);
        }
      };

      // Check and auto-advance if all players have scored
      checkAllPlayersScoredAndAdvance();
    } catch (error: any) {
      toast({
        title: "Error submitting score",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Host sets par for the current hole
  const setParForHole = async (gameId: string, par: number) => {
    if (!user || !currentGame) return;
    if (user.uid !== currentGame.hostId) return; // only host

    const nextPars = [...(currentGame.pars || Array.from({ length: currentGame.totalHoles }, () => 3))];
    nextPars[(currentGame.currentHole - 1)] = par;
    
    const nextParsSet = [...(currentGame.parsSet || Array.from({ length: currentGame.totalHoles }, () => false))];
    nextParsSet[(currentGame.currentHole - 1)] = true;
    
    const updates = {
      currentPar: par,
      pars: nextPars,
      parsSet: nextParsSet,
      gameActivity: [
        ...(currentGame.gameActivity || []),
        `Par set to ${par} for hole ${currentGame.currentHole}`,
      ],
    };
    

    
    await update(ref(database, `games/${gameId}`), updates);
  };

  // Advance to the next hole; deal a card to last place every third hole; finish game at end
  const advanceToNextHole = async (gameId: string) => {
    if (!user || !currentGame) return;

    const nextHole = currentGame.currentHole + 1;
    // If we've completed the last hole, finish the game
    if (nextHole > currentGame.totalHoles) {
      console.log('🏁 Game finishing! nextHole:', nextHole, 'totalHoles:', currentGame.totalHoles);
      await update(ref(database, `games/${gameId}`), {
        gamePhase: 'finished',
        gameActivity: [
          ...(currentGame.gameActivity || []),
          'Game finished!'
        ],
      });
      console.log('🏁 Game phase set to finished in Firebase');
      toast({ title: 'Round complete!', description: 'Game has been finished.' });
      return;
    }
    let updates: Record<string, any> = {
      [`games/${gameId}/currentHole`]: nextHole,
      [`games/${gameId}/gameActivity`]: [
        ...(currentGame.gameActivity || []),
        `Advanced to hole ${nextHole}`,
      ],
    };

    // Only set currentPar if it was previously set by host for this hole
    if (currentGame.parsSet?.[nextHole - 1]) {
      updates[`games/${gameId}/currentPar`] = currentGame.pars?.[nextHole - 1] ?? 3;
    } else {
      // Reset currentPar to indicate no par is set yet
      updates[`games/${gameId}/currentPar`] = 3; // Default for display, but parsSet[hole] will be false
    }

    // Every third hole completed (i.e., moving to 4, 7, 10, ...), reward last place
    if ((nextHole - 1) % 3 === 0) {
      // compute last place by highest totalScore
      const playersArr = Object.values(currentGame.players);
      const lastPlace = playersArr.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))[0];
      if (lastPlace) {
        // draw one card from deck
        const deckCopy = [...(currentGame.deck || [])];
        const drawn = deckCopy.pop();
        if (drawn) {
          const lastHand = [...(currentGame.players[lastPlace.id]?.hand || [])];
          lastHand.push(drawn);
          updates = {
            ...updates,
            [`games/${gameId}/deck`]: deckCopy,
            [`games/${gameId}/players/${lastPlace.id}/hand`]: lastHand,
            [`games/${gameId}/gameActivity`]: [
              ...(updates[`games/${gameId}/gameActivity`] || []),
              `${lastPlace.name} received a bonus card for being in last place`,
            ],
          };
        }
      }
    }

    await update(ref(database), updates);
  };

  const purchaseHosting = async () => {
    if (!user) return;

    try {
      // Simulate purchase - in real app would integrate with payment processor
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, { hasHostingPrivilege: true });
      
      toast({
        title: "Purchase successful!",
        description: "You can now host games",
      });
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    currentGame,
    hasHostingPrivilege,
    createGame,
    joinGame,
    listenToGame,
    findGameByCode,
    startGame,
    playCard,
    submitScore,
    setParForHole,
    advanceToNextHole,
    purchaseHosting,
  };
}
