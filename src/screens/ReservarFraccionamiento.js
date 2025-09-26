import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import Titulo from '../componentes/Titulo';
import Logo from '../componentes/Logo';
import FormReservar from '../componentes/FormReservar';
import { TimeSelectorHora } from '../componentes/MostrarHorario';
import CustomButton from '../componentes/Buttons';
import APIManager from '../componentes/API/APIManager';
import MostrarCalendario from '../componentes/MostrarCalendario';
import { useAuth } from '../screens/Auth/AuthContext.js';

const ReservarFraccionamiento = () => {
    const route = useRoute();
    const { id_usuario } = useAuth();
    const { idFraccionamiento } = route.params;
    
    // Estados principales
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedHora, setSelectedHora] = useState(null);
    const [selectedCancha, setSelectedCancha] = useState(null);
    const [selectedTiempo, setSelectedTiempo] = useState(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    
    // Estados para datos
    const [intervalos, setIntervalos] = useState([]);
    const [horas, setHoras] = useState([]);
    const [canchasDisponibles, setCanchasDisponibles] = useState([]);
    const [tiemposDisponibles, setTiemposDisponibles] = useState([]);

    // Estados para manejar dropdown de tiempo (solo necesitamos uno ahora)
    const [dropdownTiempo, setDropdownTiempo] = useState(false);

    // Efecto inicial - obtener intervalos
    useEffect(() => {
        console.log('🚀 Componente montado - cargando intervalos...');
        fetchIntervalos();
        
        // Limpiar estados al montar
        setSelectedDate('');
        setSelectedHora(null);
        setSelectedCancha(null);
        setSelectedTiempo(null);
    }, []); // Solo se ejecuta una vez al montar

    // Efecto cuando cambia la fecha - obtener horarios y reservas
    useEffect(() => {
        console.log('🔄 EFFECT: selectedDate cambió a:', selectedDate);
        
        if (selectedDate && selectedDate.trim() !== '') {
            console.log('📞 Llamando fetchHorariosYReservas...');
            fetchHorariosYReservas();
            
            // Limpiar selecciones dependientes solo si cambia la fecha
            setSelectedHora(null);
            setSelectedCancha(null);
            setSelectedTiempo(null);
            setCanchasDisponibles([]);
            setTiemposDisponibles([]);
            
            // Cerrar dropdown de tiempo
            setDropdownTiempo(false);
        } else if (selectedDate === '') {
            // Si la fecha se resetea, limpiar todo pero no hacer fetch
            console.log('📅 Fecha reseteada, limpiando estados...');
            setHorariosDisponibles([]);
            setSelectedHora(null);
            setSelectedCancha(null);
            setSelectedTiempo(null);
            setCanchasDisponibles([]);
            setTiemposDisponibles([]);
            setHoras({});
        }
    }, [selectedDate]); // Solo depende de selectedDate

    // Efecto cuando cambian los horarios - NO calcular horarios, solo marcar como listo
    useEffect(() => {
        console.log('🔄 EFFECT: horas cambió:', horas);
        // Ya no calculamos horarios automáticamente, solo marcamos que tenemos los datos
        if (selectedDate && horas && horas.horarios && Array.isArray(horas.horarios)) {
            console.log('✅ Datos de horarios y reservas listos');
        }
    }, [horas]); // Solo depende de horas

    // Efecto cuando se selecciona una hora - buscar canchas disponibles
    useEffect(() => {
        console.log('🔄 EFFECT: selectedHora cambió a:', selectedHora);
        if (selectedHora && intervalos.length > 0) {
            console.log('🏟️ Buscando canchas disponibles...');
            buscarCanchasDisponibles();
            setSelectedCancha(null);
            setSelectedTiempo(null);
            setTiemposDisponibles([]);
        } else {
            console.log('❌ No se pueden buscar canchas - faltan datos');
            setCanchasDisponibles([]);
            setSelectedCancha(null);
            setSelectedTiempo(null);
            setTiemposDisponibles([]);
        }
    }, [selectedHora]); // Solo depende de selectedHora

    // Efecto cuando se selecciona una cancha - buscar tiempos disponibles
    useEffect(() => {
        console.log('🔄 EFFECT: selectedCancha cambió a:', selectedCancha);
        if (selectedCancha && selectedHora && canchasDisponibles.length > 0) {
            console.log('⏱️ Buscando tiempos disponibles...');
            buscarTiemposDisponibles();
            setSelectedTiempo(null);
        } else {
            console.log('❌ No se pueden buscar tiempos - faltan datos');
            setTiemposDisponibles([]);
            setSelectedTiempo(null);
        }
    }, [selectedCancha]); // Solo depende de selectedCancha

    const fetchIntervalos = async () => {
        console.log('Usando los intervalos de ejemplo directamente...');
        try {
            setLoading(true);
            
            // Usar los datos que proporcionaste como ejemplo
            const datosEjemplo = [
                {"can_nombre": "Gimnasio", "can_tiempoMax": "02:00:00", "can_tiempoMin": "00:30:00", "horario_fin": "13:00:00", "horario_inicio": "06:00:00", "id_canchas": "22", "intervalo": "01:00:00"},
                {"can_nombre": "Gimnasio", "can_tiempoMax": "02:00:00", "can_tiempoMin": "00:30:00", "horario_fin": "23:00:00", "horario_inicio": "13:00:00", "id_canchas": "22", "intervalo": "02:00:00"},
                {"can_nombre": "Gimnasio", "can_tiempoMax": "02:00:00", "can_tiempoMin": "00:30:00", "horario_fin": "06:00:00", "horario_inicio": "23:00:00", "id_canchas": "22", "intervalo": "00:30:00"},
                {"can_nombre": "Alberca", "can_tiempoMax": "01:00:00", "can_tiempoMin": "00:30:00", "horario_fin": "14:00:00", "horario_inicio": "07:00:00", "id_canchas": "24", "intervalo": "01:00:00"}
            ];
            
            console.log('Intervalos cargados:', datosEjemplo);
            setIntervalos(datosEjemplo);
            
        } catch (error) {
            console.log('Error al obtener los intervalos:', error);
            setIntervalos([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchHorariosYReservas = async () => {
        // Prevenir llamadas múltiples
        if (!selectedDate || selectedDate.trim() === '') {
            console.log('📞 fetchHorariosYReservas cancelado - fecha inválida:', selectedDate);
            return;
        }
        
        try {
            console.log('📞 Consultando horarios y reservas para:', selectedDate);
            const res = await APIManager({
                url: `Club/Reservas/obtenerHorariosYReservas/${selectedDate}/${idFraccionamiento}`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('📞 Respuesta de horarios y reservas:', res);
            
            // Verificar que la respuesta tenga la estructura esperada
            if (res && typeof res === 'object') {
                setHoras({
                    horarios: res.horarios || [],
                    reservas: res.reservas || []
                });
            } else {
                console.log('📞 Respuesta no válida, usando horarios por defecto');
                // Usar horarios básicos si la API falla
                const horariosBasicos = [
                    { hora_inicio: '07:00:00', hora_fin: '23:00:00' }
                ];
                setHoras({ 
                    horarios: horariosBasicos, 
                    reservas: [] 
                });
            }
        } catch (error) {
            console.log('📞 Error al obtener horarios y reservas:', error);
            // Si no hay respuesta, crear horarios básicos de 7:00 a 23:00
            const horariosBasicos = [
                { hora_inicio: '07:00:00', hora_fin: '23:00:00' }
            ];
            setHoras({ 
                horarios: horariosBasicos, 
                reservas: [] 
            });
        }
    };

    // Obtener todos los horarios posibles (24 horas) - ya no se usa pero lo dejamos por si acaso

    const buscarCanchasDisponibles = () => {
        console.log('🏟️ INICIO buscarCanchasDisponibles');
        console.log('🏟️ selectedHora:', selectedHora);
        console.log('🏟️ intervalos.length:', intervalos.length);
        
        if (!selectedHora || !intervalos || intervalos.length === 0) {
            console.log('❌ Faltan datos para buscar canchas');
            return;
        }

        const horaInicioSeleccionada = convertirHoraAFormatoDecimal(selectedHora);
        const canchasEnHorario = [];

        // Agrupar intervalos por cancha
        const canchasPorId = {};
        intervalos.forEach(intervalo => {
            if (!canchasPorId[intervalo.id_canchas]) {
                canchasPorId[intervalo.id_canchas] = {
                    nombre: intervalo.can_nombre,
                    id: intervalo.id_canchas,
                    intervalos: []
                };
            }
            canchasPorId[intervalo.id_canchas].intervalos.push(intervalo);
        });

        console.log('🏟️ Canchas agrupadas:', Object.keys(canchasPorId).length);

        // Verificar qué canchas están disponibles en la hora seleccionada
        Object.values(canchasPorId).forEach(cancha => {
            // Buscar si algún intervalo de esta cancha cubre la hora seleccionada
            const intervaloValido = cancha.intervalos.find(intervalo => {
                const horarioInicio = convertirHoraAFormatoDecimal(intervalo.horario_inicio);
                const horarioFin = convertirHoraAFormatoDecimal(intervalo.horario_fin);
                
                // Manejar el caso especial de horarios que cruzan medianoche (23:00 a 06:00)
                if (horarioInicio > horarioFin) {
                    // Horario que cruza medianoche
                    return (horaInicioSeleccionada >= horarioInicio || horaInicioSeleccionada < horarioFin);
                } else {
                    // Horario normal
                    return (horaInicioSeleccionada >= horarioInicio && horaInicioSeleccionada < horarioFin);
                }
            });

            if (intervaloValido) {
                console.log(`✅ Cancha ${cancha.nombre} disponible en horario:`, intervaloValido);
                
                // Verificar que no haya reservas en conflicto para esta cancha específica
                const hayConflicto = horas.reservas && horas.reservas.some(reserva => {
                    if (reserva.id_cancha != cancha.id) return false;
                    const reservaInicio = convertirHoraAFormatoDecimal(reserva.hora_inicio);
                    const reservaFin = convertirHoraAFormatoDecimal(reserva.hora_fin);
                    return horaInicioSeleccionada >= reservaInicio && horaInicioSeleccionada < reservaFin;
                });

                if (!hayConflicto) {
                    canchasEnHorario.push({
                        nombre: cancha.nombre,
                        id: cancha.id,
                        intervalo: intervaloValido,
                        horarioInfo: `${intervaloValido.horario_inicio} - ${intervaloValido.horario_fin}`,
                        duracionIntervalo: intervaloValido.intervalo,
                        tiempoMin: intervaloValido.can_tiempoMin,
                        tiempoMax: intervaloValido.can_tiempoMax
                    });
                } else {
                    console.log(`❌ Cancha ${cancha.nombre} tiene conflicto con reserva existente`);
                }
            } else {
                console.log(`❌ Cancha ${cancha.nombre} no disponible en hora ${selectedHora}`);
            }
        });

        console.log('🏟️ FIN buscarCanchasDisponibles - Total:', canchasEnHorario.length);
        setCanchasDisponibles(canchasEnHorario);
    };

    const buscarTiemposDisponibles = () => {
        if (!selectedCancha || !selectedHora) return;

        const canchaSeleccionada = canchasDisponibles.find(c => c.nombre === selectedCancha);
        if (!canchaSeleccionada) return;

        const horaInicioSeleccionada = convertirHoraAFormatoDecimal(selectedHora);
        const intervalo = canchaSeleccionada.intervalo;
        const horarioFin = convertirHoraAFormatoDecimal(intervalo.horario_fin);
        const tiempoMinimo = convertirHoraAMinutos(intervalo.can_tiempoMin);
        const tiempoMaximo = convertirHoraAMinutos(intervalo.can_tiempoMax);
        const intervaloDuracion = convertirHoraAMinutos(intervalo.intervalo);

        const tiempos = [];
        
        // Generar opciones de tiempo basadas en el intervalo y límites
        for (let duracion = tiempoMinimo; duracion <= tiempoMaximo; duracion += intervaloDuracion) {
            const horaFin = horaInicioSeleccionada + (duracion / 60);
            
            if (horaFin <= horarioFin) {
                // Verificar que no haya conflicto con reservas existentes
                const hayConflicto = horas.reservas.some(reserva => {
                    if (reserva.id_cancha !== canchaSeleccionada.id) return false;
                    const reservaInicio = convertirHoraAFormatoDecimal(reserva.hora_inicio);
                    const reservaFin = convertirHoraAFormatoDecimal(reserva.hora_fin);
                    return (horaInicioSeleccionada < reservaFin && horaFin > reservaInicio);
                });

                if (!hayConflicto) {
                    const duracionHoras = Math.floor(duracion / 60);
                    const duracionMinutos = duracion % 60;
                    const duracionStr = `${String(duracionHoras).padStart(2, '0')}:${String(duracionMinutos).padStart(2, '0')}`;
                    const horaFinStr = convertirDecimalAFormatoHora(horaFin);
                    
                    tiempos.push({
                        duracion: duracionStr,
                        horaFin: horaFinStr,
                        label: `${duracionStr} (hasta ${horaFinStr})`
                    });
                }
            }
        }

        console.log('Tiempos disponibles:', tiempos);
        setTiemposDisponibles(tiempos);
    };

    // Funciones auxiliares
    const convertirHoraAFormatoDecimal = (hora) => {
        const [hh, mm, ss] = hora.split(':').map(Number);
        return hh + mm / 60 + (ss || 0) / 3600;
    };

    const convertirDecimalAFormatoHora = (decimal) => {
        const hh = Math.floor(decimal);
        const mm = Math.round((decimal - hh) * 60);
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    const convertirHoraAMinutos = (hora) => {
        const [hh, mm] = hora.split(':').map(Number);
        return hh * 60 + mm;
    };

    const handleReservar = async () => {
        if (!selectedCancha || !selectedDate || !selectedHora ) {
            alert('Por favor, completa todos los campos.');
            return;
        }

       // const tiempoSeleccionado = tiemposDisponibles.find(t => t.duracion === selectedTiempo);
        const canchaSeleccionada = canchasDisponibles.find(c => c.nombre === selectedCancha);
        
      

        const reservaData = {
            id_usuario,
            fecha: selectedDate,
            hora_inicio: selectedHora,
            //hora_fin: tiempoSeleccionado.horaFin,
            id_cancha: parseInt(canchaSeleccionada.id),
            id_fraccionamiento: parseInt(idFraccionamiento)
        };

        const formData = new FormData();
        formData.append('id_usuario', reservaData.id_usuario);
        formData.append('fecha', reservaData.fecha);
        formData.append('hora_inicio', reservaData.hora_inicio);
        formData.append('hora_fin', reservaData.hora_fin);
        formData.append('id_cancha', reservaData.id_cancha.toString());
        formData.append('id_fraccionamiento', reservaData.id_fraccionamiento.toString());
        console.log("📌 Datos de reserva a enviar:", reservaData);

        const url = `Club/Reservas/registrar_reservaDesarrollo/`;

        try {
            console.log("📌 Enviando solicitud a:", url);
            console.log("📌 Datos de reserva:", reservaData);

            const response = await APIManager({
                url: url,
                method: 'POST',
                data: formData,
            });

            console.log("📌 Respuesta completa:", response);

            if (!response || typeof response.resultado === 'undefined') {
                console.log("❌ No se recibió una respuesta válida del servidor");
                alert('❌ Hubo un error al intentar realizar la reserva');
                return;
            }

            if (response.resultado) {
                alert('✅ Reserva realizada exitosamente');

                // Limpiar campos
                setSelectedCancha(null);
                setSelectedDate('');
                setSelectedHora(null);
                setSelectedTiempo(null);
                setCanchasDisponibles([]);
                setTiemposDisponibles([]);
                setHorariosDisponibles([]);
                setHoras([]);
            } else {
                alert('❌ Error al realizar la reserva: ' + response.mensaje);
            }

        } catch (error) {
            console.log("❌ Error al reservar:", error);
            alert('❌ Hubo un error al intentar realizar la reserva');
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#2E2E2E' }}>
  <View style={styles.container}>
            <Logo />
            <Titulo titulo="Reservar Cancha" />

            {loading ? (
                <ActivityIndicator size="large" color="#02B9FA" />
            ) : (
                <View>
                    {/* Paso 1: Seleccionar fecha */}
                    <MostrarCalendario
                        placeholder="Selecciona una fecha"
                        selectedValue={selectedDate}
                        onValueChange={(value) => {
                            console.log('📅 Fecha del calendario:', value);
                            // Solo actualizar si el valor realmente cambió
                            if (value !== selectedDate) {
                                console.log('📅 Fecha actualizada de', selectedDate, 'a', value);
                                setSelectedDate(value || '');
                            }
                        }}
                    />

                    {/* Paso 2: Seleccionar hora (24 horas) */}
                    {selectedDate && (
                        <TimeSelectorHora
                            iconName="time-outline"
                            value={selectedHora}
                            onChange={(hora) => {
                                console.log('⏰ Hora seleccionada con TimeSelectorHora:', hora);
                                setSelectedHora(hora);
                            }}
                        />
                    )}

                    {/* Paso 3: Mostrar canchas disponibles en esa hora */}
                    {selectedHora && canchasDisponibles.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Canchas disponibles a las {selectedHora}:</Text>
                            {canchasDisponibles.map((cancha, index) => (
                                <View key={index} style={styles.canchaCard}>
                                    <Text style={styles.canchaName}>{cancha.nombre}</Text>
                                    <Text style={styles.canchaInfo}>Horario: {cancha.horarioInfo}</Text>
                                    <Text style={styles.canchaInfo}>Tiempo de uso: {cancha.duracionIntervalo}</Text>
                                    
                                    <TouchableOpacity 
                                        style={[
                                            styles.selectButton,
                                            selectedCancha === cancha.nombre && styles.selectButtonActive
                                        ]}
                                        onPress={() => {
                                            console.log('🏟️ Cancha seleccionada:', cancha.nombre);
                                            setSelectedCancha(cancha.nombre);
                                        }}
                                    >
                                        <Text style={[
                                            styles.selectButtonText,
                                            selectedCancha === cancha.nombre && styles.selectButtonTextActive
                                        ]}>
                                            {selectedCancha === cancha.nombre ? 'Seleccionada ✓' : 'Seleccionar'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Mensaje si no hay canchas disponibles */}
                    {selectedHora && canchasDisponibles.length === 0 && (
                        <Text style={styles.mensajeInfo}>
                            No hay canchas disponibles a las {selectedHora}
                        </Text>
                    )}

            

                    {/* Detalle de la reserva */}
                    {(selectedCancha || selectedDate || selectedHora || selectedTiempo) && (
                        <View style={styles.detalleContainer}>
                            <Text style={styles.detalleTitulo}>Detalle de la Reserva</Text>
                            <Text style={styles.detalleTexto}>Fecha: {selectedDate || 'No seleccionada'}</Text>
                            <Text style={styles.detalleTexto}>Hora inicio: {selectedHora || 'No seleccionada'}</Text>
                            <Text style={styles.detalleTexto}>Cancha: {selectedCancha || 'No seleccionada'}</Text>
                            {selectedTiempo && (
                                <Text style={styles.detalleTexto}>
                                    Hora fin: {tiemposDisponibles.find(t => t.duracion === selectedTiempo)?.horaFin || ''}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Botón de reservar */}
                    <CustomButton 
                        buttonText="Reservar" 
                        onPress={handleReservar}
                        disabled={!selectedCancha || !selectedDate || !selectedHora}
                    />
                </View>
            )}
        </View>
        </ScrollView>
      
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16, 
        backgroundColor: '#2E2E2E' 
    },
    detalleContainer: { 
        width: '88%', 
        backgroundColor: 'white', 
        borderRadius: 10, 
        borderWidth: 3, 
        borderColor: '#02B9FA', 
        padding: 15, 
        marginTop: 15, 
        alignSelf: 'center' 
    },
    detalleTitulo: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginBottom: 5, 
        color: '#809FB8', 
        textAlign: 'center' 
    },
    detalleTexto: { 
        fontSize: 14, 
        color: '#809FB8',
        marginBottom: 3
    },
    mensajeInfo: {
        color: '#02B9FA',
        textAlign: 'center',
        fontSize: 14,
        marginVertical: 10,
        fontStyle: 'italic'
    },
    sectionTitle: {
        color: '#02B9FA',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center'
    },
    canchaCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#02B9FA',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: '6%'
    },
    canchaName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center'
    },
    canchaInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4
    },
    selectButton: {
        backgroundColor: '#2e2e2e',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        alignItems: 'center'
    },
    selectButtonActive: {
        backgroundColor: '#02B9FA'
    },
    selectButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    selectButtonTextActive: {
        color: 'white'
    }
});

export default ReservarFraccionamiento;