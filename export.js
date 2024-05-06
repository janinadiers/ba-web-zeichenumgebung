export function exportToInkML(traces) {
    let inkML = '<?xml version="1.0" encoding="UTF-8"?>\n<ink>\n';
    inkML += '  <traceFormat>\n';
    inkML += '    <channel name="X" type="integer" />\n';
    inkML += '    <channel name="Y" type="integer" />\n';
    inkML += '  </traceFormat>\n';
    traces.forEach((trace, index) => {
        inkML += `  <trace id="${index}">\n`;
        trace.forEach(coordinate => {
           inkML += `    ${coordinate.x} ${coordinate.y},`;
         });
        inkML += '  </trace>\n';
    });
    inkML += '</ink>';
    return inkML;
}

export function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}