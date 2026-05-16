export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { imageData, mimeType } = req.body;

    if (!imageData || !mimeType) {
      return res.status(400).json({ error: 'Faltan datos de imagen' });
    }

    // Obtener API key de las variables de entorno
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key no configurada' });
    }

    // Llamar a la API de Anthropic
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageData
              }
            },
            {
              type: 'text',
              text: `Analiza este ticket de venta y extrae la siguiente información en formato JSON:
{
  "tn": "número de ticket",
  "fecha": "fecha en formato DD/MM/YYYY",
  "hora": "hora en formato HH:MM",
  "vendedor": "nombre del vendedor",
  "items": [
    {
      "codigo": "código del artículo",
      "descripcion": "descripción del producto",
      "cantidad": número,
      "precio": número,
      "importe": número
    }
  ],
  "subtotal": número,
  "impuestos": número,
  "total": número,
  "tienda": "nombre de la tienda si aparece"
}

Si algún campo no está visible o no se puede leer, usa null. Responde SOLO con el JSON, sin texto adicional.`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: 'Error en la API de Anthropic',
        details: errorData 
      });
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === 'text');
    
    if (!textContent) {
      return res.status(500).json({ error: 'No se recibió respuesta de texto' });
    }

    // Limpiar el JSON de posibles backticks de markdown
    let jsonText = textContent.text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsed = JSON.parse(jsonText);
    
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al procesar la imagen',
      message: error.message 
    });
  }
}
