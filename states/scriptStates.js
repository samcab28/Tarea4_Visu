import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Define las escalas
var xScale = d3.scaleLinear().domain([-125.786406, -66.419422]).range([110, 750]);
var yScale = d3.scaleLinear().domain([23.982057, 50.508481]).range([250, 110]);

// Función para cargar y procesar el archivo de coordenadas
async function prepareCoord() {
    try {
        const response = await fetch('states_usa.bna', {
            headers: {
                'Content-Type': 'text/plain', // Set the content type as plain text
            },
        });
        if (response.ok) {
            const textContent = await response.text(); // Get the file content as text
            var arrayCoord = textContent.split('\n'); // Split the content by line
            var newCoord = [];
            var areaAll = [];
            var currentCoords = [];

            arrayCoord.forEach(line => {
                let elem = line.split(',');
                if (elem.length == 3) {
                    if (currentCoords.length > 0) {
                        areaAll.push(currentCoords);
                        currentCoords = [];
                    }
                    newCoord.push({
                        id: elem[0],
                        idUser: elem[1],
                        numState: elem[2],
                        coord: []
                    });
                } else if (elem.length == 2) {
                    currentCoords.push({ x: +elem[0], y: +elem[1] });
                }
            });

            if (currentCoords.length > 0) {
                areaAll.push(currentCoords);
            }

            return [newCoord, areaAll];
        } else {
            console.error('Error downloading file:', response.status);
        }
    } catch (error) {
        console.error('Request error:', error);
    }
}

// Función para cargar y procesar el archivo de nombres de estados
async function loadStateNames() {
    try {
        const response = await fetch('states_name.csv');
        if (response.ok) {
            const csvContent = await response.text();
            const data = d3.csvParse(csvContent);
            const stateNames = {};
            data.forEach(d => {
                stateNames[d.ID] = d.NAME;
                console.log(d.ID, d.NAME);
            });
            return stateNames;
        } else {
            console.error('Error downloading file:', response.status);
        }
    } catch (error) {
        console.error('Request error:', error);
    }
}

let [coord, areaAll] = await prepareCoord();
let stateNames = await loadStateNames();

// Define el área
var area = d3.area()
    .x(d => xScale(d.x))
    .y0(d => yScale(d.y))
    .y1(d => yScale(d.y));

// Dibuja los estados
areaAll.forEach((element, index) => {
    d3.select("#demo")
        .append("path")
        .attr("d", area(element))
        .attr("fill", "red")
        .attr("stroke", "black");

    // Agrega nombres de estados
    d3.select("#demo")
        .append("text")
        .attr("x", xScale(d3.mean(element, d => d.x)))
        .attr("y", yScale(d3.mean(element, d => d.y)))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(stateNames[coord[index].numState] || "Unknown");
});
