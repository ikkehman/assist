# Instalation

Berikut cara instalasi aplikasi

1. Clone repository
```bash
git clone https://github.com/ikkehman/assist.git
```

2. Buka folder assist
```bash
cd assist
```

3. Install Dependencies
```bash
npm i
```

4. Start aplikasi
```bash
node .
```

# Usage

1. Melakukan absensi cuti

```
Endpoint: POST api/employee
```

Request body:
```
{
  "name": "Puan",
  "role": "ketua"
}
```
Response:
```
{
  "name": "Puan",
  "role": "ketua",
  "id": "6432931e28d5bd136a8222a1"
}
```


2. Absensi hadir

```
Endpoint: POST api/Absensis
```

Request body:
```
{
  "employeeId": "6432931e28d5bd136a8222a1",
  "type": "hadir"
}
```

Response jika sebelum pukul 08:00 :
```
{
  "date": "2023-04-09T07:32:39.448Z",
  "type": "hadir",
  "status": "butuh konfirmasi",
  "id": "6432e3bb9eeb4cdbdb4a4c8d",
  "employeeId": "6432931e28d5bd136a8222a1"
}
```

Response jika melewati pukul 08:00 :
```
{
  "date": "2023-04-09T16:11:39.298Z",
  "type": "telat",
  "status": "butuh konfirmasi",
  "id": "6432e3bb9eeb4cdbdb4a4c8d",
  "employeeId": "6432931e28d5bd136a8222a1"
}
```

3. Melakukan absensi cuti

```
Endpoint: POST api/Absensis
```

Request body:
```
{
  "type": "cuti",
  "reason": "Cuti ikut pemilu",
  "employeeId": "6432931e28d5bd136a8222a1"
}
```
Response:
```
{
  "date": "2023-04-09T16:14:32.763Z",
  "type": "cuti",
  "status": "pending",
  "reason": "Cuti ikut pemilu",
  "id": "6432e4689eeb4cdbdb4a4c8e",
  "employeeId": "6432931e28d5bd136a8222a1"
}
```

4. Menyetujui absensi cuti

```
Endpoint: POST api/Absensis/:id/approve
```

Request url:
```
http://localhost:3000/api/Absensis/6432e4689eeb4cdbdb4a4c8e/approve
```

Response:
```
{
  "date": "2023-04-09T16:14:32.763Z",
  "type": "cuti",
  "status": "approved",
  "reason": "Cuti ikut pemilu",
  "id": "6432e4689eeb4cdbdb4a4c8e",
  "employeeId": "6432931e28d5bd136a8222a1"
}
```

5. Menolak absensi cuti

```
Endpoint: POST api/Absensis/:id/reject
```

Request url:
```
http://localhost:3000/api/Absensis/6432e4689eeb4cdbdb4a4c8e/approve
```

Response:
```
{
  "date": "2023-04-09T16:14:32.763Z",
  "type": "cuti",
  "status": "rejected",
  "reason": "Cuti ikut pemilu",
  "id": "6432e4689eeb4cdbdb4a4c8e",
  "employeeId": "6432931e28d5bd136a8222a1"
}
```

6. Melihat laporan absensi hadir, cuti, izin, sakit, approve cuti/izin, reject cuti/izin

```
Endpoint: GET api/Absensis/:employeeId/report?month=:month
```

Parameter:
```
id : 6432931e28d5bd136a8222a1
month : 2023-04-01
```

Request url:
```
http://localhost:3000/api/Absensis/6432931e28d5bd136a8222a1/report?month=2023-04-01
```
Response:
```
{
  "employeeId": "6432931e28d5bd136a8222a1",
  "month": "2023-04-01T00:00:00.000Z",
  "hadir": 0,
  "telat": 2,
  "sakit": 0,
  "approvedIzinCutiCount": 1,
  "rejectedIzinCutiCount": 0
}
```
