import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON payloads
app.use(express.json());

// Initialize Gemini client safely
// The key is accessed via process.env.GEMINI_API_KEY
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. Set it in current secrets or your environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY_FOR_DEV_ONLY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// Helper to define response schema for poster layout
const posterSchema = {
  type: Type.OBJECT,
  properties: {
    dateString: {
      type: Type.STRING,
      description: "La fecha formateada en español, ej '15 de Junio' o 'Día de la consulta'."
    },
    celebrationTitle: {
      type: Type.STRING,
      description: "Título principal de la celebración, ej 'Día Mundial del Viento' o el día personalizado solicitado."
    },
    subtitle: {
      type: Type.STRING,
      description: "Subtítulo corto e inspirador, ej 'Soplando energía para un futuro sostenible'."
    },
    description: {
      type: Type.STRING,
      description: "Explicación poética y detallada en español de lo que se celebra, su importancia histórica y por qué importa hoy."
    },
    slogan: {
      type: Type.STRING,
      description: "Frase célebre o slogan en letras grandes para colocar en el afiche, ej 'Siente la fuerza del viento'."
    },
    primaryColor: {
      type: Type.STRING,
      description: "Color hexadecimal premium de fondo principal o gradiente, ej '#4f46e5'."
    },
    accentColor: {
      type: Type.STRING,
      description: "Color hexadecimal de contraste para detalles o bordes, ej '#f59e0b'."
    },
    textColor: {
      type: Type.STRING,
      description: "Color de texto sugerido ('light' o 'dark') para contrastar perfectamente con el color primario."
    },
    bgPreset: {
      type: Type.STRING,
      description: "Nombre de preset visual de fondo: 'gradient-indigo', 'gradient-rose', 'gradient-amber', 'gradient-emerald', 'gradient-sky', 'gradient-dark', 'solid-cream', 'gradient-sunset', 'gradient-forest'."
    },
    iconName: {
      type: Type.STRING,
      description: "Nombre de icono Lucide ideal para representar este día, ej 'Wind', 'Sun', 'Heart', 'Code', 'Calendar', 'Gift', 'Sparkles', 'Flame', 'Flower2', 'Smile', 'Database', 'Music'."
    },
    stickers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          emoji: { type: Type.STRING },
          label: { type: Type.STRING, description: "Descripción del sticker." },
          x: { type: Type.INTEGER, description: "Posición horizontal relativa porcentual (0-100)." },
          y: { type: Type.INTEGER, description: "Posición vertical relativa porcentual (0-100)." },
          size: { type: Type.STRING, description: "Sizing class, ej 'text-5xl', 'text-6xl', 'text-7xl'." }
        },
        required: ["emoji", "label", "x", "y", "size"]
      },
      description: "Lista de 3 a 5 stickers/emojis para decorar de forma lúdica el afiche."
    },
    historicalFacts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Ejemplos, datos curiosos o hechos históricos interesantes de esta conmemoración (3 elementos)."
    },
    celebrationIdeas: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 sugerencias divertidas o significativas para celebrar y honrar este día desde casa o con amigos."
    },
    imagePrompt: {
      type: Type.STRING,
      description: "Prompt detallado y artístico para generación de imagen de fondo, en inglés, descriptivo y sin mención de texto ni marcas, estilo ilustración plana o minimalista en 2.5D."
    }
  },
  required: [
    "dateString",
    "celebrationTitle",
    "subtitle",
    "description",
    "slogan",
    "primaryColor",
    "accentColor",
    "textColor",
    "bgPreset",
    "iconName",
    "stickers",
    "historicalFacts",
    "celebrationIdeas",
    "imagePrompt"
  ]
};

