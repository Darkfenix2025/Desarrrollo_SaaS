document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyBk9eZlFBzcDnHyQH8t03npWWwEozU_vgE",
        authDomain: "aplicacion-saas.firebaseapp.com",
        projectId: "aplicacion-saas",
        storageBucket: "aplicacion-saas.firebasestorage.app",
        messagingSenderId: "184412972253",
        appId: "1:184412972253:web:aa17067cdf51daad96e734",
        measurementId: "G-NSBKFF7NMM"
    };
      // ==== INICIALIZAR FIREBASE ====
    try {
        // Usamos 'compat' para compatibilidad con el SDK v8 que es más simple a veces
        firebase.initializeApp(firebaseConfig); 
        console.log("Firebase inicializado correctamente.");
        // firebase.getAnalytics(app);
        // console.log("Analitics inicializado correctamente.");
    } catch (error) {
        console.error("Error inicializando Firebase:", error);
        // Mostrar error al usuario si la inicialización falla
        document.body.innerHTML = "<h1>Error crítico: No se pudo inicializar la autenticación. Por favor, contacta al administrador.</h1>";
        return; // Detener la ejecución del script si Firebase no inicia
    }
    
    const auth = firebase.auth(); // Objeto para manejar autenticación
    // --- Elementos del DOM (igual que antes) ---
    // ==== REFERENCIAS A ELEMENTOS DEL DOM ====
    // --- Contenedores ---
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    // --- Formularios Auth ---
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    // --- Inputs Login ---
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    // --- Inputs Signup ---
    const signupEmailInput = document.getElementById('signupEmail');
    const signupPasswordInput = document.getElementById('signupPassword');
    // --- Botones Auth ---
    const loginButton = document.getElementById('loginButton');
    const signupButton = document.getElementById('signupButton');
    const logoutButton = document.getElementById('logoutButton');
    // --- Enlaces Navegación Auth ---
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    // --- Info Usuario ---
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    // --- Mensajes Error Auth ---
    const loginErrorDiv = document.getElementById('loginError');
    const signupErrorDiv = document.getElementById('signupError');
    // --- Elementos App Principal (ya los tenías) ---
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processButton = document.getElementById('processButton');
    const downloadButton = document.getElementById('downloadButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorIndicator = document.getElementById('errorIndicator'); // Usaremos este también para errores de la app
    const outputSection = document.querySelector('.output-section');

    // ==== MANEJO DE ESTADO DE AUTENTICACIÓN (onAuthStateChanged) ====
    // Esta función se ejecuta automáticamente cuando el usuario inicia sesión,
    // cierra sesión, o cuando se carga la página por primera vez.
    auth.onAuthStateChanged(user => {
        if (user) {
            // --- Usuario está logueado ---
            console.log("Usuario logueado:", user.email);
            authContainer.style.display = 'none';   // Ocultar sección de login/signup
            appContainer.style.display = 'block';   // Mostrar sección de la app
            userEmailDisplay.textContent = `Usuario: ${user.email}`; // Mostrar email
            // Limpiar campos e indicadores de la app por si acaso
            inputText.value = '';
            outputText.value = '';
            outputSection.style.display = 'none';
            downloadButton.disabled = true;
            errorIndicator.textContent = '';
            errorIndicator.style.display = 'none';
        } else {
            // --- Usuario NO está logueado ---
            console.log("Usuario deslogueado.");
            authContainer.style.display = 'block';  // Mostrar sección de login/signup
            appContainer.style.display = 'none';    // Ocultar sección de la app
            userEmailDisplay.textContent = '';      // Limpiar display de email
             // Limpiar formularios de autenticación y errores
            loginEmailInput.value = '';
            loginPasswordInput.value = '';
            signupEmailInput.value = '';
            signupPasswordInput.value = '';
            loginErrorDiv.textContent = '';
            signupErrorDiv.textContent = '';
             // Asegurarse que se vea el formulario de login por defecto al desloguear
            loginForm.style.display = 'block'; 
            signupForm.style.display = 'none';
        }
    });
// ==== FUNCIONES DE AUTENTICACIÓN ====
    // --- Iniciar Sesión (Login) ---
    loginButton.addEventListener('click', async () => {
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        loginErrorDiv.textContent = ''; // Limpiar error previo

        try {
            console.log("Intentando iniciar sesión...");
            await auth.signInWithEmailAndPassword(email, password);
            console.log("Inicio de sesión exitoso");
            // onAuthStateChanged se encargará de actualizar la UI
        } catch (error) {
            console.error("Error en login:", error.code, error.message);
            loginErrorDiv.textContent = getAuthErrorMessage(error); // Mostrar error amigable
        }
    });

    // --- Registrarse (Signup) ---
    signupButton.addEventListener('click', async () => {
        const email = signupEmailInput.value;
        const password = signupPasswordInput.value;
        signupErrorDiv.textContent = ''; // Limpiar error previo

         // Validación básica de contraseña (opcional pero recomendada)
        if (password.length < 6) {
            signupErrorDiv.textContent = "La contraseña debe tener al menos 6 caracteres.";
            return;
        }

        try {
            console.log("Intentando registrar...");
            await auth.createUserWithEmailAndPassword(email, password);
            console.log("Registro exitoso");
            // onAuthStateChanged se encargará de actualizar la UI (logueará al nuevo usuario)
        } catch (error) {
            console.error("Error en signup:", error.code, error.message);
            signupErrorDiv.textContent = getAuthErrorMessage(error); // Mostrar error amigable
        }
    });

    // --- Cerrar Sesión (Logout) ---
    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            console.log("Cierre de sesión exitoso");
            // onAuthStateChanged se encargará de actualizar la UI
        } catch (error) {
            console.error("Error en logout:", error);
             // Podrías mostrar un error general si el logout falla
            errorIndicator.textContent = "Error al cerrar sesión.";
            errorIndicator.style.display = 'block';
        }
    });
    
    // --- Navegación entre formularios Login/Signup ---
    showSignupLink.addEventListener('click', (e) => {
         e.preventDefault(); // Evitar que el enlace '#' recargue la página
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
         loginErrorDiv.textContent = ''; // Limpiar errores al cambiar
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        signupErrorDiv.textContent = ''; // Limpiar errores al cambiar
    });

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
    // ==== FUNCIONES AUXILIARES ====
    
    // --- Mostrar Errores (General) ---
    function showError(message, element = errorIndicator) { // Permite elegir dónde mostrar el error
        element.textContent = message;
        element.style.display = 'block';
        // Opcional: ocultar después de un tiempo
    }
   
   // --- Interpretar Errores de Firebase Auth ---
    function getAuthErrorMessage(error) {
        switch (error.code) {
            case 'auth/invalid-email':
                return 'El formato del correo electrónico no es válido.';
            case 'auth/user-disabled':
                return 'Este usuario ha sido deshabilitado.';
            case 'auth/user-not-found':
                return 'No se encontró un usuario con este correo electrónico.';
            case 'auth/wrong-password':
                return 'La contraseña es incorrecta.';
            case 'auth/email-already-in-use':
                return 'Este correo electrónico ya está registrado.';
            case 'auth/weak-password':
                return 'La contraseña es demasiado débil (mínimo 6 caracteres).';
            case 'auth/operation-not-allowed':
                return 'El inicio de sesión con correo/contraseña no está habilitado.'; // Revisar config Firebase
            case 'auth/network-request-failed':
                return 'Error de red. Revisa tu conexión a internet.';
            default:
                return `Error desconocido (${error.code}): ${error.message}`;
        }
    }
}); // Fin del DOMContentLoaded