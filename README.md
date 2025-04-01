## mapaZzz

MapaZzz é um desavio de um hackathon na 42Luanda, que tem como objectivo ajudar por meio da tecnologia ajudar a prevenção do surto de malária a nível de Angola e do mundo

**URL_BASE**: `http://localhost:3000/api/`
## Endpoints para criar um usuário

### Criar Usuário

**URL:** `/users/create`  
**Método:** POST  
**Descrição:** Cria um novo usuário.  

**Body:**
```json
{
  "name": "Nome do utilizador",
  "phone": "Número de telefone",
  "password" : "Senha do usuário",
  "address" : "endereço do usuário"
}
```
**Resposta de Sucesso:**
```json
{
  "message" : "Usuário cadastrado com sucesso",
  "data": { ... }
}
```

### Registar uma zona de perigo

**URL:** `/danger_zone/register`  
**Método:** POST  
**Descrição:** Registar novo lugar.  

**Body:**
```json
{
  "lat" : "...",
  "lon" : "...",
  "image" : "caminho para a imagem"
}
```
**Resposta de Sucesso:**
```json
{
  "message" : "Zona registarda com sucesso com sucesso",
  "zone": { ... }
}
```

### Confirmar se uma zona é realmente uma zona de perigo

**URL:** `/danger_zone/report`  
**Método:** POST  
**Descrição:** Confirmar a zona.  

**Body:**
```json
{
  "status" : "..." // ["yes", "no", "no_yet"]
}
```
**Resposta de Sucesso:**
```json
{
  "message" : "...",
}
```

### Pegar uma zona de perigo por cada vez, para poder dizer se ela realmente é uma zona de perigo

**URL:** `/danger_zone/getZoneRandom`  
**Método:** GET  
**Descrição:** Pegar cada zona de cada vez.  

**Body:**
```json
{
  // Sem body
}
```
**Resposta de Sucesso:**
```json
{
  "message" : "...",
  "dangerZone" : {...}
}
```
