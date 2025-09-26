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
    //console.log("Error al obtener jugadores:", error);
    throw error;
  }
};

/**
 * Obtiene las parejas de un juego de tipo Americana
 * @param {number} idJuego ID del juego
 * @returns {Promise<Array>} Array de parejas
 */
export const fetchParejasReta = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/getParejasReta/${idJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    console.log("Error al obtener parejas:", error);
    throw error;
  }
};

/**
 * Obtiene el historial de puntos de un juego de Americana
 * @param {number} idJuego ID del juego
 * @returns {Promise<Array>} Array con el historial de puntos
 */
export const fetchHistorialPuntosReta = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/obtenerHistorialPuntos/${idJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    //console.log("Error al obtener historial de puntos:", error);
    throw error;
  }
};

/**
 * Guarda una ronda de juego en la BD
 * @param {number} idJuego ID del juego
 * @param {number} ronda Número de ronda
 * @param {Array} partidas Array con las partidas y sus puntos
 * @returns {Promise<Object>} Respuesta de la API
 */
export const guardarRondaReta = async (idJuego, ronda, partidas, tieBreak = null) => {
  try {
    const data = [];
    const data2 = [];

    partidas.forEach((partida, index) => {
      const { jugadores, puntos, nombre_cancha  } = partida;
      const [jugador1, jugador2, jugador3, jugador4] = jugadores;

      // Obtenemos el marcador tie break específico para esta cancha
      const marcador = tieBreak && tieBreak[index];
      const tieBreakP1 = marcador ? marcador.pareja1 : null;
      const tieBreakP2 = marcador ? marcador.pareja2 : null;

      // Primera pareja
      data.push({
        id_juego: idJuego,
        num_ronda: ronda,
        id_jugador1: jugador1.id || null,
        us_jugador1: jugador1.nombre || "",
        id_jugador2: jugador2.id || null,
        us_jugador2: jugador2.nombre || "",
        set1: puntos.set1[0] || 0,
        set2: puntos.set2[0] ? (puntos.set2[0] || 0) : null,
        set3: puntos.set3[0] ? (puntos.set3[0] || 0) : null,
        tiebreak: tieBreakP1,
        pareja: 0,
        Estatus: 1,
        nombre_cancha: nombre_cancha || "", // ➕ agrega aquí

      });

      // Segunda pareja
      data2.push({
        id_juego: idJuego,
        num_ronda: ronda,
        id_jugador1: jugador3.id || null,
        us_jugador1: jugador3.nombre || "",
        id_jugador2: jugador4.id || null,
        us_jugador2: jugador4.nombre || "",
        set1: puntos.set1[1] || 0,
        set2: puntos.set2[1] ? (puntos.set2[1] || 0) : null,
        set3: puntos.set3[1] ? (puntos.set3[1] || 0) : null,
        tiebreak: tieBreakP2,
        pareja: 0,
        Estatus: 1,
        nombre_cancha: nombre_cancha || "", // ➕ agrega aquí también

      });
    });

    //console.log("Enviando datos primera pareja:", JSON.stringify(data[0]));
    //console.log("Enviando datos segunda pareja:", JSON.stringify(data2[0]));

    const response = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Reta/Reta/guardarJugadaReta",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data[0]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en primera llamada:", errorText);
      throw new Error(`Error en primera llamada: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();
    console.log("Respuesta primera pareja:", res);
    
    if (!res || !res.id_rondajuego) {
      throw new Error("No se recibió id_rondajuego en la respuesta");
    }
    
    const idRondaJuego = res.id_rondajuego;

    const response2 = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Reta/Reta/guardarJugadaReta",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data2[0]),
      }
    );

    if (!response2.ok) {
      const errorText = await response2.text();
      console.error("Error en segunda llamada:", errorText);
      throw new Error(`Error en segunda llamada: ${response2.status} ${response2.statusText}`);
    }

    const res2 = await response2.json();
    console.log("Respuesta segunda pareja:", res2);
    
    if (!res2 || !res2.id_rondajuego) {
      throw new Error("No se recibió id_rondajuego en la segunda respuesta");
    }
    
    const idRondaJuego2 = res2.id_rondajuego;

    return { idRondaJuego, idRondaJuego2 };
  } catch (error) {
    console.error("Error detallado al guardar ronda:", error);
    throw error;
  }
};

export const obtenerRondasReta = async (idJuego) => {
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

export const actualizarRondaReta = async (id_ronda, id_ronda2, puntos, tieBreak = null) => {
  //console.log("id de ronda", id_ronda);
  //console.log("puntos", puntos);
  //console.log("tieBreak", tieBreak);

  try {
    const bodyData = [
      {
        id_juego: id_ronda,
        set1: (puntos.set1 && (puntos.set1[0] > 0 || puntos.set1[1] > 0)) ? (puntos.set1[0] ?? null) : null,
        set2: (puntos.set2 && (puntos.set2[0] > 0 || puntos.set2[1] > 0)) ? (puntos.set2[0] ?? null) : null,
        set3: (puntos.set3 && (puntos.set3[0] > 0 || puntos.set3[1] > 0)) ? (puntos.set3[0] ?? null) : null,
        tiebreak: tieBreak ? tieBreak[0] : null,
      },
      {
        id_juego: id_ronda2,
        set1: (puntos.set1 && (puntos.set1[0] > 0 || puntos.set1[1] > 0)) ? (puntos.set1[1] ?? null) : null,
        set2: (puntos.set2 && (puntos.set2[0] > 0 || puntos.set2[1] > 0)) ? (puntos.set2[1] ?? null) : null,
        set3: (puntos.set3 && (puntos.set3[0] > 0 || puntos.set3[1] > 0)) ? (puntos.set3[1] ?? null) : null,
        tiebreak: tieBreak ? tieBreak[1] : null,
      },
    ];
  

    //console.log("Datos a enviar:", bodyData);

    const response = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Reta/Reta/actualizarPuntosReta",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la actualización:", errorText);
      throw new Error(`Error en la actualización: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();
    //console.log("Ronda actualizada correctamente:", res);
    return res;
  } catch (error) {
    //console.error("Error al actualizar ronda:", error);
    throw error;
  }
};

