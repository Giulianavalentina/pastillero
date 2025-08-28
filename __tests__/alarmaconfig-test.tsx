// PASTILLERO/__tests__/AlarmConfiguration.test.tsx

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Importa el componente Home de tu interfaz (asegúrate de que la ruta sea correcta)
import Home from '../app/(tabs)/index';

// Importa Alert directamente para poder mockearlo y controlarlo
import { Alert } from 'react-native';

// Mock del módulo de conexión Bluetooth para que los tests no intenten conectar con BLE real
jest.mock('../app/conexion_bluetooh', () => {
    // Obtenemos la implementación real de ConexionBluetoohFalsa para usarla en el mock
    const { ConexionBluetoohFalsa } = jest.requireActual('../app/conexion_bluetooh');
    
    // Creamos una instancia de la clase falsa para que el componente Home la use
    const mockConexion = new ConexionBluetoohFalsa();
    return {
        conexionBluetooh: mockConexion,
        ConexionBluetoohFalsa: jest.fn(() => mockConexion),
        ConexionBluetooh: jest.fn(),
    };
});

// Mock para Alert de React Native
// Esto evita que los Alerts reales aparezcan durante los tests
// Mockeamos solo el método 'alert' para no afectar otros métodos de Alert si los hubiera
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      ...RN.Alert,
      alert: jest.fn(), // Mockeamos el método alert
    },
  };
});


describe('User Story: Configuración de Alarmas (Agregar Horario y Medicamento)', () => {

  // Reinicia el mock de Alert.alert antes de cada test
  // Esto asegura que cada prueba empiece con un estado de mock limpio
  beforeEach(() => {
    (Alert.alert as jest.Mock).mockClear();
  });

  // Test 1: Verificar que los campos de entrada y el botón existen
  test('debe renderizar los campos de hora, medicamento y el botón de agregar alarma', () => {
    render(<Home />);

    // Buscar los campos de texto por sus placeholders
    expect(screen.getByPlaceholderText(/hora de alarma \(hh:mm\)/i)).toBeOnTheScreen();
    expect(screen.getByPlaceholderText(/medicamento/i)).toBeOnTheScreen();
    // Buscar el botón por su testID y también verificar su texto
    expect(screen.getByTestId('add-update-alarm-button')).toBeOnTheScreen();
    expect(screen.getByText('Agregar Alarma')).toBeOnTheScreen();
  });

  // Test 2: Simular la adición de una alarma y verificar que aparece en la lista
  test('debe permitir al usuario agregar una nueva alarma y mostrarla en la lista', async () => {
    render(<Home />);

    const timeInput = screen.getByTestId('alarm-time-input');
    const medicineInput = screen.getByTestId('medicine-input');
    const addButton = screen.getByTestId('add-update-alarm-button');

    // Simular la entrada de datos por el usuario
    fireEvent.changeText(timeInput, '08:00');
    fireEvent.changeText(medicineInput, 'Paracetamol');

    // Simular el click en el botón "Agregar Alarma"
    await act(async () => {
      fireEvent.press(addButton);
    });

    // Verificar que el mensaje de éxito aparece (mockeado por Alert.alert)
    expect(Alert.alert).toHaveBeenCalledWith( // Usamos Alert.alert directamente
      'SUCCESS', // El tipo que le pasamos
      'Alarma agregada con éxito.', // El mensaje esperado
      expect.any(Array) // Esperamos un array de botones
    );

    // Verificar que la nueva alarma aparece en la lista
    expect(screen.getByText(/⏰ 08:00/i)).toBeOnTheScreen();

    expect(screen.getByText(/💊 Paracetamol/i)).toBeOnTheScreen();

    // Verificar que los campos se hayan limpiado después de agregar la alarma
    // El campo de hora se restablece a la hora actual, por lo que buscamos que no tenga '08:00'
    expect(timeInput.props.value).not.toBe('08:00'); 
    expect(medicineInput.props.value).toBe('');
  });

  // Test 3: Verificar que no se agrega una alarma si faltan datos
  test('no debe agregar una alarma si falta el medicamento', async () => {
    render(<Home />);

    const timeInput = screen.getByTestId('alarm-time-input');
    const medicineInput = screen.getByTestId('medicine-input');
    const addButton = screen.getByTestId('add-update-alarm-button');

    // Solo ingresamos la hora
    fireEvent.changeText(timeInput, '10:00');
    fireEvent.changeText(medicineInput, ''); // Aseguramos que esté vacío

    await act(async () => {
      fireEvent.press(addButton);
    });

    // Verificar que aparece el mensaje de error
    expect(Alert.alert).toHaveBeenCalledWith( // Usamos Alert.alert directamente
      'ERROR',
      'Por favor, ingresa una hora y un medicamento.',
      expect.any(Array)
    );

    // Verificar que la alarma no aparece en la lista (no hay texto de alarma específico)
    expect(screen.queryByText(/⏰ 10:00/i)).not.toBeOnTheScreen();
  });

});
