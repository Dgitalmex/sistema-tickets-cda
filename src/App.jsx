import React, { useState, useEffect } from 'react';
import { Upload, FileImage, Loader2, AlertCircle, ClipboardList, Bell, CheckCircle, Clock, XCircle, Search, BarChart3, Filter } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { database } from './firebaseConfig';
import { ref, push, set, onValue, update } from 'firebase/database';

const TIENDAS = ['Valle', 'Popular', 'San Agustín', 'Progreso 1', 'Progreso 2', 'Cuautepec', 'Cuautitlán', 'Nicolás', 'Tulpetlac', 'Tecámac 1', 'Tecámac 2', 'Zumpango', 'Tizayuca'];

// Usuarios del sistema
const USUARIOS = {
  'admin': { password: 'zxc', rol: 'admin', tienda: null },
  'cancelaciones': { password: '2026', rol: 'cancelaciones', tienda: null },
  'valle': { password: '2024', rol: 'tienda', tienda: 'Valle' },
  'popular': { password: '2025', rol: 'tienda', tienda: 'Popular' },
  'sanagustin': { password: '2026', rol: 'tienda', tienda: 'San Agustín' },
  'progreso1': { password: '2027', rol: 'tienda', tienda: 'Progreso 1' },
  'progreso2': { password: '2028', rol: 'tienda', tienda: 'Progreso 2' },
  'cuautepec': { password: '2029', rol: 'tienda', tienda: 'Cuautepec' },
  'cuautitlan': { password: '2030', rol: 'tienda', tienda: 'Cuautitlán' },
  'nicolas': { password: '2031', rol: 'tienda', tienda: 'Nicolás' },
  'tulpetlac': { password: '2032', rol: 'tienda', tienda: 'Tulpetlac' },
  'tecamac1': { password: '2033', rol: 'tienda', tienda: 'Tecámac 1' },
  'tecamac2': { password: '2034', rol: 'tienda', tienda: 'Tecámac 2' },
  'zumpango': { password: '2035', rol: 'tienda', tienda: 'Zumpango' },
  'tizayuca': { password: '2036', rol: 'tienda', tienda: 'Tizayuca' }
};

export default function SistemaTicketsCDA() {
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [loginUsuario, setLoginUsuario] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('registro');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagenSustituye, setImagenSustituye] = useState(null);
  const [imagenSustituyePreview, setImagenSustituyePreview] = useState(null);
  const [imagenEvidencia, setImagenEvidencia] = useState(null);
  const [imagenEvidenciaPreview, setImagenEvidenciaPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTienda, setSelectedTienda] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(null);
  const [evidenciaTemp, setEvidenciaTemp] = useState(null);
  const [evidenciaTempPreview, setEvidenciaTempPreview] = useState(null);
  const [destinatarioWhatsApp, setDestinatarioWhatsApp] = useState('');
  
  // Filtros de reportes
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroTienda, setFiltroTienda] = useState('');
  const [filtroFolio, setFiltroFolio] = useState('');

  // Cargar tickets desde Firebase en tiempo real
  useEffect(() => {
    const ticketsRef = ref(database, 'tickets');
    const unsubscribe = onValue(ticketsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ticketsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).sort((a, b) => b.fechaRegistroTimestamp - a.fechaRegistroTimestamp);
        setTickets(ticketsArray);
        // También guardar en localStorage como backup
        localStorage.setItem('tickets_cda', JSON.stringify(ticketsArray));
      } else {
        // Si no hay datos en Firebase, intentar cargar del localStorage
        const saved = localStorage.getItem('tickets_cda');
        if (saved) setTickets(JSON.parse(saved));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    const usuario = loginUsuario.toLowerCase().trim();
    const userData = USUARIOS[usuario];
    
    if (!userData || userData.password !== loginPassword) {
      setLoginError('Usuario o contraseña incorrectos');
      return;
    }
    
    setUsuarioLogueado({
      usuario: usuario,
      rol: userData.rol,
      tienda: userData.tienda
    });
    setLoginError('');
    setLoginUsuario('');
    setLoginPassword('');
  };

  const handleLogout = () => {
    setUsuarioLogueado(null);
    setActiveTab('registro');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setExtractedData(null);
      setError(null);
    }
  };

  const handleImagenSustituye = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenSustituye(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagenSustituyePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImagenEvidencia = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenEvidencia(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagenEvidenciaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };


  const extractData = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        
       // Llamar directamente a Anthropic API
const response = await fetch('https://anthropic-proxy.dgitalmex.workers.dev', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
   
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: image.type,
            data: base64
          }
        },
        {
          type: 'text',
          text: 'Extrae la información del ticket en JSON: {folio, sucursal, vendedor, total, articulos}. Responde SOLO el JSON.'
        }
      ]
    }]
  })
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error?.message || 'Error al procesar la imagen');
}