export const actualizarRonda = async (id_ronda, id_ronda2, puntos, tieBreak = null) => {
  //console.log("id de ronda", id_ronda);
  //console.log("puntos", puntos);
  //console.log("tieBreak", tieBreak);

  try {
    const bodyData = [
      {
        id_juego: id_ronda,
        set1: (puntos.set1 && (puntos.set1[0] > 0 || puntos.set1[1] > 0)) ? (puntos.set1[0] ?? null) : null,
        set2: (puntos.set2 && (puntos.set2[0] > 0 || puntos.set2[1] > 0)) ? (puntos.set2[0] ?? null) : null,
        set3: (puntos.set3 && (puntos.set3[0] > 0 || puntos.set3[1] > 0)) ? (puntos.set3[0] ?? null) : null,
        tiebreak: tieBreak && tieBreak[0] ? tieBreak[0][0] : null,
        tiebreak2: tieBreak && tieBreak[0] ? tieBreak[0][1] : null,
        tiebreak3: tieBreak && tieBreak[0] ? tieBreak[0][2] : null,
      },
      {
        id_juego: id_ronda2,
        set1: (puntos.set1 && (puntos.set1[0] > 0 || puntos.set1[1] > 0)) ? (puntos.set1[1] ?? null) : null,
        set2: (puntos.set2 && (puntos.set2[0] > 0 || puntos.set2[1] > 0)) ? (puntos.set2[1] ?? null) : null,
        set3: (puntos.set3 && (puntos.set3[0] > 0 || puntos.set3[1] > 0)) ? (puntos.set3[1] ?? null) : null,
        tiebreak: tieBreak && tieBreak[1] ? tieBreak[1][0] : null,
        tiebreak2: tieBreak && tieBreak[1] ? tieBreak[1][1] : null,
        tiebreak3: tieBreak && tieBreak[1] ? tieBreak[1][2] : null,
      },
    ];
  

    //console.log("Datos a enviar:", bodyData);

    const response = await fetch(
      "https://arosports.app/arosports/private/movil/Activos/Reta/Reta/actualizarPuntos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error en la actualización:", errorText);
      throw new Error(`Error en la actualización: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();
    //console.log("Ronda actualizada correctamente:", res);
    return res;
  } catch (error) {
    //console.error("Error al actualizar ronda:", error);
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
export const terminarJuego = async (idJuego, id_usuario) => {
  //console.log("id usuario del juego", id_usuario);
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
      //console.log("Resultado de la respuesta", res);
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
 * Verifica el marcador actual de un juego
 * @param {number} idJuego ID del juego
 * @param {number} idRondaJuego ID de la ronda del juego
 * @returns {Promise<Object>} Objeto con el marcador actual
 */
// export const verificarMarcador = async (idRondaJuego) => {
//   try {
//     const res = await APIManager({
//       url: `Activos/Reta/Reta/verificarMarcador/${idRondaJuego}`,
//       method: "GET"
//     });
//     //console.log("Respuesta de verificarMarcador:", res);
//     return res.data; // Devolvemos solo el array de datos
//   } catch (error) {
//     console.log("Error al verificar marcador:", error);
//     throw error;
//   }
// };
export const verificarMarcador = async (idRondaJuego) => {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (args.some(arg => typeof arg === "string" && arg.includes("/verificarMarcador/"))) {
      // Ignorar logs que contienen esta URL
      return;
    }
    originalConsoleLog(...args);
  };

  try {
    const res = await APIManager({
      url: `Activos/Reta/Reta/verificarMarcador/${idRondaJuego}`,
      method: "GET"
    });
    //console.log("Respuesta de verificarMarcador:", res);
    return res.data; // Devolvemos solo el array de datos
  } catch (error) {
    console.log("Error al verificar marcador:", error);
    throw error;
  } finally {
    // Restaurar console.log original después de la llamada
    console.log = originalConsoleLog;
  }
};

/**
 * Verifica el marcador actual de un juego
 * @param {number} idJuego ID del juego
 * @param {number} idRondaJuego ID de la ronda del juego
 * @returns {Promise<Object>} Objeto con el marcador actual
 */
export const verificarMarcadorReta = async (idRondaJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/Reta/verificarMarcadorReta/${idRondaJuego}`,
      method: "GET"
    });
    //console.log("Respuesta de verificarMarcador:", res);
    return res.data; // Devolvemos solo el array de datos
  } catch (error) {
    console.log("Error al verificar marcador:", error);
    throw error;
  }
};

