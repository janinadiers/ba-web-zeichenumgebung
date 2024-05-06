import {exportToInkML, download} from './export.js';

document.addEventListener('DOMContentLoaded', function() {
    let canvas = document.getElementById('myCanvas');
    let downloadButton = document.getElementById('download');

    paper.setup(canvas);
    let tool = new paper.Tool();
    let path;
    let traces = [];

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

    tool.onMouseDrag = function(event) {
        if (path) {
            path.add(event.point);
        }
        
    };

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

    downloadButton.addEventListener('click', function() {
        let inkML = exportToInkML(traces);
        download('drawing.inkml', inkML);
    });
});








