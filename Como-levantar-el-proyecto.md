# **Guía de Configuración del Proyecto**

## **Requisitos**
- Tener **Node.js 20+** instalado.  
- Tener **Docker Desktop** corriendo.  
- Tener **DBeaver** (para la base de datos PostgreSQL).  
- Archivos `.env` configurados tanto para **frontend** como para **backend**.  

---

## **Pasos**

---

## **1. Infraestructura (Docker)**
1. Ir a la carpeta de infraestructura:  
   - `cd infra`  
   - `cd docker`  
2. Levantar los servicios:  
   - `docker compose --env-file .env -f compose.dev.yml up -d`  
   -`docker compose --env-file .env -f minio.compose.yml  up -d`

En **DBeaver**, crear la base de datos con los siguientes valores:  
- **POSTGRES_USER** = `app_user`  
- **POSTGRES_PASSWORD** = `app_pass`  
- **POSTGRES_DB** = `learning_agent`  

---

## **2. Backend**
1. Ir a la carpeta backend:  
   - `cd backend`  
2. Instalar dependencias:  
   - `npm install`  
3. Generar Prisma:  
   - `prisma generate`  
   - Si no tienes Prisma global: `npm install -g prisma`  
4. Ejecutar migraciones:  
   - `npx prisma migrate dev`  
   - Solo desarrollo: `npx prisma migrate reset`  
   - En caso de error: `npx prisma db push`  
5. Ejecutar semillas iniciales (usuarios):  
   - `npm run seed`  
6. Levantar el backend en modo desarrollo:  
   - `npm run start:dev`  

---

## **3. Frontend (Client)**
1. Ir a la carpeta client:  
   - `cd client`  
2. Instalar dependencias:  
   - `npm install`  
3. Levantar el cliente en modo desarrollo:  
   - `npm run dev`  

---

## **Notas**
- Los archivos `.env` deben configurarse antes de levantar los servicios.  
- El backend y frontend usan la misma URL base en local: `http://localhost:3000`.  
- Si usas **Windows**, recuerda habilitar **WSL2** para que Docker funcione correctamente.  