/**
 * Verifica si hay rondas en el juego y sus datos
 * @param {number} idJuego ID del juego
 * @returns {Promise<Object>} Objeto con el marcador actual
 */
export const traerRondas = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/Reta/verificarRondasActivas/${idJuego}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Verifica si hay rondas en el juego y sus datos
 * @param {number} idJuego ID del juego
 * @returns {Promise<Object>} Objeto con el marcador actual
 */
export const traerRondasReta = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/Reta/verificarRondasActivasReta/${idJuego}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Hace la terminacion de las partidas
 * @param {number} idRondaJuego id de la ronda activa
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const terminarPartidaReta = async (idRondaJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/Reta/terminarPartidaReta/${idRondaJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    throw error;
  }
}

export const terminarPartidaRetaMultiple = async (idRondaJuego1, idRondaJuego2) => {
  try {
    const payload = {
      idRondaJuego1,
      idRondaJuego2
    };

    console.log("id recibidos en la funcion:", payload);

    const startTotal = performance.now();

    console.log("⏱ [1] Antes de llamar APIManager:", new Date().toISOString());
    const startAPI = performance.now();

    const res = await APIManager({
      url: `Activos/Reta/Reta/terminarPartidaRetaMultiple`,
      method: "POST",
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const endAPI = performance.now();
    console.log(`⏱ [2] Después de APIManager: ${(endAPI - startAPI).toFixed(2)} ms`);

    console.log("Resultado completo APIManager:", res);

    const endTotal = performance.now();
    console.log(`⏱ [3] Tiempo total función terminarPartidaRetaMultiple: ${(endTotal - startTotal).toFixed(2)} ms`);

    return res;
  } catch (error) {
    console.error("Error en terminarPartidaRetaMultiple:", error);
    throw error;
  }
};








/**
 * Hace el bloqueo del marcador de las partidas
 * @param {number} idRondaJuego id de la ronda activa
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const guardarRondaCompleta = async (idRondaJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Reta/Reta/guardarRondaCompleta/${idRondaJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {number} idJuego id para identificar el juego que ha finalizado
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const terminarRondaGeneral = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `Activos/Guardar/terminarRondaGeneral/${idJuego}`,
      method: "GET"
    });
    return res;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {number} idJuego id para identificar el juego que se quiere obtener
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const obtenerHistorialPuntos = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `/Activos/Reta/Reta/verificarRondasHistorial/${idJuego}`,
      method: "GET"
    });
    //console.log("Respuesta de obtenerHistorialPuntos:", res);
    return res.data; // Devolvemos solo el array de datos solo con los datos que queremos
  } catch (error) {
    console.log("Error al verificar marcador:", error);
    throw error;
  }
}

/**
 * Funcion para agregar a los jugadores desde el apartado de juegos pendientes
 * @param {number} $id_juego id del juego para identificarlo en la base de datos
 * @param {Array} $jugador arreglo con lo que el jugador va a enviar a la base de datos
 */
export const agregarJugadorPendientes = async (idJuego, jugadorFinal) => {
  try {
    const payload = {
      id_juego: idJuego,
      jugador: {
        id_jugador: null,
        us_jugador: jugadorFinal.us_nomUsuario || null,
        categoria: jugadorFinal.categoria || null,
      },
    };
    const res = await APIManager({
      url: `Activos/Guardar/guardarNuevosJugadores`,
      method: "POST",
      data: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    //console.log(res.message);
    return res;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {string} idRondaJuego id de la ronda activa de la primera pareja
 * @param {string} idRondaJuego2 id de la ronda activa de la segunda pareja
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const mandarRanking = async (idRondaJuego, idRondaJuego2) => {
  try {
    const bodyData = {
      id_ronda_reta_1: idRondaJuego,
      id_ronda_reta_2: idRondaJuego2,
    };
    const res = await fetch(
      "https://arosports.app/arosports/private/movil/jugadas/PuntajeJugadas/calcular_puntaje_ronda",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      }
    );
    console.log("[mandarRanking] Respuesta de la API:", res);
    return res;
  } catch (error) {
    console.error("[mandarRanking] Error en mandarRanking:", error);
    throw error;
  }
}

/**
 * @param {number} idRondaJuego id de la ronda del juego para hacer la identificacion
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const eliminarRondas = async (idRondaJuego) => {
  try {
    const res = await APIManager({
      url: `/Activos/Reta/Reta/eliminarPartidaReta/${idRondaJuego}`,
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return res;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {number} idRondaJuego id de la ronda de juego como identificador
 * @param {number} num_set numero del set que se va a bloquear
 * @returns {Promise<Object>} objeto con la respuesta de la api
 */
export const terminarSetRonda = async (id_rondajuego, num_set) => {
  try {
    const res = await APIManager({
      url: `/Activos/Reta/Reta/terminarSetReta/${id_rondajuego}/${num_set}`,
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return res;
  } catch (error) {
    throw error;
  }
}

/**
 * Funcion para obtener la lista de las parejas de un juego
 * @param {number} idJuego ID del juego
 * @param {number} idJugador ID del jugador
 * @returns {Promise<Array>} Array de parejas
 */
export const obtenerParejasPorJuego = async (idJuego, idJugador) => {
  try {
    const res = await APIManager({
      url: `/Activos/Reta/Reta/getParejas/${idJuego}/${idJugador}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Funcion para obtener la lista de los rivales de una pareja
 * @param {number} idJuego ID del juego
 * @param {number} idJugador ID del jugador
 * @returns {Promise<Array>} Array de rivales
 */
export const obtenerRivalesPorJuego = async (idJuego, idJugador) => {
  try {
    const res = await APIManager({
      url: `/Activos/Reta/Reta/getParejasEnfrentadas/${idJuego}/${idJugador}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Funcion para obtener el historial de puntos de una reta
 * @param {number} idJuego ID del juego
 * @returns {Promise<Array>} Array con el historial de puntos
 */
export const obtenerHistorialPuntosReta = async (idJuego) => {
  try {
    const res = await APIManager({
      url: `/Activos/Reta/Reta/verificarRondasHistorialReta/${idJuego}`,
      method: "GET"
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}