document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM (igual que antes) ---
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorIndicator = document.getElementById('errorIndicator');
    const outputSection = document.querySelector('.output-section'); // Seleccionamos la sección entera

    // --- Lógica del botón Procesar ---
    processButton.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) {
            showError("Por favor, ingrese texto en el campo de hechos.");
            return;
        }

        // --- INICIO: Cambios al iniciar procesamiento ---
        loadingIndicator.style.display = 'block';
        errorIndicator.style.display = 'none'; // Ocultar error previo
        outputSection.style.display = 'none'; // Ocultar sección de resultado
        processButton.disabled = true;         // Deshabilitar botón Procesar
        downloadButton.disabled = true;        // Deshabilitar botón Descargar
        outputText.value = '';                 // Limpiar salida previa
        // --- FIN: Cambios al iniciar procesamiento ---

        try {
            const response = await fetch('/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text }),
            });

            const data = await response.json();

            if (!response.ok) {
                 throw new Error(data.error || `Error del servidor: ${response.status}`);
            }
            
            // --- INICIO: Cambios en caso de éxito ---
            outputText.value = data.result;
            outputSection.style.display = 'block'; // Mostrar sección de resultado
            downloadButton.disabled = false;        // Habilitar descarga SÓLO si hay resultado
            // --- FIN: Cambios en caso de éxito ---

        } catch (error) {
            console.error("Error al procesar:", error);
            showError(`Error: ${error.message}`);
            outputText.value = ''; // Asegurar que esté limpio en caso de error
            outputSection.style.display = 'none'; // Mantener oculta la sección si hay error
            downloadButton.disabled = true; // Asegurar que descarga esté deshabilitada
        } finally {
            // --- INICIO: Cambios al finalizar (siempre se ejecuta) ---
            loadingIndicator.style.display = 'none';
            processButton.disabled = false; // Habilitar botón Procesar nuevamente
            // La habilitación/deshabilitación del botón Descargar ya se manejó en try/catch
            // --- FIN: Cambios al finalizar ---
        }
    });

    // --- Lógica del botón Descargar ---
    downloadButton.addEventListener('click', async () => {
        const textToSave = outputText.value.trim();
        if (!textToSave) {
             // Esta comprobación es redundante si el botón está correctamente deshabilitado, pero no hace daño
            showError("No hay texto en el resultado para descargar.");
            return;
        }

        // --- INICIO: Cambios al iniciar descarga ---
        downloadButton.disabled = true; // Deshabilitar mientras se descarga
        errorIndicator.style.display = 'none'; 
        // Podrías añadir un indicador de "Descargando..." si quieres
        // --- FIN: Cambios al iniciar descarga ---

        try {
            const response = await fetch('/download_docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSave }),
            });

            if (!response.ok) {
                 let errorMsg = `Error del servidor: ${response.status}`;
                 try {
                     const errorData = await response.json();
                     errorMsg = errorData.error || errorMsg;
                 } catch(e) { /* Ignora si no es JSON */ }
                 throw new Error(errorMsg);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'hechos_reformulados.docx'; 
            document.body.appendChild(a);
            a.click(); 
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error("Error al descargar:", error);
            showError(`Error al descargar el archivo: ${error.message}`);
        } finally {
            // --- INICIO: Cambios al finalizar descarga ---
             // Habilitar botón de descarga SI TODAVÍA hay texto en el resultado
            downloadButton.disabled = !outputText.value.trim(); 
             // --- FIN: Cambios al finalizar descarga ---
        }
    });
    
    // --- Función para mostrar errores (igual que antes) ---
    function showError(message) {
         errorIndicator.textContent = message;
         errorIndicator.style.display = 'block';
         // Opcional: Ocultar mensaje de error después de unos segundos
         /* setTimeout(() => {
              errorIndicator.style.display = 'none';
          }, 5000); // Oculta después de 5 segundos */
    }

}); // Fin del DOMContentLoaded