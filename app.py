import os
import google.generativeai as genai
from flask import Flask, request, jsonify, render_template, send_file
from docx import Document
from docx.shared import Inches # Para márgenes u otras configuraciones si quieres
from docx.enum.text import WD_ALIGN_PARAGRAPH
from dotenv import load_dotenv
import io # Para manejar el archivo en memoria

# Cargar variables de entorno
load_dotenv()

# Configurar Flask App
app = Flask(__name__)

# Configuración de la API de Gemini (igual que antes)
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    generation_config = {
        "temperature": 1.2, # Considera si esta T° tan alta es ideal para hechos legales (podría ser muy creativo)
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro-latest", # Usar el modelo más reciente si está disponible
        generation_config=generation_config,
    )
except KeyError:
    print("ERROR: GEMINI_API_KEY no encontrada en .env")
    # Podrías manejar esto más elegantemente, quizás desactivando la funcionalidad
    model = None 
except Exception as e:
    print(f"Error configurando Gemini: {e}")
    model = None

# --- Tu lógica de procesamiento ---
def procesar_texto_ia(input_text):
    if not model:
        return "Error: El modelo de IA no está configurado correctamente."
    
    # Cargar la plantilla del prompt desde la variable de entorno
    prompt_template = os.environ.get("REFORMULADOR_PROMPT")

    if not prompt_template:
        print("ERROR: Variable de entorno REFORMULADOR_PROMPT no encontrada.")
        return "Error de configuración: Falta la plantilla del prompt."
    
    try:
        # Tu prompt exacto aquí
        # Formatear el prompt final inyectando el input_text
        # Usaremos .format() aquí porque el prompt ya tiene llaves {}
        final_prompt = prompt_template.format(input_text=input_text) 
        
        response = model.generate_content(final_prompt)
        # Pequeña validación/limpieza básica (opcional)
        processed_text = response.text.strip()
        return processed_text
    
    except KeyError as e:
        print(f"Error formateando el prompt: Falta la clave {e}")
        return f"Error de configuración: Problema al formatear el prompt ({e})."
    
    except Exception as e:
        # Loguear el error real para ti sería bueno aquí
        print(f"Error en API Gemini: {e}") 
        return f"Error al procesar con la IA: {e}"

# --- Rutas de la Aplicación Web ---

@app.route('/')
def index():
    """ Sirve la página principal HTML """
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def handle_process():
    """ Recibe texto vía POST, lo procesa con IA y devuelve JSON """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
        
    data = request.get_json()
    input_text = data.get('text', '')

    if not input_text:
        return jsonify({"error": "No text provided"}), 400

    processed_text = procesar_texto_ia(input_text)
    
    # Verificar si hubo un error durante el procesamiento
    if "Error:" in processed_text:
        return jsonify({"error": processed_text}), 500 # Internal Server Error

    return jsonify({"result": processed_text})

@app.route('/download_docx', methods=['POST'])
def download_docx():
    """ Recibe texto vía POST y devuelve un archivo .docx para descargar """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
        
    data = request.get_json()
    text_to_save = data.get('text', '')

    if not text_to_save:
        return jsonify({"error": "No text provided for document"}), 400

    try:
        # Crear documento en memoria
        document = Document()
        document.add_heading('Hechos Reformulados', level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Añadir párrafos (maneja saltos de línea)
        for paragraph_text in text_to_save.split('\n'):
             p = document.add_paragraph(paragraph_text.strip())
             p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT # O JUSTIFY si prefieres
             # Podrías añadir más formato aquí (espaciado, etc.)

        # Guardar en un buffer de BytesIO
        file_stream = io.BytesIO()
        document.save(file_stream)
        file_stream.seek(0) # Volver al inicio del stream

        return send_file(
            file_stream,
            as_attachment=True,
            download_name='hechos_reformulados.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        print(f"Error creando DOCX: {e}")
        return jsonify({"error": f"No se pudo generar el archivo Word: {e}"}), 500

# --- Ejecución ---
if __name__ == '__main__':
    # Debug=True es útil para desarrollo, ¡quítalo para producción!
    # host='0.0.0.0' permite acceso desde otros dispositivos en tu red local
    app.run(debug=True, host='0.0.0.0', port=5000) 