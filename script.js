import {exportToInkML, downloadInkml, exportToPnml, downloadPnml} from './export.js';

document.addEventListener('DOMContentLoaded', function() {
    let canvas = document.getElementById('myCanvas');
    let svg = document.getElementById('svg');
    // Attach event listeners to buttons
    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);


    let download_inkml_btn = document.createElement('button')
    console.log('test');
    download_inkml_btn.id = 'download_inkml_btn'
    download_inkml_btn.textContent = 'Download in inkml Format'
    document.querySelector('menu').appendChild(download_inkml_btn)
    console.log(download_inkml_btn);
    download_inkml_btn.addEventListener('click', function() {
        let inkML = exportToInkML(traces);
        downloadInkml('drawing.inkml', inkML);
    });

    let upload_inkml_btn = document.createElement('button')
    upload_inkml_btn.id = 'upload_inkml_btn'
    upload_inkml_btn.textContent = 'Upload inkml File'
    document.querySelector('menu').appendChild(upload_inkml_btn)

    upload_inkml_btn.addEventListener('click', function(){
        document.getElementById('fileInput').click();
    })

    let previewButton = document.createElement('button');
    previewButton.id = 'previewButton';
    previewButton.textContent = 'Preview';
    document.querySelector('menu').appendChild(previewButton);
    
    

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
            console.log(segment.point.x, segment.point.y);
            return {x: segment.point.x, y: segment.point.y};
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
            return {x: segment.point.x, y: segment.point.y};
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

    

    document.getElementById('previewButton').addEventListener('click', function() {
        let inkML = exportToInkML(traces);
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
            console.log('Success:', data.result);
            let shapes = get_shapes(data.result);
            // document.getElementById('output').textContent = JSON.stringify(data.result);
            let editButton = document.createElement('button');
            editButton.id = 'editButton';
            editButton.textContent = 'Edit';
            document.querySelector('menu').appendChild(editButton);
            svg.style.display = 'block';
            canvas.style.display = 'none';
            // add shapes to svg
            for (let circle of shapes[0]) {
                let circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circleElement.setAttribute('cx', circle.min_x);
                circleElement.setAttribute('cy', circle.min_y);
                circleElement.setAttribute('r', circle.width / 2);
                circleElement.setAttribute('fill', 'none');
                circleElement.setAttribute('stroke', 'black');
                svg.appendChild(circleElement);
            }
            for (let rectangle of shapes[1]) {
                let rectangleElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rectangleElement.setAttribute('x', rectangle.min_x);
                rectangleElement.setAttribute('y', rectangle.min_y);
                rectangleElement.setAttribute('width', rectangle.width);
                rectangleElement.setAttribute('height', rectangle.height);
                rectangleElement.setAttribute('fill', 'none');
                rectangleElement.setAttribute('stroke', 'black');
                svg.appendChild(rectangleElement);
            }

            let download_pnml_btn = document.createElement('button');
            download_pnml_btn.id = 'download_pnml_btn';
            download_pnml_btn.textContent = 'Download as pnml';
            document.querySelector('menu').appendChild(download_pnml_btn);
            document.getElementById('download_pnml_btn').addEventListener('click', function() {
                console.log('download pnml', data.result);
                
                let pnml = exportToPnml(shapes);
               
                downloadInkml('petri-net.pnml', pnml);
            });

            document.getElementById('editButton').addEventListener('click', function() {
                
                // document.getElementById('output').textContent = '';
                document.getElementById('editButton').remove();
                document.getElementById('download_pnml_btn').remove()
                svg.style.display = 'none';
                canvas.style.display = 'block';
                previewButton.style.display = 'block';
                download_inkml_btn.style.display = 'block'
                upload_inkml_btn.style.display = 'block'
                
               
            });
            
            previewButton.style.display = 'none';
            download_inkml_btn.style.display = 'none'
            upload_inkml_btn.style.display = 'none'

    });


    document.getElementById('fileInput').addEventListener('change', function(event) {
        
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
                    // console.log(x, y);
                    // return new paper.Point((parseFloat(x) - minX) * scale, (parseFloat(y) - minY) * scale);
                });
                // generate a random color
                const color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
                // Create and draw the path

                let inkml_path = new paper.Path({
                    segments: points,
                    strokeColor: color,
                    strokeWidth: 2,
                    fullySelected: false
                });

                
                let tracePoints = inkml_path.segments.map(function(segment) {
                    return {x: segment.point.x, y: segment.point.y};
                });
                traces.push(tracePoints);  // Save the trace in the global traces array
            

                // path.segments.map(function(segment) {
                //     new paper.Path.Circle({
                //         center: [segment.point.x, segment.point.y], // Center position x, y on the canvas
                //         radius: 2,       // Radius of the circle
                //         fillColor: 'red'  // Color of the circle
                // });

                // // // Calculate the middle point of the path
                // // let middlePoint = path.getPointAt(path.length / 2);

                
                    
                //     return {x: segment.point.x, y: segment.point.y};
                // });

                // Add order of drawn strokes
                // if(i == 60 || i == 61 || i == 62 || i ==63||i==64|| i==65 || i==95){
                    let text = new paper.PointText({
                        point: inkml_path.segments[0].point.add([0, -10]), // Position the text above the middle segment
                        content: '' + i, // The text content
                        fillColor: color,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        fontSize: 16
                    });
                
                    text.justification = 'center'; // Center the text horizontally
                // }
               


            });
            console.log('jsflsa', inkml_traces.length, traces.length);

            paper.view.draw();
            zoomOut();
            
        };
        reader.readAsText(file); // Reads the file's content as a text string
    });  
 
});
    
    });

function get_shapes(recognition_result){
    let circles = []
    let rectangles = []
    let lines = []

    for (let item of recognition_result) {
       if(item.shape_name === 'circle') {
           circles.push(item)
       }
       else if(item.shape_name === 'rectangle') {
           rectangles.push(item)
       }
       else if(item.shape_name === 'line') {
           lines.push(item)
       }
    }
    return [circles, rectangles, lines]

}


