import {exportToInkML, downloadInkml, exportToPnml, downloadPnml} from './export.js';
import {change_to_preview_mode, change_to_analyse_mode, get_candidate_colors} from './preview.js';


document.addEventListener('DOMContentLoaded', function() {

    let canvas = document.getElementById('myCanvas');
    window.drawingEnabled = true;
    
    
    // Attach event listeners to buttons
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);

    // let btn = document.createElement('button');
    // btn.textContent = '' + canvas.getBoundingClientRect()['width'] + '/' + canvas.getBoundingClientRect()['height'];
    // document.querySelector('menu').appendChild(btn);

    const fileInput = document.getElementById('fileInput');
    const uploadInkmlBtn = document.getElementById('upload_inkml_btn');

    uploadInkmlBtn.addEventListener('click', function() {

        fileInput.click();
    });

    

    fileInput.addEventListener('change', function(event) {
        // Everytime a new file is uploaded, we want to have a clean canvas
        paper.project.clear();
        traces = [];
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
                    // return new paper.Point((parseFloat(x) - minX) * scale, (parseFloat(y) - minY) * scale);
                });
                // generate a random color
                // const color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
                // // Create and draw the path

                let inkml_path = new paper.Path({
                    segments: points,
                    strokeColor: 'black',
                    strokeWidth: 1,
                    fullySelected: false
                });

                
                let tracePoints = inkml_path.segments.map(function(segment) {
                    return {x: segment.point.x, y: segment.point.y};
                });
                traces.push({'points': tracePoints, 'path': inkml_path});  // Save the trace in the global traces array
                

                // inkml_path.segments.map(function(segment) {
                //     new paper.Path.Circle({
                //         center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
                //         radius: 2,       // Radius of the circle
                //         fillColor: 'red'  // Color of the circle
                // });

                // // // Calculate the middle point of the path
                // let middlePoint = inkml_path.getPointAt(inkml_path.length / 2);

                
                    
                //     return {x: segment.point.x, y: segment.point.y};
                // });

                // Add order of drawn strokes
                // if(i == 60 || i == 61 || i == 62 || i ==63||i==64|| i==65 || i==95){
                //     let text = new paper.PointText({
                //         point: inkml_path.segments[0].point.add([0, -10]), // Position the text above the middle segment
                //         content: '' + i, // The text content
                //         fillColor: color,
                //         fontFamily: 'Arial',
                //         fontWeight: 'bold',
                //         fontSize: 16
                //     });
                
                //     text.justification = 'center'; // Center the text horizontally
                // // }
               


            });

            paper.view.draw();
            zoomOut();
            
        };
        reader.readAsText(file); // Reads the file's content as a text string
    });  

    let download_inkml_btn = document.getElementById('download_inkml_btn');
    download_inkml_btn.addEventListener('click', function() {
        let inkML = exportToInkML(traces);
        downloadInkml('drawing.inkml', inkML);
    });


  

    // let previewButton = document.createElement('button');
    // let checkbox = document.createElement('input');
    // let div = document.createElement('div');
    // checkbox.type = 'checkbox';
    // checkbox.id = 'checkbox';
    // checkbox.checked = false;
    // checkbox.title = 'Analyse mode';
    // previewButton.id = 'previewButton';
    // previewButton.textContent = 'Preview';
    
    // div.appendChild(previewButton)
    // div.appendChild(checkbox);
    // document.querySelector('menu').appendChild(div);
    
    
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
        // timeStamps.push(Date.now());
        path = new paper.Path();
        path.strokeColor = 'black';
        // path.strokeColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
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
        // Add text displaying the trace index
        // let text = new paper.PointText({
        //     point: event.point,
        //     content: (traces.length - 1).toString(),
        //     fillColor: 'black',
        //     fontFamily: 'Arial',
        //     fontWeight: 'bold',
        //     fontSize: 15
        // });

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


    // let resetButton = document.createElement('button');
    // resetButton.id = 'resetButton';
    // resetButton.textContent = 'Reset';
    // document.querySelector('menu').appendChild(resetButton);
    // resetButton.addEventListener('click', function() {
    //     console.log('Reset button clicked', traces, path);
    //     traces.pop();
    // });

    document.getElementById('preview_btn').addEventListener('click', function() {
        console.log('traces', traces);  
        let inkML = exportToInkML(traces);
        console.log('inkML', inkML);
        let checkbox = document.getElementById('checkbox');
        let canvasSize = '' + canvas.getBoundingClientRect()['width'] + '/' + canvas.getBoundingClientRect()['height'];

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
                console.log(data, 'hier passiert der change to preview mode');
                change_to_preview_mode(data, traces, canvas);
            }


    });


 
});
    
    });






