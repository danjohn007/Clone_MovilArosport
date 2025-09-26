import APIManager from "../../API/APIManager";

/**
 * Obtiene los jugadores asignados a un juego
 * @param {number} idJuego ID del juego
 * @returns {Promise<Array>} Array de jugadores
 */
export const fetchJugadoresJuego = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Activos/getJugadoresJuego/${idJuego}`,
      method: "GET"
    });
    
    if (res && Array.isArray(res)) {
      return res;
    }
    return [];
  } catch (error) {
    console.log("Error al obtener jugadores:", error);
    throw error;
  }
};

/**
 * Obtiene las parejas de un juego de tipo Americana
 * @param {number} idJuego ID del juego
 * @returns {Promise<Array>} Array de parejas
 */
export const fetchParejasAmericana = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Americana/obtenerParejasAmericana/${idJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    console.log("Error al obtener parejas:", error);
    throw error;
  }
};

/**
 * Verifica si existen jugadas registradas para el juego
 * @param {number} idJuego ID del juego
 * @returns {Promise<Object>} Objeto con la respuesta
 */
export const verificarJugadoresAmericana = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Activos/obtenerJugadoresAmericana/${idJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    console.log("Error al verificar jugadores:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de puntos de un juego de Americana
 * @param {number} idJuego ID del juego
 * @returns {Promise<Array>} Array con el historial de puntos
 */
export const fetchHistorialPuntosAmericana = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Americana/obtenerHistorialPuntos/${idJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    console.log("Error al obtener historial de puntos:", error);
    throw error;
  }
};

/**
 * Guarda una ronda de juego en la BD
 * @param {number} idJuego ID del juego
 * @param {number} ronda Número de ronda
 * @param {Array} parejas Array con las parejas y sus puntos
 * @returns {Promise<Object>} Respuesta de la API
 */
export const guardarRondaAmericana = async (idJuego, ronda, parejas, marcadorTieBreak = null) => {
  console.log(" ronda",ronda);
    console.log(" parejas",parejas);
  try {
    const data = [];

    parejas.forEach((pareja, index) => {
      const { jugadores, puntos, nombre_cancha } = pareja;
      const [jugador1, jugador2, jugador3, jugador4] = jugadores;

      // Aquí agregamos los campos del tie break, si vienen

      // Obtenemos el marcador tie break específico para esta cancha
      const marcador = marcadorTieBreak && marcadorTieBreak[index];
      const tieBreakP1 = marcador ? marcador.pareja1 : null;
      const tieBreakP2 = marcador ? marcador.pareja2 : null;

      data.push({
        id_juego: idJuego,
        ronda: ronda,
        id_jugador1_p1: jugador1.id || null,
        nombre_jugador1_p1: jugador1.nombre || "",
        id_jugador2_p1: jugador2.id || null,
        nombre_jugador2_p1: jugador2.nombre || "",

        id_jugador1_p2: jugador3.id || null,
        nombre_jugador1_p2: jugador3.nombre || "",
        id_jugador2_p2: jugador4.id || null,
        nombre_jugador2_p2: jugador4.nombre || "",

        puntos_p1: puntos.pareja1 || 0,
        puntos_p2: puntos.pareja2 || 0,

        // Nuevos campos para tie break (si aplica)
        puntos_tieBreak_p1: tieBreakP1,
        puntos_tieBreak_p2: tieBreakP2,

        estatus: 1,
        nombre_cancha: Array.isArray(nombre_cancha) ? nombre_cancha[0] : nombre_cancha,

      });
    });

    const response = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Activos/guardarRonda",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const res = await response.json();
    console.log("datos de ronda", res);
    return res;
  } catch (error) {
    console.log("Error al guardar ronda:", error);
    throw error;
  }
};



export const obtenerRondasAmericana = async (idJuego) => {
  try {
    const response = await fetch(
      `https://arosports.app/arosports/private/movil/Activos/Activos/obtenerRondas/${idJuego}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const res = await response.json();
    console.log("Datos de rondas obtenidos", res);

    // Devuelve el objeto completo
    return {
      rondas: res.rondas || [],
      id_creador: res.id_creador || null
    };
  } catch (error) {
    console.log("Error al obtener rondas:", error);
    throw error;
  }
};

