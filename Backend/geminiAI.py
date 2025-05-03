import google.generativeai as genai

# 🔑 Reemplaza con tu API Key
API_KEY = "AIzaSyBiElZs-VDNaoZIJAdmdYcf-dN1p77uhoE"

genai.configure(api_key=API_KEY)

def test_gemini():
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        response = model.generate_content("Hola, ¿puedes confirmar que esta conexión funciona?")
        print("✅ Respuesta de Gemini:")
        print(response.text)
    except Exception as e:
        print("❌ Error al conectar con Gemini:", str(e))

if __name__ == "__main__":
    test_gemini()
