import {exportToInkML, download} from './export.js';

document.addEventListener('DOMContentLoaded', function() {
    let canvas = document.getElementById('myCanvas');
    let downloadButton = document.getElementById('download');
    // Attach event listeners to buttons
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);

    paper.setup(canvas);
    let tool = new paper.Tool();
    let path;
    let traces = [];

    // Function to handle zoom in
    function zoomIn() {
        paper.view.scale(1.1, paper.view.center); // Zoom in by 10%
    }

    // Function to handle zoom out
    function zoomOut() {
        paper.view.scale(0.9, paper.view.center); // Zoom out by 10%
    }

    

    if (window.devicePixelRatio) {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = canvas.offsetHeight + 'px';
        paper.view.setViewSize(canvas.width, canvas.height);
    }

    tool.onMouseDown = function(event) {
        // timeStamps.push(Date.now());
        path = new paper.Path();
        path.strokeColor = 'black';
        path.add(event.point);
    
    };

    tool.onTouchStart = function(event) {
        path = new paper.Path();
        path.strokeColor = 'black';
        path.add(event.point);
    }

    tool.onMouseDrag = function(event) {
        if (path) {
            path.add(event.point);
        }
        
    };

    tool.onTouchMove = function(event) {
        if (path) {
            path.add(event.point);
        }
    }

    tool.onMouseUp = function(event) {
        
        traces.push(path.segments.map(function(segment) {
            return {x: Math.round(segment.point.x), y: Math.round(segment.point.y)};
        }));
        path.segments.map(function(segment) {
            new paper.Path.Circle({
                center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
                radius: 2,       // Radius of the circle
                fillColor: 'red'  // Color of the circle
            });
            // traces.push([segment.point.x, segment.point.y]);
            // Draw the circle
            paper.view.draw();
            
            return {x: segment.point.x, y: segment.point.y};
        });
        
    };

    tool.onTouchEnd = function(event) {
        traces.push(path.segments.map(function(segment) {
            return {x: Math.round(segment.point.x), y: Math.round(segment.point.y)};
        }
        ));
        path.segments.map(function(segment) {
            new paper.Path.Circle({
                center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
                radius: 2,       // Radius of the circle
                fillColor: 'red'  // Color of the circle
            });
            // traces.push([segment.point.x, segment.point.y]);
            // Draw the circle
            paper.view.draw();
            
            return {x: segment.point.x, y: segment.point.y};
        }
        );
    };

    downloadButton.addEventListener('click', function() {
        let inkML = exportToInkML(traces);
        download('drawing.inkml', inkML);
    });

    document.getElementById('fileInput').addEventListener('change', function(event) {
        
        // Everytime a new file is uploaded, we want to have a clean canvas
        paper.project.clear();

        const file = event.target.files[0];
        if (!file) {
          return;
        }
        // Now you can do something with the file, e.g., read it
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            // Process the .inkml file content here
            const parser = new DOMParser();
            const xml = parser.parseFromString(fileContent, 'text/xml');
            const traces = xml.querySelectorAll('trace');

            let allPoints = [];
            // // Loop durch die Spuren und zeichne sie auf den Canvas
            traces.forEach((trace) => {
                trace = trace.textContent.split(',').filter(item => item.trim() !== '');
                const points = trace.map(point => {
                    const [x, y, ...rest] = point.split(' ').filter(item => item.trim() !== '');                                       
                    return new paper.Point(parseFloat(x), parseFloat(y)); 
                   
                })
                allPoints = allPoints.concat(points);
                
            });
            // Now calculate the bounding box for all points
            const minX = Math.min(...allPoints.map(point => point.x));
            const maxX = Math.max(...allPoints.map(point => point.x));
            const minY = Math.min(...allPoints.map(point => point.y));
            const maxY = Math.max(...allPoints.map(point => point.y));
            // Scaling for the entire drawing
            const width = maxX - minX;
            const height = maxY - minY;
            const scaleX = canvas.getBoundingClientRect()['width'] / width;
            const scaleY = canvas.getBoundingClientRect()['height'] / height;
            const scale = Math.min(scaleX, scaleY);

            // mittig setzen
            const offsetX = (canvas.getBoundingClientRect()['width'] - width * scale) / 2;
            const offsetY = (canvas.getBoundingClientRect()['height'] - height * scale) / 2;

            
            // Then draw each trace with points transformed based on the calculated scale
            traces.forEach(function(trace, i) {
                const points = trace.textContent.trim().split(',').map(point => {
                    const [x, y] = point.split(' ').filter(item => item.trim() !== '');
                    const scaledX = (parseFloat(x) - minX) * scale + offsetX;
                    const scaledY = (parseFloat(y) - minY) * scale + offsetY;
                    return new paper.Point(scaledX, scaledY);
                });
                // Create and draw the path
                const path = new paper.Path({
                    segments: points,
                    strokeColor: 'black',
                    strokeWidth: 2,
                    fullySelected: false
                });

                // path.segments.map(function(segment) {
                //     new paper.Path.Circle({
                //         center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
                //         radius: 2,       // Radius of the circle
                //         fillColor: 'red'  // Color of the circle
                // });

                // // Calculate the middle point of the path
                // let middlePoint = path.getPointAt(path.length / 2);

                
                    
                //     return {x: segment.point.x, y: segment.point.y};
                // });

                // Add order of drawn strokes
                // let text = new paper.PointText({
                //     point: path.segments[0].point.add([0, -10]), // Position the text above the middle segment
                //     content: '' + i, // The text content
                //     fillColor: 'black',
                //     fontFamily: 'Arial',
                //     fontWeight: 'bold',
                //     fontSize: 16
                // }); 
                

                // text.justification = 'center'; // Center the text horizontally
            });

            paper.view.draw();
            zoomOut();
            
        };
        reader.readAsText(file); // Reads the file's content as a text string
    });  
 
});








