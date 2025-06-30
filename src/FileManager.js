// import React, { useEffect, useState } from 'react';

// const FileManager = ({ token }) => {
//   const [files, setFiles] = useState([]);
//   const [uploadFile, setUploadFile] = useState(null);

//   const API_BASE = 'https://bot.kediritechnopark.com/webhook/files';

//   // Ambil daftar file
//   const fetchFiles = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/list`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         }
//       });

//       const data = await response.json();
//       setFiles(data);
//     } catch (error) {
//       console.error('Gagal mengambil daftar file:', error);
//     }
//   };

//   // Hapus file
//   const deleteFile = async (key) => {
//     if (!window.confirm(`Yakin ingin hapus "${key}"?`)) return;
//     try {
//       await fetch(`${API_BASE}/delete`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({ key }),
//       });

//       fetchFiles();
//     } catch (error) {
//       console.error('Gagal menghapus file:', error);
//     }
//   };

//   // Upload file
//   const handleUpload = async () => {
//     if (!uploadFile) return;

//     const formData = new FormData();
//     formData.append('file', uploadFile);

//     try {
//       await fetch(`${API_BASE}/upload`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       setUploadFile(null);
//       fetchFiles();
//     } catch (error) {
//       console.error('Gagal mengunggah file:', error);
//     }
//   };

//   // Download file
//   const downloadFile = async (key) => {
//     try {
//       const response = await fetch(`${API_BASE}/download?key=${encodeURIComponent(key)}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) throw new Error('Download gagal');

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);

//       const a = document.createElement('a');
//       a.href = url;
//       a.download = key;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();

//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Gagal mengunduh file:', error);
//     }
//   };

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   return (
//     <div style={{ padding: 20, fontFamily: 'Arial' }}>
//       <h2>📁 Manajemen File</h2>

//       <ul>
//         {files.map(file => (
//           <li key={file.Key} style={{ marginBottom: 8 }}>
//             <strong>{file.Key}</strong>{' '}
//             <button onClick={() => downloadFile(file.Key)}>⬇️ Download</button>{' '}
//             <button onClick={() => deleteFile(file.Key)}>🗑️ Hapus</button>
//           </li>
//         ))}
//       </ul>

//       <hr />

//       <div>
//         <h3>📤 Upload File</h3>
//         <input
//           type="file"
//           onChange={e => setUploadFile(e.target.files[0])}
//         />
//         <button onClick={handleUpload} disabled={!uploadFile}>
//           Upload
//         </button>
//       </div>
//     </div>
//   );
// };

// export default FileManager;
