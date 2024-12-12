const http = require('http');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const url = require('url');
const { Console } = require('console');
const express = require('express');
const app = express();

const PORT = 3001;
const HOST = '0.0.0.0';



async function loadExcelData() {
    // const filePath = path.join('R:/TEMPORARIO', 'PLANILHA PRODUTOS ACABADOS 02-09-24.xlsx');
    const filePath = path.join('PRODUTO ACABADO.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    jsonData.shift();
    return jsonData;
}

async function PlotarTela() {
    const data = await loadExcelData();

    let tableContent = '';
    data.forEach(row => {
        tableContent += `
            <tr>
                <td>${row[0] || 'Sem Código'}</td>
                <td>${row[1] || 'Sem Nome'}</td>
                <td>${row[2] || 'Sem Estoque'}</td>
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
    <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>
    <style>
        :root {
            --cor_texto: #ffffff;
            --bg_cor: #e1e0ee;
            --card_cor: #06087A;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: var(--bg_cor);
            overflow-x: hidden;
            font-size: 0.8vw;
        }

        img{
            width: 7vw;
            margin-left: 1vw;
        }

        .container {
            margin: 2vw;
            padding: 1vw;
            background-color: white;
            border-radius: 0.5vw;
            box-shadow: 0px 3px 10px 2px #000000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table td {
            padding: 1vw;
            text-align: left;
            border: 1px solid #ccc;
            color: var(--card_cor);
            font-weight: bold;
        }

        table th {
            padding: 1vw;
            text-align: left;
            border: 1px solid #ccc;
            color: var(--cor_texto);
            font-weight: bold;
            background-color: var(--card_cor);
        }

        table tbody tr:nth-child(odd) {
            background-color: #f9f9f9;
        }

        table tbody tr:hover {
            background-color: #e1e0ee;
        }

        input {
            padding: 0.3vw;
            border-radius: 0.2vw;
            border: 1px solid #ccc;
        }

        .btns {
            display: flex;
            justify-content: space-between;
            margin-top: 1vw;
            margin-right: 2vw;
            gap: 2vw;
            align-items: center;
        }
        
        header {
            display: flex;
            justify-content: space-between;
            margin: 1vw 1vw;
            margin-right: 2vw;
            gap: 2vw;
            align-items: center;
        }

        .logo-class{
            display: flex;
            align-items: center;
        }

        h2{
            color: var(--card_cor);
            
        }

        #reload {
            background-color: var(--card_cor);
            color: var(--cor_texto);
            padding: 0.3vw 0.7vw;
            border: none;
            border-radius: 0.2vw;
        }



    </style>

</head>

<body>

    

    <header>

        <div class="logo-class">

            <img src="img/logo.png" alt="Favicon">

            <h2>Consulta de Estoque (EM TESTE)<h2>

        </div>


        <div class="btns">

    
            <input type="text" id="searchInput" placeholder="Buscar por nome..." />

            <button id="reload">Atualizar Carga</button>

        </div>


    </header>


    <div class="container">
        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome</th>
                    <th>Estoque</th>
                    <th>Observação</th>
                </tr>
            </thead>
            <tbody id="render-container">
                ${tableContent}
            </tbody>
        </table>
    </div>
    <script>
        let allData = ${JSON.stringify(await loadExcelData())};

        function renderData(data) {

            const renderContainer = document.getElementById("render-container");

            renderContainer.innerHTML = '';

            data.forEach(row => {

                const tableRow = document.createElement("tr");
                const tdCodigo = document.createElement("td");

                tdCodigo.textContent = row[0] || 'Sem Código';
                const tdNome = document.createElement("td");

                tdNome.textContent = row[1] || 'Sem Nome';
                const tdEstoque = document.createElement("td");

                tdEstoque.textContent = row[2] || '0';
                const obs = document.createElement("td");

                obs.textContent = row[4] || '';
                tableRow.appendChild(tdCodigo);

                tableRow.appendChild(tdNome);
                tableRow.appendChild(tdEstoque);
                tableRow.appendChild(obs);
                renderContainer.appendChild(tableRow);
            });
        }

        function filterData(searchText) {
            const filteredData = allData.filter(row => {
                return row[1] && row[1].toLowerCase().includes(searchText.toLowerCase());
            });
            renderData(filteredData);
        }

        document.getElementById('reload').addEventListener('click', function() {
            location.reload();
        });

        document.getElementById('searchInput').addEventListener('input', function() {
            const searchText = this.value.trim();
            if (searchText.length > 0) {
                filterData(searchText);
            } else {
                renderData(allData);
            }
        });

        window.onload = function() {
            renderData(allData);
        }
    </script>
</body>
</html>
    `;
}

const requestHandler = async (req, res) => {
    const parsedUrl = url.parse(req.url);
    if (parsedUrl.pathname.startsWith('/img/')) {
        const imgPath = path.join(__dirname, parsedUrl.pathname);
        fs.readFile(imgPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Imagem não encontrada');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(data);
        });
    } else {
        const htmlContent = await PlotarTela();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);

    }
};


app.listen(PORT, HOST, () => {
    console.log(`Server listening on port ${PORT}`);
});




const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
