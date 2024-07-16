export function exportToInkML(traces, canvasSize) {
    let inkML = '<?xml version="1.0" encoding="UTF-8"?>\n<ink>\n';
    inkML += '  <traceFormat>\n';
    inkML += '    <channel name="X" type="integer" />\n';
    inkML += '    <channel name="Y" type="integer" />\n';
    inkML += `    <annotation type="canvasWidth">${canvasSize.width}</annotation>\n`;
    inkML += `    <annotation type="canvasHeight">${canvasSize.height}</annotation>\n`;
    inkML += '  </traceFormat>\n';
    traces.forEach((trace, index) => {
        inkML += `  <trace id="${index}">\n`;
        trace.points.forEach(coordinate => {
            if(!isNaN(coordinate.x) && !isNaN(coordinate.y)){
                inkML += `    ${coordinate.x} ${coordinate.y},`;
            }
           
         });
        inkML += '  </trace>\n';
    });
    inkML += '</ink>';
    return inkML;
}

export function exportToPnml(shapes) {
    
    let circles = shapes[0]
    let rectangles = shapes[1]
    let lines = shapes[2]

    
    let pnmlString =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<pnml>\n<net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">\n<name>\n<text>ILovePetriNets.pnml</text>\n</name>\n<page id="p1">';
    for (const circle of circles) {
        pnmlString += `<place id="${circle.shape_id}">\n<name><text>${circle.shape_id}</text></name>\n<graphics>\n<position x="${circle.min_x}" y="${circle.min_y}"/>\n</graphics>\n<initialMarking>\n<text>0</text>\n</initialMarking>\n</place>`;
    }

    for (const rectangle of rectangles) {
        pnmlString += `<transition id="${rectangle.shape_id}">\n<name><text>${rectangle.shape_id}</text></name>\n<graphics><position x="${rectangle.min_x}" y="${rectangle.min_y}"/>\n</graphics>\n</transition>`;
    }

    for (const line of lines) {
        let graphics = '<graphics>\n';
        // if (line.coords && line.coords.length > 0) {
        //     for (const coord of line.coords) {
        //         graphics += `<position x="${coord.x}" y="${coord.y}"/>\n`;
        //     }
        // }
        graphics += '</graphics>\n';
        pnmlString += `\n<arc id="${line.shape_id}" source="${line.source_id}" target="${line.target_id}">\n${graphics}\n<inscription><text>1</text></inscription>\n</arc>`;
    }
    pnmlString += '\n</page>\n</net>\n</pnml>';
    return pnmlString;
}

export function downloadInkml(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export function downloadPnml(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}