export const actualizarRondaAmericana = async ({ id_ronda, puntos, tieBreak = null }) => {
  console.log("id de ronda", id_ronda);
  console.log("puntos", puntos);
  console.log("tieBreak", tieBreak);

  try {
    // Construimos el body dinámicamente
    const bodyData = {
      id_ronda,
    };

    if (puntos !== null) {
      bodyData.puntos = puntos;
    }

    if (tieBreak !== null) {
      bodyData.tieBreak = tieBreak;
    }

    const response = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Activos/actualizarRonda",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      }
    );

    const res = await response.json();
    // console.log("Ronda actualizada correctamente:", res);
    return res;
  } catch (error) {
    console.error("Error al actualizar ronda:", error);
    throw error;
  }
};



/**
 * Registra los ganadores del juego
 * @param {number} idJuego ID del juego
 * @param {Array} ganadores Array con los IDs de los jugadores ganadores
 * @returns {Promise<Object>} Respuesta de la API
 */
export const registrarGanadoresAmericana = async (idJuego, ganadores) => {
  try {
    const res = await APIManager({
      url: `Activos/Americana/registrarGanadores`,
      method: "POST",
      data: {
        id_juego: idJuego,
        ganadores
      }
    });
    return res;
  } catch (error) {
    console.log("Error al registrar ganadores:", error);
    throw error;
  }
};

/**
 * Termina un juego activo
 * @param {number} idJuego ID del juego
 * @returns {Promise<Object>} Respuesta de la API
 */
// Función terminarJuego en React Native

export const terminarJuego = async (idJuego, id_usuario) => {
  console.log("id usuario del juego", id_usuario);
  try {
    const formData = new FormData();
    formData.append('id_juego', idJuego);
    formData.append('id_usuario', id_usuario);

    const res = await APIManager({
      url: `Activos/Activos/terminarJuego`,
      method: "POST",
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res && res.status !== undefined) {
      console.log("Resultado de la respuesta", res);
      if (res.status) {
        console.log("Éxito", "Juego terminado correctamente");
        return res;
      } else {
        console.log("Error", res.message || "No se pudo terminar el juego");
      }
    } else {
      console.log("Respuesta inesperada del servidor", res);
    }
  } catch (error) {
    console.log("Error al terminar el juego:", error);
    throw error;
  }
};




/**
 * Agrega un jugador manual al juego
 * @param {number} idJuego ID del juego
 * @param {string} nombreJugador Nombre del jugador manual
 * @returns {Promise<Object>} Respuesta de la API
 */
export const agregarJugadorManual = async (idJuego, nombreJugador) => {
  try {
    const res = await APIManager({
      url: `Activos/Americana/agregarJugadorManual`,
      method: "POST",
      data: {
        id_juego: idJuego,
        nombre: nombreJugador
      }
    });
    return res;
  } catch (error) {
    console.log("Error al agregar jugador manual:", error);
    throw error;
  }
};

/**
 * Funcion para manejar el limite de puntos en la americana
 * @param {number} idJuego ID del juego
 * @param {number} limitePuntos Límite de puntos a establecer
 * @returns {Promise<Object>} Respuesta de la API
 */
export const establecerLimitePuntos = async (idJuego, limitePuntos) => {
  try {
    const response = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Americana/Americana/actualizarLimitePuntos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_juego: idJuego,
          puntos: limitePuntos
        }),
      }
    );

    const res = await response.json();
    console.log("Límite de puntos establecido:", res);
    return res;
  } catch (error) {
    console.log("Error al establecer límite de puntos:", error);
    throw error;
  }
};