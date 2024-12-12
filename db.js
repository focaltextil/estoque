const express = require('express');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos
app.use('/img', express.static(path.join(__dirname, 'img')));

// Função para carregar os dados do Excel
async function loadExcelData() {
    const filePath = path.join(__dirname, 'PRODUTO ACABADO.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    jsonData.shift(); // Remove cabeçalho, se necessário
    return jsonData;
}

// Geração da página HTML
async function generateHTML() {
    const data = await loadExcelData();

    let tableContent = '';
    data.forEach(row => {
        tableContent += `
            <tr>
                <td>${row[0] || 'Sem Código'}</td>
                <td>${row[1] || 'Sem Nome'}</td>
                <td>${row[2] || 'Sem Estoque'}</td>
                <td>${row[4] || ''}</td>
            </tr>
        `;
    });

    return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estoque PA</title>
        <style>
            /* CSS simplificado */
            body {
                font-family: Arial, sans-serif;
                background-color: #e1e0ee;
                margin: 0;
                padding: 0;
            }
            .container {
                padding: 20px;
                margin: auto;
                max-width: 800px;
                background: #fff;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
            }
            th {
                background: #06087A;
                color: #fff;
            }
            tr:nth-child(odd) {
                background: #f9f9f9;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Consulta de Estoque</h1>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Estoque</th>
                        <th>Observação</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableContent}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
}

// Rota principal
app.get('/', async (req, res) => {
    const htmlContent = await generateHTML();
    res.send(htmlContent);
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
