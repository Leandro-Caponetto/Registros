import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0 || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to execute Gemini with automatic fallback and retries
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  contents: any[],
  systemInstruction: string,
  preferredModel: string = 'gemini-3.8-flash'
): Promise<{ text: string; modelUsed: string }> {
  // Candidate models from valid guidelines: primary flash, fast lite, and latest alias
  const modelsToTry = [
    preferredModel,
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));
  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        const text = response.text;
        if (text && text.trim().length > 0) {
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        const isUnavailable =
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('UNAVAILABLE') ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED');

        if (isUnavailable) {
          console.warn(`[Gemini API] Modelo ${model} reportó alta demanda (intento ${attempt}/2).`);
          await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
        } else {
          break;
        }
      }
    }
  }

  throw lastError;
}

// Endpoint to check connection status
app.get('/api/gemini/status', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    connected: hasKey,
    model: 'gemini-3.8-flash',
    fallbackModels: ['gemini-3.1-flash-lite', 'gemini-flash-latest'],
    instruction: hasKey
      ? 'Gemini API conectada con éxito. Modelo gemini-3.8-flash y respaldo activo.'
      : 'Clave GEMINI_API_KEY no detectada o con valor por defecto. Configúrala en Settings > Secrets o en tu archivo .env.',
  });
});

// Endpoint for chatbot conversation
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, contextData, model } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'La lista de mensajes es requerida.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Return clear guidance on how to connect Gemini
      return res.status(200).json({
        reply: `### 🤖 ProdBot Asistente (Modo Guía de Conexión)\n\n` +
          `No se ha detectado una clave válida en la variable de entorno **\`GEMINI_API_KEY\`**.\n\n` +
          `#### 🔑 ¿Cómo conectar tu proyecto con Gemini?\n` +
          `1. **Obtén tu API Key**: Ingresa a [Google AI Studio](https://aistudio.google.com/app/apikey) y genera una clave gratuita.\n` +
          `2. **Configura la clave en AI Studio**: En la barra superior o lateral de Google AI Studio, abre el panel de **Settings > Secrets** (o Configuración de Secretos) y crea una variable llamada **\`GEMINI_API_KEY\`** con el valor de tu clave.\n` +
          `3. **En entorno local (.env)**: Si ejecutas la app localmente, abre tu archivo \`.env\` y coloca:\n` +
          `   \`\`\`bash\n   GEMINI_API_KEY=AIzaSy...\n   \`\`\`\n` +
          `4. **Arquitectura segura del sistema**: El backend (\`server.ts\`) utiliza el SDK oficial \`@google/genai\` y los modelos **\`gemini-3.8-flash\`** y **\`gemini-3.1-flash-lite\`**. Tu clave nunca se expone en el navegador del cliente.\n\n` +
          `*Actualmente tienes **${contextData?.totalDeployments ?? 0} despliegues** y **${contextData?.totalMiddleware ?? 0} integraciones middleware** cargadas en ProdTracker. Tan pronto agregues la clave, responderé consultas en tiempo real sobre ellos.*`,
        status: 'missing_key',
        connected: false,
      });
    }

    // Build rich system instruction with ProdTracker context
    let systemInstruction = `Eres "ProdBot", el Asistente Experto en Despliegues a Producción, Middleware Empresarial y Gestión de Cambios / GDD de la plataforma ProdTracker.
Tu función es asistir a Ingenieros DevOps, Release Managers, Arquitectos de Middleware y Desarrolladores en:
1. Análisis de pases a producción (exitosos, pendientes, fallidos, cancelados).
2. Consulta y rastreo de Número de GDD (Guía de Despliegue) y códigos de integración.
3. Evaluación de impacto (Bajo, Medio, Alto, Crítico) y recomendación de planes de rollback / mitigación.
4. Generación y redacción de justificaciones para comités de cambios (CAB).
5. Explicación de la arquitectura del sistema y conexión con Google Gemini.

Reglas de respuesta:
- Sé profesional, claro, técnico y estructurado con markdown (viñetas, tablas, negritas).
- Responde siempre en español a menos que el usuario hable en otro idioma.
- Basa tus respuestas en los datos reales del sistema proporcionados a continuación.`;

    if (contextData) {
      systemInstruction += `\n\n--- DATOS EN TIEMPO REAL DE PRODTRACKER ---\n` +
        `• Total de Despliegues Registrados: ${contextData.totalDeployments || 0}\n` +
        `• Despliegues Pendientes: ${contextData.pendingDeployments || 0}\n` +
        `• Despliegues con Fallo: ${contextData.failedDeployments || 0}\n` +
        `• Despliegues Exitosos: ${contextData.successDeployments || 0}\n` +
        `• Tasa de Éxito Actual: ${contextData.successRate || '0%'}\n` +
        `• Integraciones de Middleware Totales: ${contextData.totalMiddleware || 0}\n`;

      if (contextData.recentDeployments && contextData.recentDeployments.length > 0) {
        systemInstruction += `\n• Despliegues de Producción actuales (Muestra):\n` +
          JSON.stringify(contextData.recentDeployments.slice(0, 15), null, 2) + `\n`;
      }

      if (contextData.middlewareList && contextData.middlewareList.length > 0) {
        systemInstruction += `\n• Integraciones de Middleware registradas (Número de GDD / Capas / Protocolos):\n` +
          JSON.stringify(contextData.middlewareList.slice(0, 15), null, 2) + `\n`;
      }
    }

    // Map conversation messages to GenAI contents structure
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }],
    }));

    try {
      const result = await callGeminiWithFallback(
        ai, 
        contents, 
        systemInstruction, 
        model || 'gemini-3.8-flash'
      );

      return res.json({ 
        reply: result.text, 
        modelUsed: result.modelUsed,
        status: 'ok', 
        connected: true 
      });
    } catch (genError: any) {
      console.error('Error tras agotar reintentos con Gemini:', genError);
      const errorMsg = String(genError?.message || genError);
      const isHighDemand = 
        errorMsg.includes('503') || 
        errorMsg.includes('high demand') || 
        errorMsg.includes('UNAVAILABLE') ||
        errorMsg.includes('429');

      return res.status(200).json({
        reply: isHighDemand
          ? `⚠️ **Alta demanda temporal en Google Gemini (Error 503).**\n\n` +
            `Los servidores de Gemini en la nube están experimentando un pico temporal de concurrencia. El sistema intentó reintentar automáticamente con los modelos disponibles (\`gemini-3.8-flash\`, \`gemini-3.1-flash-lite\`).\n\n` +
            `💡 **Solución rápida:**\n` +
            `Haz clic en el botón **«Reintentar»** abajo o pulsa enviar nuevamente. Estos picos suelen resolverse en unos instantes.`
          : `⚠️ **Aviso de conexión:** Ocurrió un inconveniente temporal al conectar con Gemini: ${errorMsg}. Por favor reintenta tu consulta.`,
        isRetryable: true,
        status: 'high_demand',
        connected: true,
      });
    }
  } catch (error: any) {
    console.error('Error interno en endpoint /api/gemini/chat:', error);
    return res.status(500).json({
      error: error.message || 'Error interno al consultar Gemini API.',
      status: 'error',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[ProdTracker Server] Escuchando en http://0.0.0.0:${port}`);
  });
}

startServer();
