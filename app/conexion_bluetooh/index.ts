const entorno_desarrollo: "dev"|"deploy" = "dev"

export class ConexionBluetooh {

}

export class ConexionBluetoohFalsa extends ConexionBluetooh {

}

export const conexion_bluetooh = entorno_desarrollo==="dev"? new ConexionBluetoohFalsa(): new ConexionBluetooh()
