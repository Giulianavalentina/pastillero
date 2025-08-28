// PASTILLERO/app/(tabs)/index.tsx

import { Stack } from 'expo-router'; // Importa Stack de expo-router para el encabezado de navegación
import React, { useEffect, useRef, useState } from 'react'; // Agregamos useRef
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Importa las clases de tu módulo de conexión Bluetooth
// Asegúrate de que esta importación sea correcta: '../conexion_bluetooh'
import { conexionBluetooh, ConexionBluetoohFalsa } from '../conexion_bluetooh';

// Definición de tipos para las alarmas
interface Alarm {
  id: number;
  time: string;
  medicine: string;
}

// Función utilitaria para formatear la hora (HH:MM)
const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function Home() {
  // Estados para gestionar las alarmas y la interfaz
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState<string>(formatTime(new Date()));
  const [newMedicine, setNewMedicine] = useState<string>('');
  const [bluetooth] = useState(conexionBluetooh);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [sendingConfig, setSendingConfig] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false); // Nuevo estado para el diálogo de confirmación
  const [alarmToDeleteId, setAlarmToDeleteId] = useState<number | null>(null); // Guardar el ID de la alarma a eliminar
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [editingAlarmId, setEditingAlarmId] = useState<number | null>(null);

  // Un ref para rastrear si el componente está montado y evitar llamadas a setState en componentes desmontados
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false; // Marcar el componente como desmontado
    };
  }, []);

  useEffect(() => {
    if (bluetooth instanceof ConexionBluetoohFalsa && isMounted.current) {
      setIsConnected(bluetooth.isConnected);
      setConnecting(bluetooth.connecting);
    }
  }, [bluetooth]);

  // Efecto para mostrar el diálogo de confirmación cuando isDeleteConfirmOpen cambia
  useEffect(() => {
    if (isDeleteConfirmOpen && alarmToDeleteId !== null) {
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro de que quieres eliminar esta alarma?",
        [
          { text: "Cancelar", onPress: () => { if (isMounted.current) setIsDeleteConfirmOpen(false); }, style: "cancel" },
          { text: "Eliminar", onPress: () => {
              if (isMounted.current) {
                handleDeleteAlarm(alarmToDeleteId);
                setIsDeleteConfirmOpen(false);
                setAlarmToDeleteId(null);
              }
            }
          }
        ]
      );
    }
  }, [isDeleteConfirmOpen, alarmToDeleteId]); // Depende de estos estados


  const showMessage = (text: string, type: 'success' | 'error' | 'warning' | 'info') => {
    if (isMounted.current) {
      setMessage({ text, type });
      // Para un toast o snackbar personalizado que desaparezca automáticamente
      // podrías usar setTimeout para poner setMessage(null) después de unos segundos.
      setTimeout(() => {
        if (isMounted.current) setMessage(null);
      }, 3000); // El mensaje desaparecerá después de 3 segundos
    }
  };

  const handleAddOrUpdateAlarm = () => {
    if (newAlarmTime && newMedicine) {
      if (editingAlarmId !== null) {
        setAlarms(
          alarms.map((alarm) =>
            alarm.id === editingAlarmId
              ? { ...alarm, time: newAlarmTime, medicine: newMedicine }
              : alarm
          )
        );
        setEditingAlarmId(null);
        showMessage('Alarma actualizada con éxito.', 'success');
      } else {
        const newAlarm: Alarm = {
          id: Date.now(),
          time: newAlarmTime,
          medicine: newMedicine,
        };
        setAlarms([...alarms, newAlarm]);
        showMessage('Alarma agregada con éxito.', 'success');
      }
      setNewAlarmTime(formatTime(new Date()));
      setNewMedicine('');
    } else {
      showMessage('Por favor, ingresa una hora y un medicamento.', 'error');
    }
  };

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarmId(alarm.id);
    setNewAlarmTime(alarm.time);
    setNewMedicine(alarm.medicine);
  };

  const handleDeleteAlarm = (id: number) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
    showMessage('Alarma eliminada con éxito.', 'success');
  };

  const handleConnectBluetooth = async () => {
    if (isMounted.current) setConnecting(true);
    const success = await bluetooth.connect();
    if (isMounted.current) {
      setIsConnected(success);
      setConnecting(false);
      if (success) {
        showMessage('Conectado al pastillero vía Bluetooth.', 'success');
      } else {
        showMessage('Fallo al conectar con el pastillero.', 'error');
      }
    }
  };

  const handleDisconnectBluetooth = async () => {
    await bluetooth.disconnect();
    if (isMounted.current) {
      setIsConnected(false);
      showMessage('Desconectado del pastillero.', 'info');
    }
  };

  const handleSendConfiguration = async () => {
    if (!isConnected) {
      showMessage('Por favor, conecta el pastillero primero.', 'warning');
      return;
    }
    if (isMounted.current) setSendingConfig(true);
    const success = await bluetooth.sendConfiguration(alarms);
    if (isMounted.current) {
      setSendingConfig(false);
      if (success) {
        showMessage('Configuración enviada al pastillero con éxito.', 'success');
      } else {
        showMessage('Fallo al enviar la configuración.', 'error');
      }
    }
  };

  // Función para abrir el diálogo de confirmación de eliminación
  const openDeleteConfirm = (alarmId: number) => {
    setAlarmToDeleteId(alarmId);
    setIsDeleteConfirmOpen(true);
  };


  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Pastillero Inteligente' }} />

      <Text style={styles.title}>Pastillero Inteligente</Text>
      <Text style={styles.subtitle}>Configura tus alarmas y medicamentos.</Text>

      {/* Aquí se muestra el mensaje de feedback */}
      {message && (
        <View style={[styles.messageContainer, styles[`message-${message.type}`]]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, isConnected ? styles.disconnectButton : styles.connectButton]}
          onPress={isConnected ? handleDisconnectBluetooth : handleConnectBluetooth}
          disabled={connecting || sendingConfig}
          testID="connect-disconnect-button"
        >
          {connecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isConnected ? 'Desconectar' : 'Conectar BLE'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.sendButton, (!isConnected || sendingConfig || alarms.length === 0) && styles.disabledButton]}
          onPress={handleSendConfiguration}
          disabled={!isConnected || sendingConfig || alarms.length === 0}
          testID="send-config-button"
        >
          {sendingConfig ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Enviar Configuración</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Hora de alarma (HH:MM)"
          value={newAlarmTime}
          onChangeText={setNewAlarmTime}
          testID="alarm-time-input"
        />
        <TextInput
          style={styles.input}
          placeholder="Medicamento"
          value={newMedicine}
          onChangeText={setNewMedicine}
          testID="medicine-input"
        />
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddOrUpdateAlarm}
          testID="add-update-alarm-button"
        >
          <Text style={styles.buttonText}>{editingAlarmId !== null ? 'Actualizar Alarma' : 'Agregar Alarma'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>Alarmas Configuradas</Text>
      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem} testID={`alarm-item-${item.id}`}>
            <View>
              <Text style={styles.listItemText}>⏰ {item.time}</Text>
              <Text style={styles.listItemMedicineText}>💊 {item.medicine}</Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity onPress={() => handleEditAlarm(item)} style={styles.actionButton} testID={`edit-alarm-${item.id}`}>
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openDeleteConfirm(item.id)} style={[styles.actionButton, styles.deleteActionButton]} testID={`delete-alarm-${item.id}`}>
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyListText}>No hay alarmas configuradas aún.</Text>}
        style={styles.flatList}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#FF5733',
  },
  sendButton: {
    backgroundColor: '#FFA726',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
    fontSize: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  flatList: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  listItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  listItemMedicineText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  listItemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  deleteActionButton: {
    backgroundColor: '#FFCDD2',
  },
  actionButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 16,
    marginTop: 20,
  },
  // Estilos para los mensajes de feedback
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Para que aparezca sobre otros elementos
    top: Platform.OS === 'web' ? 20 : 50, // Ajusta la posición para web y móvil
    zIndex: 1000, // Asegura que esté por encima de otros elementos
  },
  'message-success': {
    backgroundColor: '#E6FFED', // Verde claro
    borderColor: '#38A169',
    borderWidth: 1,
  },
  'message-error': {
    backgroundColor: '#FFF5F5', // Rojo claro
    borderColor: '#E53E3E',
    borderWidth: 1,
  },
  'message-warning': {
    backgroundColor: '#FEFCBF', // Amarillo claro
    borderColor: '#DD6B20',
    borderWidth: 1,
  },
  'message-info': {
    backgroundColor: '#EBF8FF', // Azul claro
    borderColor: '#3182CE',
    borderWidth: 1,
  },
  messageText: {
    color: '#333333',
    fontSize: 14,
    textAlign: 'center',
  },
});
