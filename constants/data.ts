export interface Exercise {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  muscles: string;
  sets: number;
  reps: string;
  restSeconds: number;
  youtubeId: string;
}

export interface WorkoutCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  exercises: Exercise[];
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionGoal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  foods: Food[];
  tips: string[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  targetCount: number;
  type: "workouts" | "streak" | "weight" | "special";
}

export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  {
    id: "pecho",
    name: "Pecho",
    iconName: "body",
    color: "#E53935",
    exercises: [
      {
        id: "pecho_press_banca",
        name: "Press Banca",
        categoryId: "pecho",
        description:
          "El press de banca es el ejercicio fundamental para el desarrollo del pecho. Acuéstate en el banco, agarra la barra con agarre ligeramente mayor al ancho de hombros y baja la barra hasta el pecho de forma controlada.",
        muscles: "Pectoral mayor, tríceps, deltoides anterior",
        sets: 4,
        reps: "8-12",
        restSeconds: 90,
        youtubeId: "gRVjAtPip0Y",
      },
      {
        id: "pecho_press_inclinado",
        name: "Press Inclinado",
        categoryId: "pecho",
        description:
          "Ejecutado en un banco inclinado a 30-45°, este ejercicio enfatiza la parte superior del pectoral mayor. Mantén el pecho elevado y los hombros hacia atrás.",
        muscles: "Pectoral mayor (parte superior), deltoides anterior",
        sets: 3,
        reps: "10-12",
        restSeconds: 90,
        youtubeId: "DbFgADa2PL8",
      },
      {
        id: "pecho_aperturas",
        name: "Aperturas con Mancuernas",
        categoryId: "pecho",
        description:
          "Acostado en un banco plano, sostén las mancuernas sobre el pecho. Baja los brazos en arco amplio hasta el nivel del pecho, sintiendo el estiramiento del pectoral.",
        muscles: "Pectoral mayor, coracobraquial",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "eozdVDA78K0",
      },
      {
        id: "pecho_fondos",
        name: "Fondos para Pecho",
        categoryId: "pecho",
        description:
          "En unas paralelas anchas, inclínate ligeramente hacia adelante para mayor activación pectoral. Baja hasta que los hombros estén paralelos al suelo y empuja hacia arriba.",
        muscles: "Pectoral mayor, tríceps, deltoides anterior",
        sets: 3,
        reps: "10-15",
        restSeconds: 90,
        youtubeId: "2z8JmcrW-As",
      },
    ],
  },
  {
    id: "espalda",
    name: "Espalda",
    iconName: "body",
    color: "#1E88E5",
    exercises: [
      {
        id: "espalda_dominadas",
        name: "Dominadas",
        categoryId: "espalda",
        description:
          "Agarra la barra con agarre prono (palmas alejadas) más ancho que los hombros. Cuelga completamente y tira del cuerpo hasta que la barbilla supere la barra.",
        muscles: "Dorsal ancho, bíceps, romboides, trapecio inferior",
        sets: 4,
        reps: "6-10",
        restSeconds: 120,
        youtubeId: "eGo4IYlbE5g",
      },
      {
        id: "espalda_remo_barra",
        name: "Remo con Barra",
        categoryId: "espalda",
        description:
          "Con la espalda recta e inclinada a 45°, agarra la barra y tírala hacia el abdomen bajo. Mantén los codos cerca del cuerpo y aprieta los omóplatos al final del movimiento.",
        muscles: "Dorsal ancho, romboides, trapecio medio, bíceps",
        sets: 4,
        reps: "8-12",
        restSeconds: 90,
        youtubeId: "T3N-TO4reLQ",
      },
      {
        id: "espalda_jalon_pecho",
        name: "Jalón al Pecho",
        categoryId: "espalda",
        description:
          "En la máquina de poleas, agarra la barra con agarre amplio. Inclínate ligeramente y tira la barra hacia el pecho mientras arqueas levemente la espalda.",
        muscles: "Dorsal ancho, bíceps, redondo mayor",
        sets: 3,
        reps: "10-12",
        restSeconds: 75,
        youtubeId: "CAwf7n6Luuc",
      },
      {
        id: "espalda_peso_muerto",
        name: "Peso Muerto",
        categoryId: "espalda",
        description:
          "Con los pies al ancho de cadera, agarra la barra con las manos a los lados de las rodillas. Mantén la espalda neutral, empuja el suelo con los pies y levanta la barra.",
        muscles: "Erector espinal, glúteos, isquiotibiales, trapecio",
        sets: 4,
        reps: "5-8",
        restSeconds: 120,
        youtubeId: "op9kVnSso6Q",
      },
    ],
  },
  {
    id: "piernas",
    name: "Piernas",
    iconName: "walk",
    color: "#43A047",
    exercises: [
      {
        id: "piernas_sentadillas",
        name: "Sentadillas",
        categoryId: "piernas",
        description:
          "Con la barra en la espalda alta, pies al ancho de hombros y pies ligeramente en ángulo. Baja hasta que los muslos estén paralelos al suelo manteniendo la espalda recta.",
        muscles: "Cuádriceps, glúteos, isquiotibiales, core",
        sets: 4,
        reps: "8-12",
        restSeconds: 120,
        youtubeId: "Dy28eq2PjcM",
      },
      {
        id: "piernas_prensa",
        name: "Prensa de Piernas",
        categoryId: "piernas",
        description:
          "En la máquina de prensa, coloca los pies al ancho de hombros en la plataforma. Baja controladamente hasta 90° de flexión y empuja de vuelta.",
        muscles: "Cuádriceps, glúteos, isquiotibiales",
        sets: 4,
        reps: "10-15",
        restSeconds: 90,
        youtubeId: "IZxyjW7MPJQ",
      },
      {
        id: "piernas_zancadas",
        name: "Zancadas",
        categoryId: "piernas",
        description:
          "Da un paso largo al frente y baja la rodilla trasera hacia el suelo sin tocarlo. Empuja con el pie delantero para volver a la posición inicial.",
        muscles: "Cuádriceps, glúteos, isquiotibiales, pantorrillas",
        sets: 3,
        reps: "12 por pierna",
        restSeconds: 75,
        youtubeId: "wrwwXE_x-pQ",
      },
      {
        id: "piernas_extensiones",
        name: "Extensiones de Cuádriceps",
        categoryId: "piernas",
        description:
          "Sentado en la máquina, extiende las piernas completamente contrayendo el cuádriceps al máximo. Baja de forma controlada.",
        muscles: "Cuádriceps (recto femoral, vasto externo, vasto interno)",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "YyvSfVjQeL0",
      },
    ],
  },
  {
    id: "hombros",
    name: "Hombros",
    iconName: "body",
    color: "#FB8C00",
    exercises: [
      {
        id: "hombros_press_militar",
        name: "Press Militar",
        categoryId: "hombros",
        description:
          "De pie o sentado, empuja la barra desde la clavícula hacia arriba hasta la extensión total de los brazos. Mantén el core apretado y evita arquear la espalda.",
        muscles: "Deltoides anterior y medio, tríceps, trapecio",
        sets: 4,
        reps: "8-10",
        restSeconds: 90,
        youtubeId: "2yjwXTZQDDI",
      },
      {
        id: "hombros_elev_laterales",
        name: "Elevaciones Laterales",
        categoryId: "hombros",
        description:
          "Con mancuernas a los lados, eleva los brazos hasta la altura de los hombros con los codos ligeramente flexionados. Baja de forma controlada.",
        muscles: "Deltoides medio",
        sets: 4,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "3VcKaXpzqRo",
      },
      {
        id: "hombros_elev_frontales",
        name: "Elevaciones Frontales",
        categoryId: "hombros",
        description:
          "Con mancuernas frente al cuerpo, eleva un brazo o ambos hasta la altura de los hombros. Mantén el torso estable y evita el balanceo.",
        muscles: "Deltoides anterior",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "hRbfFQYzues",
      },
    ],
  },
  {
    id: "brazos",
    name: "Brazos",
    iconName: "fitness",
    color: "#8E24AA",
    exercises: [
      {
        id: "brazos_curl_biceps",
        name: "Curl de Bíceps",
        categoryId: "brazos",
        description:
          "De pie con mancuernas o barra, flexiona los codos llevando las manos hacia los hombros. Mantén los codos pegados al cuerpo y aprieta el bíceps al final.",
        muscles: "Bíceps braquial, braquial, braquiorradial",
        sets: 4,
        reps: "10-12",
        restSeconds: 60,
        youtubeId: "ykJmrZ5v0Oo",
      },
      {
        id: "brazos_curl_martillo",
        name: "Curl Martillo",
        categoryId: "brazos",
        description:
          "Con agarre neutro (pulgar arriba), flexiona los codos llevando las mancuernas hacia los hombros. Este grip trabaja más el braquial y el braquiorradial.",
        muscles: "Braquial, braquiorradial, bíceps",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "zC3nLlEvin4",
      },
      {
        id: "brazos_fondos_triceps",
        name: "Fondos para Tríceps",
        categoryId: "brazos",
        description:
          "Con las manos en un banco detrás de ti, baja el cuerpo flexionando los codos hasta 90° y empuja hacia arriba. Mantén la espalda cerca del banco.",
        muscles: "Tríceps (cabezas larga, medial y lateral)",
        sets: 3,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "0326dy_-CzM",
      },
      {
        id: "brazos_ext_triceps",
        name: "Extensiones de Tríceps",
        categoryId: "brazos",
        description:
          "En polea alta o con mancuerna, extiende el codo completamente apretando el tríceps. Mantén el codo fijo y solo mueve el antebrazo.",
        muscles: "Tríceps braquial (todas las cabezas)",
        sets: 4,
        reps: "12-15",
        restSeconds: 60,
        youtubeId: "2-LAMcpzODU",
      },
    ],
  },
];