const data = await response.json();
const parsed = JSON.parse(data.content[0].text);        
        // Si el usuario es de una tienda específica, pre-llenar la tienda
        if (usuarioLogueado && usuarioLogueado.rol === 'tienda') {
          parsed.tienda = usuarioLogueado.tienda;
        }
        
        setExtractedData(parsed);
        setLoading(false);
      };
      
      reader.readAsDataURL(image);
      } catch (err) {
    console.error('Error:', err);
    setError(err.message || 'Error al extraer datos del ticket');
    setLoading(false);
  }
};

  const enviarTicket = async () => {
    if (!extractedData) return;
    
    // Validar campos obligatorios
    if (!extractedData.tienda || extractedData.tienda === '') {
      alert('⚠️ El campo TIENDA es obligatorio');
      return;
    }
    
    if (!extractedData.status || extractedData.status === '') {
      alert('⚠️ El campo STATUS es obligatorio');
      return;
    }
    
    if (!extractedData.motivo || extractedData.motivo.trim() === '') {
      alert('⚠️ El campo MOTIVO es obligatorio');
      return;
    }
    
    const nuevoTicket = {
      ...extractedData,
      imagenCancelado: imagePreview,
      imagenSustituye: imagenSustituyePreview,
      imagenEvidencia: imagenEvidenciaPreview,
      fechaRegistro: new Date().toLocaleString('es-MX'),
      fechaRegistroTimestamp: Date.now(),
      statusCancelaciones: 'pendiente por atender',
      mensaje: null
    };
    
    try {
      // Guardar en Firebase
      const ticketsRef = ref(database, 'tickets');
      const newTicketRef = push(ticketsRef);
      await set(newTicketRef, nuevoTicket);
    } catch (error) {
      console.error('Error al guardar en Firebase:', error);
      alert('Error al guardar el ticket. Por favor intenta de nuevo.');
      return;
    }
    
    // Enviar por WhatsApp
    const msg = `🎫 *TICKET CDA*\n\n` +
      `🏪 *Tienda:* ${extractedData.tienda || 'No especificada'}\n` +
      `📊 *Status:* ${extractedData.status || 'No especificado'}\n` +
      (extractedData.motivo ? `📝 *Motivo:* ${extractedData.motivo}\n` : '') +
      `\n━━━━━━━━━━━━━━━\n\n` +
      `📄 *TN/Folio:* ${extractedData.tn || ''}\n` +
      `📅 *Fecha:* ${extractedData.fecha || ''}\n` +
      `🕐 *Hora:* ${extractedData.hora || ''}\n` +
      (extractedData.vendedor ? `👤 *Vendedor:* ${extractedData.vendedor}\n` : '') +
      `\n*ARTÍCULOS:*\n` +
      (extractedData.items || []).map((item, i) => 
        `${i+1}. ${item.descripcion}\n` +
        `   • Código: ${item.codigo}\n` +
        `   • Cantidad: ${item.cantidad}\n` +
        `   • Total: $${item.total}`
      ).join('\n\n') +
      `\n\n━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL: $${extractedData.total}*`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    
    // Limpiar todos los campos
    setImage(null);
    setImagePreview(null);
    setImagenSustituye(null);
    setImagenSustituyePreview(null);
    setImagenEvidencia(null);
    setImagenEvidenciaPreview(null);
    setExtractedData(null);
  };

  const actualizarStatusCancelaciones = (ticketId, nuevoStatus) => {
    // Si cambia a "cancelado" o "en seguimiento", abrir modal
    if (nuevoStatus === 'cancelado' || nuevoStatus === 'en seguimiento') {
      const ticket = tickets.find(t => t.id === ticketId);
      setModalConfirmacion({
        ticket,
        nuevoStatus,
        requiereEvidencia: nuevoStatus === 'cancelado'
      });
    } else {
      // Para "pendiente por atender", cambiar directamente
      setTickets(tickets.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            statusCancelaciones: nuevoStatus,
            mensaje: null,
            folioCancelacion: null,
            evidenciaCancelacion: null
          };
        }
        return t;
      }));
    }
  };

  const confirmarCancelacion = async () => {
    if (!modalConfirmacion) return;
    
    // Validar evidencia obligatoria
    if (modalConfirmacion.requiereEvidencia && !evidenciaTemp) {
      alert('La evidencia es obligatoria para cancelaciones');
      return;
    }

    // Generar folio único
    const folio = `FC-${Date.now().toString().slice(-8)}`;
    
    const ticketId = modalConfirmacion.ticket.id;
    const updates = {
      statusCancelaciones: modalConfirmacion.nuevoStatus,
      mensaje: '✅ Tu solicitud fue atendida, checa tus pendientes en el grupo',
      folioCancelacion: folio,
      evidenciaCancelacion: evidenciaTempPreview
    };

    try {
      // Actualizar en Firebase
      const ticketRef = ref(database, `tickets/${ticketId}`);
      await update(ticketRef, updates);
    } catch (error) {
      console.error('Error al actualizar en Firebase:', error);
      alert('Error al actualizar el ticket. Por favor intenta de nuevo.');
      return;
    }

    // Construir mensaje de WhatsApp
    const ticket = modalConfirmacion.ticket;
    const tituloFolio = modalConfirmacion.nuevoStatus === 'cancelado' 
      ? 'FOLIO DE CANCELACIÓN' 
      : 'FOLIO DE SEGUIMIENTO';
    const statusTexto = modalConfirmacion.nuevoStatus === 'cancelado' 
      ? 'CANCELADO' 
      : 'EN SEGUIMIENTO';
    
    const msg = `🎫 *CONFIRMACIÓN DE ATENCIÓN*\n\n` +
      `✅ Su solicitud ha sido atendida\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `📋 *DATOS DEL TICKET*\n` +
      `🏪 Tienda: ${ticket.tienda}\n` +
      `📄 TN Original: ${ticket.tn}\n` +
      `📅 Fecha: ${ticket.fecha}\n` +
      `🕐 Hora: ${ticket.hora}\n` +
      `💰 Total: $${ticket.total}\n` +
      `📊 Status: ${ticket.status}\n` +
      (ticket.motivo ? `📝 Motivo: ${ticket.motivo}\n` : '') +
      `\n━━━━━━━━━━━━━━━\n` +
      `🆔 *${tituloFolio}*\n` +
      `${folio}\n\n` +
      `✅ Status: ${statusTexto}\n\n` +
      `Para cualquier aclaración, favor de presentar este folio.\n\n` +
      `⚠️ *IMPORTANTE*\n` +
      `📌 Favor de checar tus pendientes enviados en el sistema de tickets CDA\n` +
      `💰 Evitar tener pendientes por cobrar\n` +
      `⏰ Evita tener tickets con mucho tiempo sin atención`;

    // Enviar por WhatsApp (sin número, para que el usuario seleccione)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');

    // Limpiar modal
    setModalConfirmacion(null);
    setEvidenciaTemp(null);
    setEvidenciaTempPreview(null);
    setDestinatarioWhatsApp('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-300';
      case 'en seguimiento': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pendiente por atender': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      case 'en seguimiento': return <Clock className="h-4 w-4" />;
      case 'pendiente por atender': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Pantalla de Login */}
      {!usuarioLogueado ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-orange-600 mb-2">🎫 Sistema CDA</h1>
              <p className="text-gray-600">Gestión de Tickets</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Usuario</label>
                <input
                  type="text"
                  value={loginUsuario}
                  onChange={(e) => setLoginUsuario(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Ingresa tu usuario"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Ingresa tu contraseña"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
              
              {loginError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
                  {loginError}
                </div>
              )}
              
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-6 rounded-lg font-bold shadow-lg"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">🎫 Sistema de Tickets CDA</h1>
                <p className="text-orange-100">
                  {usuarioLogueado.rol === 'admin' && 'Administrador'}
                  {usuarioLogueado.rol === 'cancelaciones' && 'Departamento de Cancelaciones'}
                  {usuarioLogueado.rol === 'tienda' && `Tienda: ${usuarioLogueado.tienda}`}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

      {/* Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {(usuarioLogueado.rol === 'admin' || usuarioLogueado.rol === 'tienda') && (
              <button
                onClick={() => setActiveTab('registro')}
                className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-4 ${
                  activeTab === 'registro'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ClipboardList className="h-5 w-5" />
                Registro de Tickets
                {tickets.filter(t => usuarioLogueado.rol === 'tienda' ? t.tienda === usuarioLogueado.tienda : true).length > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tickets.filter(t => usuarioLogueado.rol === 'tienda' ? t.tienda === usuarioLogueado.tienda : true).length}
                  </span>
                )}
              </button>
            )}
            
            {(usuarioLogueado.rol === 'admin' || usuarioLogueado.rol === 'cancelaciones') && (
              <button
                onClick={() => setActiveTab('cancelaciones')}
                className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-4 ${
                  activeTab === 'cancelaciones'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bell className="h-5 w-5" />
                Cancelaciones
                {tickets.filter(t => t.statusCancelaciones === 'pendiente por atender').length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {tickets.filter(t => t.statusCancelaciones === 'pendiente por atender').length}
                  </span>
                )}
              </button>
            )}
            
            {usuarioLogueado.rol === 'admin' && (
              <button
                onClick={() => setActiveTab('reportes')}
                className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-4 ${
                  activeTab === 'reportes'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                Reportes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* PESTAÑA: REGISTRO DE TICKETS */}
        {activeTab === 'registro' && (
          <div className="space-y-6">
            {/* Formulario de registro */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Panel izquierdo */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-orange-500" />
                  Cancelado
                </h2>

                {!imagePreview ? (
                  <label className="block border-4 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all">
                    <FileImage className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Click para seleccionar imagen</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                ) : (
                  <div>
                    <img src={imagePreview} alt="Ticket" className="w-full rounded-lg shadow-lg mb-4" />
                    <div className="flex gap-2">
                      <button
                        onClick={extractData}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <><Loader2 className="h-5 w-5 animate-spin" />Extrayendo...</> : 'Extraer Datos'}
                      </button>
                      <button
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                          setExtractedData(null);
                        }}
                        className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                )}

                {/* Sustituye - solo para cancelado de báscula */}
                {extractedData?.status === 'cancelado de bascula' && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-blue-700">
                      <FileImage className="h-4 w-4" />
                      Sustituye (Opcional)
                    </h3>
                    {!imagenSustituyePreview ? (
                      <label className="block border-3 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <FileImage className="h-10 w-10 mx-auto text-blue-400 mb-2" />
                        <p className="text-blue-600 text-sm font-medium">Subir imagen sustituye</p>
                        <input type="file" accept="image/*" onChange={handleImagenSustituye} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={imagenSustituyePreview} alt="Sustituye" className="w-full rounded-lg shadow-lg" />
                        <button
                          onClick={() => {
                            setImagenSustituye(null);
                            setImagenSustituyePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Evidencia - para cancelado de báscula O cancelado de caja */}
                {(extractedData?.status === 'cancelado de bascula' || extractedData?.status === 'cancelado de caja') && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-purple-700">
                      <FileImage className="h-4 w-4" />
                      Evidencia (Opcional)
                    </h3>
                    {!imagenEvidenciaPreview ? (
                      <label className="block border-3 border-dashed border-purple-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                        <FileImage className="h-10 w-10 mx-auto text-purple-400 mb-2" />
                        <p className="text-purple-600 text-sm font-medium">Subir imagen evidencia</p>
                        <input type="file" accept="image/*" onChange={handleImagenEvidencia} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={imagenEvidenciaPreview} alt="Evidencia" className="w-full rounded-lg shadow-lg" />
                        <button
                          onClick={() => {
                            setImagenEvidencia(null);
                            setImagenEvidenciaPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Panel derecho */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tienda</label>
                    <select 
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                      value={extractedData?.tienda || ''}
                      onChange={(e) => setExtractedData({...extractedData, tienda: e.target.value})}
                      disabled={usuarioLogueado.rol === 'tienda'}
                    >
                      <option value="">Seleccionar...</option>
                      {TIENDAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select 
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                      value={extractedData?.status || ''}
                      onChange={(e) => setExtractedData({...extractedData, status: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="cancelado de bascula">Cancelado de báscula</option>
                      <option value="cancelado de caja">Cancelado de caja</option>
                      <option value="pedido">Pedido</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Motivo</label>
                  <textarea
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Escribe el motivo..."
                    value={extractedData?.motivo || ''}
                    onChange={(e) => setExtractedData({...extractedData, motivo: e.target.value})}
                  />
                </div>

                <h3 className="text-lg font-bold mb-3">📋 Datos Extraídos</h3>

                {!extractedData && !loading && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Los datos aparecerán aquí</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                  </div>
                )}

                {extractedData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">TN:</span>
                        <span className="font-bold ml-2">{extractedData.tn}</span>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">Fecha:</span>
                        <span className="font-bold ml-2">{extractedData.fecha}</span>
                      </div>
                    </div>

                    {extractedData.items && extractedData.items.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">Artículos ({extractedData.items.length})</p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {extractedData.items.map((item, i) => (
                            <div key={i} className="p-2 bg-gray-50 rounded text-xs">
                              <p className="font-semibold">{item.descripcion}</p>
                              <p className="text-gray-600">{item.cantidad} × ${item.total}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white">
                      <p className="text-sm font-semibold uppercase">Total</p>
                      <p className="text-3xl font-bold">${extractedData.total}</p>
                    </div>

                    <button
                      onClick={enviarTicket}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Enviar por WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de tickets registrados */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4">📊 Tickets Registrados</h2>
              
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>No hay tickets registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">TN</th>
                        <th className="px-4 py-3 text-left font-semibold">Tienda</th>
                        <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                        <th className="px-4 py-3 text-left font-semibold">Total</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-left font-semibold">Atendido Cancelaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets
                        .filter(t => usuarioLogueado.rol === 'tienda' ? t.tienda === usuarioLogueado.tienda : true)
                        .map((ticket) => (
                        <tr key={ticket.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono font-semibold">{ticket.tn}</td>
                          <td className="px-4 py-3">{ticket.tienda}</td>
                          <td className="px-4 py-3">{ticket.fecha}</td>
                          <td className="px-4 py-3 font-semibold">${ticket.total}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 w-fit ${getStatusColor(ticket.statusCancelaciones)}`}>
                                {getStatusIcon(ticket.statusCancelaciones)}
                                {ticket.statusCancelaciones}
                              </span>
                              
                              {ticket.folioCancelacion && (
                                <div className="text-xs font-mono font-bold text-orange-600">
                                  🆔 {ticket.folioCancelacion}
                                </div>
                              )}
                              
                              {ticket.evidenciaCancelacion && (
                                <div 
                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setModalImage({ src: ticket.evidenciaCancelacion, title: 'Evidencia Cancelaciones' })}
                                >
                                  <img 
                                    src={ticket.evidenciaCancelacion} 
                                    alt="Evidencia" 
                                    className="w-16 h-16 object-cover rounded border-2 border-green-400"
                                  />
                                  <span className="text-xs text-green-600">📸 Ver evidencia</span>
                                </div>
                              )}
                              
                              {ticket.mensaje && (
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {ticket.mensaje}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: CANCELACIONES */}
        {activeTab === 'cancelaciones' && (
          <div className="space-y-6">
            {/* Selector de tienda */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Seleccionar Tienda</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {TIENDAS.map(tienda => {
                  const ticketsTienda = tickets.filter(t => t.tienda === tienda);
                  const pendientes = ticketsTienda.filter(t => t.statusCancelaciones === 'pendiente por atender').length;
                  
                  return (
                    <button
                      key={tienda}
                      onClick={() => setSelectedTienda(tienda)}
                      className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all relative ${
                        selectedTienda === tienda
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {tienda}
                      {pendientes > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                          {pendientes}
                        </span>
                      )}
                      {ticketsTienda.length > 0 && pendientes === 0 && (
                        <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {ticketsTienda.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tickets de la tienda seleccionada */}
            {selectedTienda && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-4">🏪 {selectedTienda}</h2>
                
                {tickets.filter(t => t.tienda === selectedTienda).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>No hay tickets para esta tienda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tickets.filter(t => t.tienda === selectedTienda).map(ticket => (
                      <div key={ticket.id} className="border-2 rounded-xl p-4 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-lg">TN: {ticket.tn}</p>
                            <p className="text-sm text-gray-600">{ticket.fecha} • {ticket.hora}</p>
                            {ticket.folioCancelacion && (
                              <p className="text-sm font-mono font-bold text-orange-600 mt-1">
                                🆔 Folio: {ticket.folioCancelacion}
                              </p>
                            )}
                            {ticket.status && (
                              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-300 font-semibold">
                                📋 {ticket.status}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">${ticket.total}</p>
                            <p className="text-xs text-gray-500">Registrado: {ticket.fechaRegistro}</p>
                          </div>
                        </div>

                        {ticket.motivo && (
                          <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-xs font-semibold text-yellow-700 mb-1">Motivo:</p>
                            <p className="text-sm">{ticket.motivo}</p>
                          </div>
                        )}

                        {/* Imágenes enviadas */}
                        <div className="mb-3 grid grid-cols-3 gap-2">
                          {ticket.imagenCancelado && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">📄 Cancelado</p>
                              <img 
                                src={ticket.imagenCancelado} 
                                alt="Cancelado" 
                                className="w-full h-32 object-cover rounded-lg border-2 border-orange-300 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setModalImage({ src: ticket.imagenCancelado, title: 'Cancelado' })}
                              />
                            </div>
                          )}
                          {ticket.imagenSustituye && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">🔄 Sustituye</p>
                              <img 
                                src={ticket.imagenSustituye} 
                                alt="Sustituye" 
                                className="w-full h-32 object-cover rounded-lg border-2 border-blue-300 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setModalImage({ src: ticket.imagenSustituye, title: 'Sustituye' })}
                              />
                            </div>
                          )}
                          {ticket.imagenEvidencia && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 mb-1">📸 Evidencia</p>
                              <img 
                                src={ticket.imagenEvidencia} 
                                alt="Evidencia" 
                                className="w-full h-32 object-cover rounded-lg border-2 border-purple-300 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setModalImage({ src: ticket.imagenEvidencia, title: 'Evidencia' })}
                              />
                            </div>
                          )}
                        </div>

                        {/* Evidencia de cancelaciones (si existe) */}
                        {ticket.evidenciaCancelacion && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">✅ Evidencia Cancelaciones</p>
                            <img 
                              src={ticket.evidenciaCancelacion} 
                              alt="Evidencia Cancelaciones" 
                              className="w-full max-w-xs rounded-lg border-2 border-green-400 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setModalImage({ src: ticket.evidenciaCancelacion, title: 'Evidencia Cancelaciones' })}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-gray-700">Status Cancelaciones:</label>
                          <select
                            value={ticket.statusCancelaciones}
                            onChange={(e) => actualizarStatusCancelaciones(ticket.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg border-2 font-semibold text-sm ${getStatusColor(ticket.statusCancelaciones)}`}
                          >
                            <option value="pendiente por atender">Pendiente por atender</option>
                            <option value="en seguimiento">En seguimiento</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>

                        {ticket.mensaje && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-sm font-medium text-green-700">{ticket.mensaje}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: REPORTES */}
        {activeTab === 'reportes' && usuarioLogueado.rol === 'admin' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-orange-500" />
                Filtros de Búsqueda
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tienda</label>
                  <select
                    value={filtroTienda}
                    onChange={(e) => setFiltroTienda(e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Todas</option>
                    {TIENDAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Folio</label>
                  <input
                    type="text"
                    value={filtroFolio}
                    onChange={(e) => setFiltroFolio(e.target.value)}
                    placeholder="FC-XXXXXXXX"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={() => {
                  setFiltroFechaInicio('');
                  setFiltroFechaFin('');
                  setFiltroTienda('');
                  setFiltroFolio('');
                }}
                className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-sm"
              >
                Limpiar Filtros
              </button>
            </div>

            {(() => {
              // Filtrar tickets
              let ticketsFiltrados = tickets.filter(t => {
                let cumpleFiltros = true;
                
                if (filtroTienda && t.tienda !== filtroTienda) cumpleFiltros = false;
                if (filtroFolio && !t.folioCancelacion?.includes(filtroFolio)) cumpleFiltros = false;
                
                if (filtroFechaInicio || filtroFechaFin) {
                  const fechaTicket = new Date(t.fechaRegistro);
                  if (filtroFechaInicio && fechaTicket < new Date(filtroFechaInicio)) cumpleFiltros = false;
                  if (filtroFechaFin && fechaTicket > new Date(filtroFechaFin + ' 23:59:59')) cumpleFiltros = false;
                }
                
                return cumpleFiltros;
              });

              // Calcular estadísticas
              const canceladosPorTienda = TIENDAS.map(tienda => ({
                tienda,
                cantidad: ticketsFiltrados.filter(t => t.tienda === tienda && t.statusCancelaciones === 'cancelado').length,
                monto: ticketsFiltrados
                  .filter(t => t.tienda === tienda && t.statusCancelaciones === 'cancelado')
                  .reduce((sum, t) => sum + parseFloat(t.total || 0), 0)
              })).filter(d => d.cantidad > 0);

              const canceladosPorTipo = [
                {
                  tipo: 'Cancelado de Báscula',
                  cantidad: ticketsFiltrados.filter(t => t.status === 'cancelado de bascula' && t.statusCancelaciones === 'cancelado').length
                },
                {
                  tipo: 'Cancelado de Caja',
                  cantidad: ticketsFiltrados.filter(t => t.status === 'cancelado de caja' && t.statusCancelaciones === 'cancelado').length
                }
              ];

              const vendedores = {};
              ticketsFiltrados.forEach(t => {
                if (t.vendedor && t.statusCancelaciones === 'cancelado') {
                  vendedores[t.vendedor] = (vendedores[t.vendedor] || 0) + 1;
                }
              });
              
              const canceladosPorVendedor = Object.entries(vendedores)
                .map(([vendedor, cantidad]) => ({ vendedor, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad)
                .slice(0, 10);

              return (
                <>
                  {/* Resumen ejecutivo */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Tickets</p>
                      <p className="text-5xl font-bold mt-3">{ticketsFiltrados.length}</p>
                      <p className="text-xs mt-2 opacity-70">Registros en el periodo</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-600 to-red-800 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Cancelados</p>
                      <p className="text-5xl font-bold mt-3">
                        {ticketsFiltrados.filter(t => t.statusCancelaciones === 'cancelado').length}
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        {ticketsFiltrados.length > 0 
                          ? `${((ticketsFiltrados.filter(t => t.statusCancelaciones === 'cancelado').length / ticketsFiltrados.length) * 100).toFixed(1)}% del total`
                          : '0% del total'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">En Seguimiento</p>
                      <p className="text-5xl font-bold mt-3">
                        {ticketsFiltrados.filter(t => t.statusCancelaciones === 'en seguimiento').length}
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        {ticketsFiltrados.length > 0 
                          ? `${((ticketsFiltrados.filter(t => t.statusCancelaciones === 'en seguimiento').length / ticketsFiltrados.length) * 100).toFixed(1)}% del total`
                          : '0% del total'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Monto Cancelado</p>
                      <p className="text-4xl font-bold mt-3">
                        ${ticketsFiltrados
                          .filter(t => t.statusCancelaciones === 'cancelado')
                          .reduce((sum, t) => sum + parseFloat(t.total || 0), 0)
                          .toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs mt-2 opacity-70">MXN</p>
                    </div>
                  </div>

                  {/* REPORTE 1: Número de Cancelados por Tienda */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">1. Número de Cancelados por Tienda</h3>
                        <p className="text-sm text-gray-500 mt-1">Cantidad de tickets cancelados por sucursal</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={canceladosPorTienda} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <defs>
                          <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="tienda" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                        />
                        <YAxis 
                          tick={{ fill: '#374151', fontSize: 12 }}
                          label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', style: { fill: '#374151', fontWeight: 600 } }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                        />
                        <Bar 
                          dataKey="cantidad" 
                          fill="url(#colorCantidad)" 
                          name="Cantidad de Cancelados" 
                          radius={[8, 8, 0, 0]}
                          label={{ position: 'top', fill: '#374151', fontSize: 12, fontWeight: 600 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* REPORTE 2: Monto de Cancelados por Tienda */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">2. Monto de Cancelados por Tienda</h3>
                        <p className="text-sm text-gray-500 mt-1">Total en pesos de tickets cancelados</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={canceladosPorTienda} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <defs>
                          <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#047857" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="tienda" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                        />
                        <YAxis 
                          tick={{ fill: '#374151', fontSize: 12 }}
                          label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft', style: { fill: '#374151', fontWeight: 600 } }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                          formatter={(value) => [`$${parseFloat(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Monto']}
                        />
                        <Bar 
                          dataKey="monto" 
                          fill="url(#colorMonto)" 
                          name="Monto Cancelado ($)" 
                          radius={[8, 8, 0, 0]}
                          label={{ 
                            position: 'top', 
                            fill: '#374151', 
                            fontSize: 11, 
                            fontWeight: 600,
                            formatter: (value) => `$${parseFloat(value).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* REPORTE 3 y 4: Cantidad de Cancelados de Báscula y Caja */}
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">3 y 4. Cancelados por Tipo (Báscula vs Caja)</h3>
                        <p className="text-sm text-gray-500 mt-1">Comparativa de origen de cancelaciones</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-gray-700">Cancelado de Báscula</h4>
                          <span className="text-5xl">⚖️</span>
                        </div>
                        <p className="text-6xl font-bold text-blue-600 mb-2">{canceladosPorTipo[0].cantidad}</p>
                        <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">tickets cancelados</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-gray-700">Cancelado de Caja</h4>
                          <span className="text-5xl">💳</span>
                        </div>
                        <p className="text-6xl font-bold text-purple-600 mb-2">{canceladosPorTipo[1].cantidad}</p>
                        <p className="text-sm text-gray-600 uppercase tracking-wide font-semibold">tickets cancelados</p>
                      </div>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={canceladosPorTipo} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorTipo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="tipo" 
                          tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                        />
                        <YAxis 
                          tick={{ fill: '#374151', fontSize: 12 }}
                          label={{ value: 'Cantidad', angle: -90, position: 'insideLeft', style: { fill: '#374151', fontWeight: 600 } }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                        />
                        <Bar 
                          dataKey="cantidad" 
                          fill="url(#colorTipo)" 
                          name="Cantidad"
                          radius={[8, 8, 0, 0]}
                          label={{ position: 'top', fill: '#374151', fontSize: 14, fontWeight: 700 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* REPORTE 5: Cancelados por Vendedor */}
                  {canceladosPorVendedor.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">5. Cancelados por Vendedor</h3>
                          <p className="text-sm text-gray-500 mt-1">Top 10 vendedores con mayor cantidad de cancelaciones</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={450}>
                        <BarChart data={canceladosPorVendedor} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorVendedor" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#b91c1c" stopOpacity={0.7}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            type="number"
                            tick={{ fill: '#374151', fontSize: 12 }}
                            label={{ value: 'Cantidad de Cancelaciones', position: 'insideBottom', offset: -5, style: { fill: '#374151', fontWeight: 600 } }}
                          />
                          <YAxis 
                            dataKey="vendedor" 
                            type="category" 
                            width={110}
                            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '12px' }}
                          />
                          <Bar 
                            dataKey="cantidad" 
                            fill="url(#colorVendedor)" 
                            name="Cancelaciones"
                            radius={[0, 8, 8, 0]}
                            label={{ position: 'right', fill: '#374151', fontSize: 13, fontWeight: 700 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Modal de confirmación de cancelación */}
      {modalConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Confirmar Atención</h2>
              <p className="text-orange-100 mt-1">
                Status: {modalConfirmacion.nuevoStatus === 'cancelado' ? 'CANCELADO' : 'EN SEGUIMIENTO'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Datos del ticket */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">📋 Datos del Ticket</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">TN:</span> <span className="font-bold">{modalConfirmacion.ticket.tn}</span></div>
                  <div><span className="text-gray-600">Tienda:</span> <span className="font-bold">{modalConfirmacion.ticket.tienda}</span></div>
                  <div><span className="text-gray-600">Fecha:</span> {modalConfirmacion.ticket.fecha}</div>
                  <div><span className="text-gray-600">Total:</span> <span className="font-bold text-green-600">${modalConfirmacion.ticket.total}</span></div>
                </div>
              </div>

              {/* Subir evidencia */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📸 Evidencia de Cancelaciones {modalConfirmacion.requiereEvidencia && <span className="text-red-500">*</span>}
                </label>
                {!evidenciaTempPreview ? (
                  <label className="block border-3 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all">
                    <FileImage className="h-12 w-12 mx-auto text-orange-400 mb-2" />
                    <p className="text-orange-600 font-medium">Subir foto de evidencia</p>
                    {modalConfirmacion.requiereEvidencia && (
                      <p className="text-red-500 text-xs mt-1">Obligatorio</p>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEvidenciaTemp(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setEvidenciaTempPreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img src={evidenciaTempPreview} alt="Evidencia" className="w-full rounded-lg shadow-lg" />
                    <button
                      onClick={() => {
                        setEvidenciaTemp(null);
                        setEvidenciaTempPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setModalConfirmacion(null);
                    setEvidenciaTemp(null);
                    setEvidenciaTempPreview(null);
                    setDestinatarioWhatsApp('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCancelacion}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Confirmar y Enviar WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen en pantalla completa */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <p className="absolute -top-12 left-0 text-white text-lg font-semibold">
              {modalImage.title}
            </p>
            <img 
              src={modalImage.src} 
              alt={modalImage.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