// API: Obtener efeméride del día de hoy
app.post("/api/celebration-today", async (req, res) => {
  try {
    const { date, userLocationTime } = req.body;
    
    // Default to the provided date, or use the server date if missing
    const targetDate = date ? new Date(date) : new Date();
    const dateStringFormatted = targetDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const prompt = `Queremos crear un hermoso afiche conmemorativo para la fecha: ${dateStringFormatted}.
Investiga qué efemérides relevantes, días mundiales, nacionales, de cultura popular o celebraciones simpáticas ocurren hoy. 
Si hay múltiples, selecciona la más vibrante o celebre, o condensa una hermosa conmemoración.
Proporciona la información estructurada con colores coordinados y stickers lúdicos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Eres un diseñador gráfico editorial y experto histórico experto en celebraciones. Creas descripciones inspiradoras de días mundiales y conmemoraciones, diseñando el look and feel del cartel (colores, slogans, stickers, emojis que floten) con excelente gusto estético en español.",
        responseMimeType: "application/json",
        responseSchema: posterSchema,
        temperature: 0.8,
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating initial celebration:", error);
    res.status(500).json({ error: error.message || "Error al generar la efeméride" });
  }
});

// API: Chat interactivo para modificar el afiche o agregar un nuevo día
app.post("/api/chat-poster", async (req, res) => {
  try {
    const { messages, currentPoster, targetDate } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Faltan los mensajes de chat" });
    }

    const compiledHistory = messages.map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join("\n");

    const prompt = `El usuario interactúa contigo en un chat de un creador de afiches.
Queremos responder a su consulta y, de ser necesario, actualizar o cambiar por completo el afiche.
El afiche actual tiene esta estructura:
${JSON.stringify(currentPoster, null, 2)}

La fecha de referencia es: ${targetDate || 'Día de hoy'}.

El usuario dice en su último mensaje: "${messages[messages.length - 1].content}".

INSTRUCCIONES:
1. Si el usuario pide "agregar un día", "crear el día de...", "cambia a la fecha X", o pide explícitamente celebrar otra cosa, debes reinventar el afiche por completo para esa nueva celebración.
2. Si el usuario pide "cambiar el eslogan", "añadir un emoji de cohete en la esquina", "cambiar a fondo rosa", "pon más stickers", o ajustar el diseño, mantén los textos de la celebración pero edita esos campos y agrega/modifica lo solicitado en la estructura.
3. Devuelve SIEMPRE tu respuesta textual de asistencia (en el campo "assistantReply" de tu JSON) de forma cercana, amigable y entusiasta.
4. Devuelve también la estructura "updatedPoster" de tipo posterSchema reflejando los cambios. Si no hay cambios en el afiche y el usuario solo charla, devuelve el afiche anterior tal cual, pero si pide cambios o una nueva celebración, adáptalo de inmediato.

El JSON de salida DEBE tener estrictamente este formato de nivel superior:
{
  "assistantReply": "Un mensaje cálido en español explicando qué hiciste o respondiendo su pregunta.",
  "updatedPoster": <objeto que cumpla exactamente la estructura del posterSchema anterior>
}`;

    // schema wrapper which contains assistantReply and updatedPoster
    const chatResponseSchema = {
      type: Type.OBJECT,
      properties: {
        assistantReply: {
          type: Type.STRING,
          description: "Texto de respuesta en chat en español dirigido al usuario, explicando de forma entusiasta los cambios creativos realizados o resolviendo dudas."
        },
        updatedPoster: posterSchema
      },
      required: ["assistantReply", "updatedPoster"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: `Historial de conversación previa:\n${compiledHistory}` },
        { text: prompt }
      ],
      config: {
        systemInstruction: "Eres un asistente de diseño y copywriter espectacular que ayuda a crear y pulir carteles/afiches conmemorativos de días especiales en español. Respondes con amabilidad, humor o poesía, y actualizas las variables de diseño del cartel en un solo paso estructurado.",
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
        temperature: 0.7,
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Error in chat conversation with poster:", error);
    res.status(500).json({ error: error.message || "Error al procesar la conversación" });
  }
});

// API: Generación de Imagen mediante IA (Gemini Image Generation) en caso de que deseen renderizar un poster ultra realista
app.post("/api/generate-ai-image", async (req, res) => {
  try {
    const { imagePrompt, ratio } = req.body;
    
    if (!imagePrompt) {
      return res.status(400).json({ error: "No se proporcionó un prompt para la imagen." });
    }

    console.log("Generando imagen con prompt:", imagePrompt);

    // Call Gemini 2.5 flash image model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `An artistic minimal flat-vector illustration vector style graphic. ${imagePrompt}, vivid clean colors, beautiful composition, poster artwork, no text, no watermarks, high-resolution premium art, elegant graphics.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: ratio || "3:4",
        }
      },
    });

    let base64String = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64String = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64String) {
      throw new Error("No se obtuvieron bytes de imagen válidos de la generación");
    }

    res.json({ imageUrl: `data:image/png;base64,${base64String}` });
  } catch (error: any) {
    console.error("Error generating poster image:", error);
    // Return a reliable visual fallback if generation fails (e.g. rate limits, keys issues)
    res.status(500).json({ 
      error: "No se pudo generar la imagen con el API de Gemini en este momento. Utiliza nuestro motor de diseño dinámico ilustrado.",
      fallbackUrl: `https://picsum.photos/seed/${encodeURIComponent(req.body.imagePrompt || "poster")}/600/800`
    });
  }
});

// Setup dev server or static serve for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Corriendo en http://localhost:${PORT} con ambiente ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
