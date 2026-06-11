import json
import os
from datetime import datetime
from typing import List, Dict, Any

class DataManager:
    """Maneja la lectura y escritura de datos en JSON"""
    
    def __init__(self, data_path: str = "data/data.json"):
        self.data_path = data_path
        self._ensure_data_file()
    
    def _ensure_data_file(self):
        """Asegura que el archivo de datos existe"""
        if not os.path.exists(self.data_path):
            with open(self.data_path, 'w', encoding='utf-8') as f:
                json.dump({"registros": []}, f, indent=2, ensure_ascii=False)
    
    def _read_data(self) -> Dict:
        """Lee los datos del archivo JSON"""
        with open(self.data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _write_data(self, data: Dict):
        """Escribe datos al archivo JSON"""
        with open(self.data_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def get_all_registros(self) -> List[Dict]:
        """Obtiene todos los registros"""
        data = self._read_data()
        return data.get("registros", [])
    
    def add_registro(self, registro: Dict) -> Dict:
        """Agrega un nuevo registro"""
        data = self._read_data()
        
        # Generar nuevo ID
        registros = data.get("registros", [])
        new_id = max([r.get("id", 0) for r in registros]) + 1 if registros else 1
        
        # Agregar fecha y ID
        registro["id"] = new_id
        registro["fecha_registro"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        registros.append(registro)
        data["registros"] = registros
        self._write_data(data)
        
        return registro
    
    def get_servicios(self) -> Dict:
        """Carga los servicios desde servicios.json"""
        servicios_path = "data/servicios.json"
        with open(servicios_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def clear_registros(self):
        """Elimina todos los registros"""
        self._write_data({"registros": []})