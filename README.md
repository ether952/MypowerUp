# MyPowerUp ⚡ - Gym & Nutrition Tracker

Aplicación web interactiva y moderna para el seguimiento diario de entrenamiento de fuerza, nutrición y evolución física.

## ✨ Características Principales

- 🏋️‍♂️ **Control de Entrenamiento & Gimnasio**:
  - Registro de series, repeticiones y peso (kg).
  - Cálculo automático de volumen de carga (tonelaje) y 1RM estimado (fórmula de Epley).
  - Memoria inteligente: recuerda tus últimos pesos y series para autorrellenar ejercicios frecuentes.

- 🍽️ **Control Nutricional & Suplementación**:
  - Momentos del día: Desayuno, Almuerzo, Merienda, Cena, Tentempié y Suplementos (Creatina, Proteína, etc.).
  - Registro con horario exacto, calorías (kcal) y proteínas (g).
  - Memoria inteligente: recuerda tus alimentos frecuentes con sus calorías y macros.

- 📊 **Gráficos Diarios & Semanales**:
  - Gráficos interactivos de evolución con Recharts (7, 14 y 30 días).
  - Volumen de carga por día, ingesta calórica vs meta y proteína diaria.

- 📜 **Historial Completo**:
  - Tarjetas de resumen diario (Calorías totales, Proteínas y Tonelaje con barras de progreso respecto a metas).
  - Desglose cronológico de todos los registros con buscador en tiempo real.

- 💾 **Persistencia y Respaldo**:
  - Almacenamiento local automático en `localStorage`.
  - Exportación e importación de copias de seguridad en formato `.json`.

## 🚀 Instalación y Uso Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/ether952/MypowerUp.git
   cd MypowerUp
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:5173/](http://localhost:5173/) en tu navegador.

## 🛠️ Tecnologías

- **React 18**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **Recharts**
