"use client";
import React from "react";

function MainComponent() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [businessInfo, setBusinessInfo] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSetupBot = async () => {
    if (!businessInfo.telegramBotToken) {
      setError("Por favor ingresa el token del bot");
      return;
    }

    try {
      setError(null);
      setSuccess(false);

      const saveResponse = await fetch("/api/save-encrypted-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: businessInfo.telegramBotToken,
          adminPassword,
        }),
      });

      const saveData = await saveResponse.json();
      if (!saveData.success) {
        throw new Error(saveData.error || "Error al guardar el token");
      }

      const webhookResponse = await fetch("/api/setup-telegram-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: businessInfo.telegramBotToken,
        }),
      });

      const webhookData = await webhookResponse.json();
      if (webhookData.success) {
        setSuccess(
          `Bot configurado correctamente en: ${webhookData.webhookUrl}`
        );
        setBusinessInfo((prev) => ({ ...prev, telegramBotToken: "" }));
      } else {
        if (webhookData.error.includes("Failed to resolve host")) {
          setError(
            "Error: La URL del webhook no es accesible. Asegúrate de que la aplicación esté desplegada y sea accesible públicamente."
          );
        } else if (webhookData.error.includes("Token de Telegram inválido")) {
          setError(
            "Error: El token del bot no es válido. Por favor verifica el token con @BotFather."
          );
        } else {
          throw new Error(
            webhookData.error || "Error al configurar el webhook"
          );
        }
      }
    } catch (err) {
      setError(err.message || "Error al configurar el bot");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Configuración del Bot de Telegram
          </h2>

          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2"
                  placeholder="Ingresa la contraseña de administrador"
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/verify-admin-password", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ password: adminPassword }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      setIsAuthenticated(true);
                      setError(null);
                    } else {
                      setError("Contraseña incorrecta");
                    }
                  } catch (err) {
                    setError("Error al verificar la contraseña");
                  }
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Iniciar Sesión
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div
                  className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg relative"
                  role="alert"
                >
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                  <button
                    className="absolute top-2 right-2 text-red-700"
                    onClick={() => setError(null)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {success && (
                <div
                  className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg relative"
                  role="alert"
                >
                  <strong className="font-bold">¡Éxito! </strong>
                  <span className="block sm:inline">
                    Bot configurado correctamente
                  </span>
                  <button
                    className="absolute top-2 right-2 text-green-700"
                    onClick={() => setSuccess(false)}
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Token del Bot de Telegram
                  </label>
                  <input
                    type="password"
                    name="telegramBotToken"
                    value={businessInfo.telegramBotToken || ""}
                    onChange={handleInputChange}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2"
                    placeholder="Ingresa el token de tu bot"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Obtén este token de @BotFather en Telegram
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSetupBot}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200 disabled:bg-blue-300"
                  disabled={!businessInfo.telegramBotToken}
                >
                  Configurar Bot de Telegram
                </button>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h3 className="font-bold text-blue-800 dark:text-blue-200">
                    Importante:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2">
                    <li>
                      Tu aplicación debe estar desplegada y ser accesible
                      públicamente
                    </li>
                    <li>
                      El token debe ser obtenido de @BotFather en Telegram
                    </li>
                    <li>
                      Asegúrate de que el token sea válido y esté completo
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setAdminPassword("");
                  setBusinessInfo({});
                }}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;