export const ALL_EXERCISES: Record<string, Exercise> = {};
WORKOUT_CATEGORIES.forEach((cat) => {
  cat.exercises.forEach((ex) => {
    ALL_EXERCISES[ex.id] = ex;
  });
});

export const NUTRITION_GOALS: NutritionGoal[] = [
  {
    id: "ganar_masa",
    title: "Ganar Masa Muscular",
    subtitle: "Superávit calórico",
    description:
      "Para ganar músculo necesitas consumir más calorías de las que gastas y priorizar las proteínas.",
    foods: [
      { id: "pollo", name: "Pechuga de Pollo", calories: 165, protein: 31, carbs: 0, fat: 3 },
      { id: "carne", name: "Carne de Res magra", calories: 250, protein: 26, carbs: 0, fat: 15 },
      { id: "huevos", name: "Huevos enteros", calories: 155, protein: 13, carbs: 1, fat: 11 },
      { id: "arroz", name: "Arroz blanco (100g)", calories: 130, protein: 2, carbs: 28, fat: 0 },
      { id: "avena", name: "Avena (100g)", calories: 389, protein: 17, carbs: 66, fat: 7 },
      { id: "papa", name: "Papa cocida (100g)", calories: 87, protein: 2, carbs: 20, fat: 0 },
      { id: "banano", name: "Banano mediano", calories: 89, protein: 1, carbs: 23, fat: 0 },
    ],
    tips: [
      "Come cada 3-4 horas para mantener el anabolismo",
      "Consume 1.6-2.2g de proteína por kg de peso corporal",
      "Superávit calórico de 300-500 kcal sobre tu mantenimiento",
      "No descuides los carbohidratos, son tu combustible",
      "Entrena con pesos progresivamente más altos",
    ],
  },
  {
    id: "perder_grasa",
    title: "Perder Grasa",
    subtitle: "Déficit calórico",
    description:
      "Para perder grasa debes consumir menos calorías de las que gastas manteniendo alta la proteína.",
    foods: [
      { id: "atun", name: "Atún en agua", calories: 116, protein: 26, carbs: 0, fat: 1 },
      { id: "pechuga", name: "Pechuga de pollo", calories: 165, protein: 31, carbs: 0, fat: 3 },
      { id: "verduras", name: "Verduras mixtas (100g)", calories: 35, protein: 2, carbs: 7, fat: 0 },
      { id: "ensalada", name: "Ensalada verde grande", calories: 20, protein: 2, carbs: 3, fat: 0 },
      { id: "manzana", name: "Manzana mediana", calories: 52, protein: 0, carbs: 14, fat: 0 },
      { id: "yogur", name: "Yogur griego (100g)", calories: 59, protein: 10, carbs: 3, fat: 0 },
      { id: "cafe", name: "Café negro", calories: 2, protein: 0, carbs: 0, fat: 0 },
    ],
    tips: [
      "Déficit calórico de 300-500 kcal para pérdida sostenible",
      "Mantén la proteína alta para preservar músculo",
      "Prioriza alimentos de bajo índice glucémico",
      "Bebe 2-3 litros de agua al día",
      "Haz cardio moderado 3-4 veces por semana",
    ],
  },
  {
    id: "mantener_peso",
    title: "Mantener Peso",
    subtitle: "Equilibrio calórico",
    description:
      "Para mantener el peso busca el equilibrio calórico con una dieta variada y nutritiva.",
    foods: [
      { id: "salmon", name: "Salmón (100g)", calories: 208, protein: 20, carbs: 0, fat: 13 },
      { id: "quinoa", name: "Quinoa cocida (100g)", calories: 120, protein: 4, carbs: 21, fat: 2 },
      { id: "aguacate", name: "Aguacate (medio)", calories: 160, protein: 2, carbs: 9, fat: 15 },
      { id: "brocoli", name: "Brócoli (100g)", calories: 34, protein: 3, carbs: 7, fat: 0 },
      { id: "fresas", name: "Fresas (100g)", calories: 32, protein: 1, carbs: 8, fat: 0 },
      { id: "almendras", name: "Almendras (30g)", calories: 173, protein: 6, carbs: 6, fat: 15 },
      { id: "leche", name: "Leche entera (200ml)", calories: 122, protein: 6, carbs: 9, fat: 7 },
    ],
    tips: [
      "Come 3 comidas principales y 2 snacks saludables",
      "Incluye proteína, carbohidrato y grasa en cada comida",
      "Come frutas y verduras de colores variados",
      "Hidrátate bien a lo largo del día",
      "Mantén consistencia en tus horarios de comida",
    ],
  },
];

