// Niveles de intensidad
export const LEVELS = [
  { id: 1, name: 'Divertido', premium: false, tagline: 'Ligero y para romper el hielo' },
  { id: 2, name: 'Atrevido', premium: true, tagline: 'Más personal' },
  { id: 3, name: 'Picante', premium: true, tagline: 'Sube la temperatura' },
  { id: 4, name: 'Extremo', premium: true, tagline: 'Máxima intensidad' },
]

// modality: 'presencial' | 'distancia' | 'ambas'
// group: 'pareja' | 'grupo' | 'ambas'

export const TRUTHS = [
  // ---- Nivel 1 · Divertido ----
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la mentira más tonta que dijiste para no meterte en problemas?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Qué serie o película has visto más de 5 veces?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál es tu comida favorita de toda la vida?' },
  { level: 1, modality: 'ambas', group: 'grupo', text: '¿A quién del grupo llamarías primero en una emergencia?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál es tu recuerdo más vergonzoso de la infancia?' },
  { level: 1, modality: 'ambas', group: 'pareja', text: '¿Qué fue lo primero que pensaste de mí al conocerme?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Qué app usas más sin darte cuenta?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál es el peor regalo que recibiste?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Qué comida odias y todo el mundo ama?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál fue tu apodo más vergonzoso de la infancia?' },
  { level: 1, modality: 'ambas', group: 'grupo', text: '¿Quién del grupo crees que llegaría tarde a su propia boda?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál es la canción que escuchas a escondidas y te da vergüenza admitir?' },
  { level: 1, modality: 'ambas', group: 'ambas', text: '¿Cuál fue el examen que peor te fue en toda tu vida escolar?' },

  // ---- Nivel 2 · Atrevido ----
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿Cuál fue tu último mensaje que borraste antes de enviarlo?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿A quién de acá seguirías si tuvieras que elegir en una isla desierta?' },
  { level: 2, modality: 'ambas', group: 'pareja', text: '¿Qué es algo que te encantaría que hiciéramos y nunca te animaste a pedir?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la última vez que sentiste celos y por qué?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿Qué es lo más raro que buscaste en internet este mes?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿A qué persona de tu pasado revisas el perfil de vez en cuando?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿Cuál es la mentira más grande que le dijiste a tus padres?' },
  { level: 2, modality: 'ambas', group: 'grupo', text: '¿A quién del grupo le confiarías un secreto sin dudarlo?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿Qué es lo más incómodo que hiciste para caerle bien a alguien?' },
  { level: 2, modality: 'ambas', group: 'pareja', text: '¿Qué costumbre mía te molesta pero nunca me lo dijiste?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la última vez que fingiste estar bien cuando no lo estabas?' },
  { level: 2, modality: 'ambas', group: 'ambas', text: '¿A quién bloqueaste alguna vez en redes y por qué?' },

  // ---- Nivel 3 · Picante ----
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿Cuál es tu mayor inseguridad en una relación?' },
  { level: 3, modality: 'ambas', group: 'pareja', text: '¿Qué fue lo más atrevido que hiciste por alguien que te gustaba?' },
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿A quién del grupo besarías si tuvieras que elegir a alguien ahora?' },
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿Cuál es tu fantasía menos confesable?' },
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la cita más incómoda que tuviste?' },
  { level: 3, modality: 'ambas', group: 'pareja', text: '¿Qué es algo que te gustaría que te dijera más seguido?' },
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿Alguna vez sentiste algo por el amigo o la amiga de alguien de acá?' },
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿Cuál es la señal que te hace saber que alguien te gusta de verdad?' },
  { level: 3, modality: 'ambas', group: 'pareja', text: '¿Qué fue lo que más te costó decirme desde que estamos juntos?' },
  { level: 3, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la relación que más te costó superar?' },

  // ---- Nivel 4 · Extremo ----
  { level: 4, modality: 'ambas', group: 'ambas', text: '¿Cuál es el secreto que menos personas conocen de ti?' },
  { level: 4, modality: 'ambas', group: 'pareja', text: '¿Qué es lo que nunca me contaste porque piensas que me molestaría?' },
  { level: 4, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la situación más límite en la que estuviste por una atracción?' },
  { level: 4, modality: 'ambas', group: 'ambas', text: '¿Cuál es el arrepentimiento más grande que tienes relacionado con otra persona?' },
  { level: 4, modality: 'ambas', group: 'pareja', text: '¿Hay algo de nuestra relación que te gustaría que cambiara y nunca lo dijiste?' },
  { level: 4, modality: 'ambas', group: 'ambas', text: '¿Cuál fue la vez que estuviste más cerca de hacer algo de lo que te arrepentirías?' },
  { level: 4, modality: 'ambas', group: 'ambas', text: '¿Qué es lo que más miedo te da que la gente descubra de ti?' },
]

export const DARES = [
  // ---- Nivel 1 · Divertido ----
  { level: 1, modality: 'ambas', group: 'ambas', text: 'Haz 10 saltos de tijera ahora mismo.', timerSeconds: 30 },
  { level: 1, modality: 'ambas', group: 'ambas', text: 'Imita a un animal hasta que alguien adivine cuál es.', timerSeconds: 30 },
  { level: 1, modality: 'presencial', group: 'grupo', text: 'Deja que el grupo te peine como quiera durante 1 minuto.', timerSeconds: 60 },
  { level: 1, modality: 'ambas', group: 'ambas', text: 'Canta el estribillo de tu canción favorita.', timerSeconds: 30 },
  { level: 1, modality: 'distancia', group: 'ambas', text: 'Muestra la última foto de tu galería (si es apta para mostrar).', timerSeconds: 20 },
  { level: 1, modality: 'ambas', group: 'ambas', text: 'Cuenta un chiste. Si nadie se ríe, cuenta otro.', timerSeconds: 30 },
  { level: 1, modality: 'distancia', group: 'ambas', text: 'Pon tu cámara y haz la cara más graciosa que puedas por 5 segundos.', timerSeconds: 15 },
  { level: 1, modality: 'distancia', group: 'ambas', text: 'Muestra lo primero que encuentres en tu refrigerador.', timerSeconds: 20 },
  { level: 1, modality: 'presencial', group: 'ambas', text: 'Camina como pingüino hasta la puerta más cercana y vuelve.', timerSeconds: 30 },
  { level: 1, modality: 'ambas', group: 'ambas', text: 'Habla con acento durante el resto de tu turno.', timerSeconds: 30 },
  { level: 1, modality: 'distancia', group: 'ambas', text: 'Manda un audio cantando el cumpleaños feliz a quien tengas más arriba en tus chats recientes.', timerSeconds: 30 },
  { level: 1, modality: 'presencial', group: 'grupo', text: 'Deja que alguien del grupo te dibuje un bigote con maquillaje o lápiz por el resto de la ronda.', timerSeconds: 30 },
  { level: 1, modality: 'ambas', group: 'ambas', text: 'Haz tu mejor imitación de un famoso hasta que alguien lo adivine.', timerSeconds: 30 },

  // ---- Nivel 2 · Atrevido ----
  { level: 2, modality: 'ambas', group: 'ambas', text: 'Mándale un mensaje al azar a alguien de tu lista de contactos: "Te extraño 🥲".', timerSeconds: 60 },
  { level: 2, modality: 'presencial', group: 'grupo', text: 'Deja que alguien del grupo revise tu galería de fotos por 15 segundos.', timerSeconds: 15 },
  { level: 2, modality: 'ambas', group: 'pareja', text: 'Dime 3 cosas que te gustan de mí sin repetir lo físico.', timerSeconds: 45 },
  { level: 2, modality: 'ambas', group: 'ambas', text: 'Haz una videollamada a alguien y cantale "feliz cumpleaños" aunque no sea su cumpleaños.', timerSeconds: 45 },
  { level: 2, modality: 'distancia', group: 'ambas', text: 'Muestra las últimas 3 fotos de tu carrete (si son aptas).', timerSeconds: 30 },
  { level: 2, modality: 'distancia', group: 'ambas', text: 'Lee en voz alta tu último mensaje enviado a alguien que no sea del grupo.', timerSeconds: 20 },
  { level: 2, modality: 'presencial', group: 'grupo', text: 'Deja que el grupo revise tu historial de búsquedas de los últimos 5 minutos.', timerSeconds: 20 },
  { level: 2, modality: 'ambas', group: 'ambas', text: 'Muestra la última conversación que tuviste con tu mamá o papá, sin ocultar nada.', timerSeconds: 20 },
  { level: 2, modality: 'ambas', group: 'pareja', text: 'Cuéntame una anécdota tuya que nunca me contaste.', timerSeconds: 60 },
  { level: 2, modality: 'presencial', group: 'ambas', text: 'Deja que te tomen una foto sin avisarte cómo salió, y la tienes que aceptar como foto de perfil por el resto de la partida.', timerSeconds: 20 },
  { level: 2, modality: 'distancia', group: 'ambas', text: 'Manda un mensaje de voz imitando a alguien del grupo a otra persona del grupo.', timerSeconds: 30 },

  // ---- Nivel 3 · Picante ----
  { level: 3, modality: 'presencial', group: 'ambas', text: 'Deja que te hagan un chupón donde el grupo decida (visible).', timerSeconds: 30 },
  { level: 3, modality: 'ambas', group: 'pareja', text: 'Susúrrame algo que nunca me dijiste en voz alta.', timerSeconds: 30 },
  { level: 3, modality: 'presencial', group: 'grupo', text: 'Baila reggaetón pegado con la persona a tu derecha por 30 segundos.', timerSeconds: 30 },
  { level: 3, modality: 'distancia', group: 'pareja', text: 'Mándame un audio diciendo lo que te gustaría que estuviera pasando si estuviéramos juntos ahora.', timerSeconds: 45 },
  { level: 3, modality: 'presencial', group: 'pareja', text: 'Dale un beso en el cuello a tu pareja de juego.', timerSeconds: 15 },
  { level: 3, modality: 'distancia', group: 'pareja', text: 'Haz una videollamada y muéstrame algo que normalmente no me mostrarías (dentro de lo cómodo para vos).', timerSeconds: 40 },
  { level: 3, modality: 'presencial', group: 'grupo', text: 'Deja que la persona a tu izquierda elija una prenda tuya para quitarte (algo que no comprometa).', timerSeconds: 20 },
  { level: 3, modality: 'distancia', group: 'grupo', text: 'Muestra tu cuarto tal cual está ahora mismo, girando la cámara 360°.', timerSeconds: 25 },
  { level: 3, modality: 'distancia', group: 'grupo', text: 'Cuéntale al grupo, con lujo de detalle, tu peor cita a ciegas.', timerSeconds: 45 },
  { level: 3, modality: 'ambas', group: 'pareja', text: 'Describe en voz alta lo que más te atrae físicamente de mí, con detalle.', timerSeconds: 40 },
  { level: 3, modality: 'presencial', group: 'ambas', text: 'Deja que alguien te dé un masaje de hombros por 30 segundos.', timerSeconds: 30 },

  // ---- Nivel 4 · Extremo ----
  { level: 4, modality: 'presencial', group: 'pareja', text: 'Dale un beso de 10 segundos a tu pareja de juego.', timerSeconds: 10 },
  { level: 4, modality: 'ambas', group: 'pareja', text: 'Descríbeme en detalle tu cita ideal conmigo, sin cortarte.', timerSeconds: 60 },
  { level: 4, modality: 'presencial', group: 'grupo', text: 'Deja que alguien del grupo te dé una orden (dentro de lo razonable) y cúmplela.', timerSeconds: 45 },
  { level: 4, modality: 'presencial', group: 'pareja', text: 'Siéntate en las piernas de tu pareja de juego durante el resto de tu turno.', timerSeconds: 20 },
  { level: 4, modality: 'distancia', group: 'pareja', text: 'Manda un audio de un minuto describiendo, sin cortarte, qué harías si estuviéramos solos ahora mismo.', timerSeconds: 60 },
  { level: 4, modality: 'presencial', group: 'ambas', text: 'Deja que el grupo elija una parte de tu cuerpo para que te hagan un masaje de 20 segundos.', timerSeconds: 20 },
  { level: 4, modality: 'distancia', group: 'grupo', text: 'Manda al grupo un audio confesando cuál fue tu peor decisión relacionada con una atracción.', timerSeconds: 45 },
  { level: 4, modality: 'ambas', group: 'pareja', text: 'Confiesa cuál ha sido el momento más íntimo que recuerdas entre nosotros, con todo el detalle que te animes a dar.', timerSeconds: 45 },
]

export function pickCard({ type, level, modality, group, history, customCards = [] }) {
  const base = type === 'truth' ? TRUTHS : DARES
  const custom = customCards.filter((c) => c.type === type && c.level === level)

  // Búsqueda progresiva: exacto → ignora grupo → ignora modalidad → cualquier carta del nivel.
  // Así el juego nunca se queda sin nada que mostrar, aunque falte contenido para una combinación puntual.
  const strategies = [
    (c) => c.level === level && (c.modality === 'ambas' || c.modality === modality) && (c.group === 'ambas' || c.group === group),
    (c) => c.level === level && (c.modality === 'ambas' || c.modality === modality),
    (c) => c.level === level && (c.group === 'ambas' || c.group === group),
    (c) => c.level === level,
  ]

  for (const matches of strategies) {
    const pool = [...base.filter(matches), ...custom.filter(matches)]
    if (pool.length === 0) continue
    const unused = pool.filter((c) => !history.includes(c.text))
    const source = unused.length > 0 ? unused : pool
    return source[Math.floor(Math.random() * source.length)]
  }
  return null
}
