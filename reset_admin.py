from pymongo import MongoClient
from passlib.context import CryptContext

# 1. Conexión
client = MongoClient("mongodb://localhost:27017/")
db = client['social_alert_db']
collection = db.users

# 2. Configuración: USAMOS PBKDF2_SHA256 (Más compatible)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# 3. Borrar usuario anterior
collection.delete_many({"username": "admin"}) # Delete many por si hay duplicados

# 4. Crear nuevo usuario Admin
print("Generando nueva contraseña segura...")
admin_user = {
    "username": "admin",
    "hashed_password": get_password_hash("Csirt2026.")
}

collection.insert_one(admin_user)

print("✅ ÉXITO: Usuario 'admin' actualizado al nuevo sistema.")
print("👉 Usuario: admin")
print("👉 Clave:   Csirt2026.")
