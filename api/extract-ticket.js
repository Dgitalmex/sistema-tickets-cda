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
      return res.status(500).json({ error: 'API Key no configurada' });
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
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
              text: `Extrae TODOS los datos de este ticket de Cremería del Ahorro y responde SOLO con JSON válido, sin explicaciones ni markdown.

Estructura:
{
  "tienda": "nombre de la tienda",
  "tn": "número de ticket/folio",
  "fecha": "dd/mm/yyyy",
  "hora": "HH:MM",
  "balanza": "número de balanza (si aplica)",
  "vendedor": "nombre del vendedor/atendió",
  "items": [
    {
      "codigo": "código",
      "descripcion": "nombre producto",
      "cantidad": "cantidad o peso",
      "precioUnitario": "precio unitario",
      "total": "subtotal"
    }
  ],
  "subtotal": "subtotal sin IVA",
  "iva": "monto del IVA",
  "total": "total a pagar",
  "metodoPago": "efectivo/tarjeta/etc"
}

IMPORTANTE:
- Si no encuentras algún dato, pon null
- Los números sin símbolos de moneda ni comas
- Responde ÚNICAMENTE el JSON, sin \`\`\`json ni explicaciones`
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Anthropic:', errorData);
      return res.status(response.status).json({ 
        error: 'Error al procesar la imagen',
        details: errorData 
      });
    }

    const data = await response.json();
    
    // Extraer el texto de la respuesta
    let textContent = '';
    for (const block of data.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
    }

    // Limpiar el texto y parsear JSON
    let cleanText = textContent.trim();
    cleanText = cleanText.replace(/```json\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');
    cleanText = cleanText.trim();

    let extractedData;
    try {
      extractedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Error parseando JSON:', cleanText);
      return res.status(500).json({ 
        error: 'Error al parsear los datos extraídos',
        rawText: cleanText
      });
    }

    return res.status(200).json(extractedData);

  } catch (error) {
    console.error('Error en la función:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}
