/**
 * RotationManager.js
 * 
 * Utilidad para manejar la rotación de jugadores en el juego de Americana de padel.
 * Implementa una estrategia para que todos los jugadores jueguen contra todos.
 */

// Función para generar rotaciones óptimas donde todos juegan contra todos
export const generateOptimalRotations = (totalPlayers) => {
    // Si no hay suficientes jugadores para una rotación completa
    if (totalPlayers < 4) {
      return [];
    }
    
    // Crear array con todos los jugadores
    const players = Array.from({ length: totalPlayers }, (_, i) => i);
    
    // Número de canchas disponibles
    const numCourts = Math.floor(totalPlayers / 4);
    
    // Número total de rondas necesarias para que todos jueguen contra todos
    const totalRounds = totalPlayers - 1;
    
    // Array para almacenar todas las rotaciones
    const rotations = [];
    
    // Implementación del algoritmo de rotación "Round-Robin"
    // Mantiene el primer jugador fijo y rota el resto
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches = [];
      
      // Para cada ronda, crear las parejas
      for (let court = 0; court < numCourts; court++) {
        // Cada cancha tiene 2 parejas = 4 jugadores
        const courtPlayers = [];
        
        // Calcular los índices de los jugadores para este partido
        // usando una fórmula para asegurar que todos jueguen contra todos
        const offset = (round * 2) % (totalPlayers - 1);
        const idx1 = 0; // El primer jugador siempre es fijo
        const idx2 = 1 + ((offset + court * 2) % (totalPlayers - 1));
        const idx3 = 1 + ((offset + court * 2 + 1) % (totalPlayers - 1));
        const idx4 = 1 + ((offset + totalPlayers - court * 2 - 2) % (totalPlayers - 1));
        
        courtPlayers.push(players[idx1], players[idx2], players[idx3], players[idx4]);
        roundMatches.push(courtPlayers);
      }
      
      rotations.push(roundMatches);
    }
    
    return rotations;
  };
  
  // Función para rotar jugadores usando un método simple
  export const rotatePlayersSimple = (players, round) => {
    if (!players || players.length < 4) {
      return players;
    }
    
    // Crear una copia para no mutar el array original
    const playersCopy = [...players];
    
    // Para rondas impares, cambiar la rotación (para evitar repeticiones)
    const isOddRound = round % 2 === 1;
    
    if (isOddRound) {
      // Rotación para rondas impares: Mueve la segunda mitad al principio
      const halfIndex = Math.floor(playersCopy.length / 2);
      const firstHalf = playersCopy.slice(0, halfIndex);
      const secondHalf = playersCopy.slice(halfIndex);
      return [...secondHalf, ...firstHalf];
    } else {
      // Rotación para rondas pares: Rota 1 posición
      const rotationAmount = round % playersCopy.length;
      return [
        ...playersCopy.slice(rotationAmount),
        ...playersCopy.slice(0, rotationAmount)
      ];
    }
  };
  
  // Función para convertir jugadores en parejas (2 jugadores por pareja)
  export const createPairs = (players) => {
    if (!players || players.length < 2) {
      return [];
    }
    
    const pairs = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        pairs.push([players[i], players[i + 1]]);
      } else {
        // Si queda un jugador impar, agregarlo solo
        pairs.push([players[i]]);
      }
    }
    
    return pairs;
  };
  
  // Función para distribuir jugadores en canchas (4 jugadores por cancha)
  export const distributeIntoCourts = (players, numCourts) => {
    if (!players || players.length < 4 || numCourts < 1) {
      return { courts: [], pending: players || [] };
    }
    
    const courts = Array.from({ length: numCourts }, () => []);
    const pending = [];
    
    // Distribuir jugadores en las canchas
    players.forEach((player, index) => {
      const courtIndex = Math.floor(index / 4);
      if (courtIndex < numCourts) {
        courts[courtIndex].push(player);
      } else {
        pending.push(player);
      }
    });
    
    return { courts, pending };
  };