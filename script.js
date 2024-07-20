
import {exportToInkML, downloadInkml, exportToPnml, downloadPnml} from './export.js';
import {change_to_preview_mode, change_to_analyse_mode, get_candidate_colors} from './preview.js';


document.addEventListener('DOMContentLoaded', function() {

    let canvas = document.getElementById('myCanvas');
    window.drawingEnabled = true;
    window.previewModeActive = false;

    paper.setup(canvas);
    let tool = new paper.Tool();
    let path;
    let traces = [];
    
    
    // Attach event listeners to buttons
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);


    const fileInput = document.getElementById('fileInput');
    const uploadInkmlBtn = document.getElementById('upload_inkml_btn');
    const resetBtn = document.getElementById('reset');

    uploadInkmlBtn.addEventListener('click', function() {

        fileInput.click();
    });

    resetBtn.addEventListener('click', function() {
        let last_trace = traces[traces.length - 1];
        console.log(last_trace);
        last_trace.path.remove()
        traces.pop();
    });

    fileInput.addEventListener('change', function(event) {
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
            const inkml_traces = xml.querySelectorAll('trace');
            let allPoints = [];
           
            // // Loop durch die Spuren und zeichne sie auf den Canvas
            inkml_traces.forEach((trace) => {
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
            inkml_traces.forEach(function(trace, i) {
                const points = trace.textContent.trim().split(',').map(point => {
                    const [x, y] = point.split(' ').filter(item => item.trim() !== '');
                    const scaledX = (parseFloat(x) - minX) * scale + offsetX;
                    const scaledY = (parseFloat(y) - minY) * scale + offsetY;
                    return new paper.Point(scaledX, scaledY);
                });

                let inkml_path = new paper.Path();
                let color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);

                // if (i == 17 || i == 18 || i == 19 || i == 20 || i == 21 || i == 22 || i == 23 || i == 24){

                // if ( i == 15 || i == 16 || i == 17){
                    // random color
                    inkml_path.strokeColor = color;
                   
                //  }
                // else{
                // inkml_path.strokeColor = 'black';
                // }
                inkml_path.strokeWidth = 1;

                for (let point of points) {
                    if (point.x && point.y){
                        inkml_path.add(point);
                    }
                  

                }

                let tracePoints = inkml_path.segments.map(function(segment) {
                    return {x: segment.point.x, y: segment.point.y};
                });

               
                traces.push({'points': tracePoints, 'path': inkml_path});  // Save the trace in the global traces array
                
                // // // Calculate the middle point of the path
                // let middlePoint = inkml_path.getPointAt(inkml_path.length / 2);

                
                    
                //     return {x: segment.point.x, y: segment.point.y};
                // });

                // Add order of drawn strokes
                // i == 30 || i == 31 || i == 32 || i == 33 || i == 34 || i == 35 ||
                // if ( i == 15 || i == 16 || i == 17){
                    // visualize the points in yellow
                    // inkml_path.segments.map(function(segment) {
                    //     new paper.Path.Circle({
                    //         center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
                    //         radius: 2,       // Radius of the circle
                    //         fillColor: 'yellow'  // Color of the circle
                    //     });
                    // })  
                  
                 
                //     if (i == 17 || i == 18 || i == 19 || i == 20 || i == 21 || i == 22 || i == 23 || i == 24){
                    let text = new paper.PointText({
                        point: inkml_path.segments[0].point.add([0, -10]), // Position the text above the middle segment
                        content: '' + i, // The text content
                        fillColor: color, // The color of the text
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fontSize: 16
                    });
                
                    text.justification = 'center'; // Center the text horizontally
                
                //  }


            });

            paper.view.draw();
            zoomOut();
            
        };
        reader.readAsText(file); // Reads the file's content as a text string
    });  

    let download_inkml_btn = document.getElementById('download_inkml_btn');
    download_inkml_btn.addEventListener('click', function() {
        let inkML = exportToInkML(traces, {width: canvas.getBoundingClientRect()['width'], height: canvas.getBoundingClientRect()['height']} );
        downloadInkml('drawing.inkml', inkML);
    });


    let scale = 1;
    function applyTransform() {
        const svg = document.getElementById('svg');
        svg.setAttribute('transform', `scale(${scale})`);
    }

    // Function to handle zoom in
    function zoomIn() {
        if (window.previewModeActive){
            
            scale *= 1.2;
            applyTransform();
        
        }
        else{
            paper.view.scale(1.1, paper.view.center); // Zoom in by 10%

        }
    }

    // Function to handle zoom out
    function zoomOut() {
        if (window.previewModeActive){
            scale /= 1.2;
            applyTransform();
        }
        else{
            paper.view.scale(0.9, paper.view.center); // Zoom out by 10%

        }
    }

    // // paper.view.setViewSize(canvas.getBoundingClientRect()['width'], canvas.getBoundingClientRect()['height']);
    // if (window.devicePixelRatio) {
    //             canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    //             canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    //             canvas.style.width = canvas.offsetWidth + 'px';
    //             canvas.style.height = canvas.offsetHeight + 'px';
    //             paper.view.setViewSize(canvas.width, canvas.height);
    //         }


    tool.onMouseDown = function(event) {
        if (window.drawingEnabled === false) {
            return;
        }
        path = new paper.Path();
        path.strokeColor = 'black';
        path.add(event.point);
        
    
    };


    tool.onMouseDrag = function(event) {
        if (window.drawingEnabled === false) {
            return;
        }
        if (path) {
            path.add(event.point);
        }
    }

    tool.onMouseUp = function(event) {
        if (window.drawingEnabled === false) {
            return;
        }

        let points = path.segments.map(function(segment) {
            return {x: segment.point.x, y: segment.point.y};
        })
        traces.push({'points': points, 'path': path});
       

// --------------------------------------------------->>>>>>>>>>>>> ROTE PUNKTE

        // path.segments.map(function(segment) {
        //     new paper.Path.Circle({
        //         center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
        //         radius: 2,       // Radius of the circle
        //         fillColor: 'red'  // Color of the circle
        //     });
        //     // traces.push([segment.point.x, segment.point.y]);
        //     // Draw the circle
        //     paper.view.draw();
            
        //     return {x: segment.point.x, y: segment.point.y};
        // });
        
    };

    document.getElementById('preview_btn').addEventListener('click', function() {
        let checkbox = document.getElementById('checkbox');
        let canvasSize = '' + canvas.getBoundingClientRect()['width'] + '/' + canvas.getBoundingClientRect()['height'];
        let inkML = exportToInkML(traces, {width: canvas.getBoundingClientRect()['width'], height: canvas.getBoundingClientRect()['height']});
        fetch('http://127.0.0.1:5000/api/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({inkML: inkML, canvasSize: canvasSize})
            
        })
        .then(response => response.json())
        .then(data => {
            if(checkbox.checked) {
                change_to_analyse_mode(data, traces, canvas, get_candidate_colors(data));
            }
            else{
             
                change_to_preview_mode(data, traces, canvas);
            }


    });


 
});
    
    });