export const MOTIVATIONAL_QUOTES = [
  "El éxito es la suma de pequeños esfuerzos repetidos cada día.",
  "No cuentes los días, haz que los días cuenten.",
  "Tu único límite eres tú.",
  "La disciplina supera a la motivación.",
  "Cada repetición te acerca a tu meta.",
  "El dolor es temporal, los resultados son permanentes.",
  "No pares cuando estés cansado, para cuando hayas terminado.",
  "Tu cuerpo puede lograrlo. Es tu mente la que debes convencer.",
  "El sacrificio de hoy es el éxito de mañana.",
  "No busques ser mejor que los demás, sé mejor que tu yo de ayer.",
  "Los campeones se hacen cuando nadie los está mirando.",
  "Haz hoy lo que otros no quieren, vive mañana como otros no pueden.",
];

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "primer_entrenamiento",
    title: "Primer Paso",
    description: "Completaste tu primer entrenamiento",
    iconName: "trophy",
    color: "#FFD700",
    targetCount: 1,
    type: "workouts",
  },
  {
    id: "cinco_entrenamientos",
    title: "En Movimiento",
    description: "Completaste 5 entrenamientos",
    iconName: "flash",
    color: "#FF6B00",
    targetCount: 5,
    type: "workouts",
  },
  {
    id: "diez_entrenamientos",
    title: "Guerrero",
    description: "Completaste 10 entrenamientos",
    iconName: "medal",
    color: "#43A047",
    targetCount: 10,
    type: "workouts",
  },
  {
    id: "treinta_entrenamientos",
    title: "Leyenda",
    description: "Completaste 30 entrenamientos",
    iconName: "star",
    color: "#FB8C00",
    targetCount: 30,
    type: "workouts",
  },
  {
    id: "cincuenta_entrenamientos",
    title: "Élite",
    description: "Completaste 50 entrenamientos",
    iconName: "diamond",
    color: "#8E24AA",
    targetCount: 50,
    type: "workouts",
  },
  {
    id: "siete_consecutivos",
    title: "7 Días de Fuego",
    description: "Entrenaste 7 días seguidos",
    iconName: "flame",
    color: "#E53935",
    targetCount: 7,
    type: "streak",
  },
  {
    id: "registraste_progreso",
    title: "Seguimiento",
    description: "Registraste tu peso por primera vez",
    iconName: "trending-up",
    color: "#00897B",
    targetCount: 1,
    type: "weight",
  },
  {
    id: "meta_alcanzada",
    title: "Meta Alcanzada",
    description: "Alcanzaste tu peso objetivo",
    iconName: "checkmark-circle",
    color: "#FFD700",
    targetCount: 1,
    type: "special",
  },
];

export function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

export function getCategoryById(id: string): WorkoutCategory | undefined {
  return WORKOUT_CATEGORIES.find((c) => c.id === id);
}

export function getExerciseById(id: string): Exercise | undefined {
  return ALL_EXERCISES[id];
}
