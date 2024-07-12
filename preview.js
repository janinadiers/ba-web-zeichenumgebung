
import {exportToInkML, downloadInkml, exportToPnml} from './export.js';


// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



function get_shapes(recognition_result){
    let circles = []
    let rectangles = []
    let lines = []
    for (let item of recognition_result) {
        console.log(item.shape_name);
       if(item.shape_name === 'circle') {
           circles.push(item)
       }
       else if(item.shape_name === 'rectangle') {
           rectangles.push(item)
       }
       else if(item.shape_name === 'line') {
            console.log('line');
           lines.push(item)
            
       }
    }
    return [circles, rectangles, lines]

}


function get_candidates(recognition_result){
    let circles = []
    let rectangles = []
    let lines = []
    for (let item of recognition_result) {
        if (item.shape_name === 'circle'){
            circles.push(item.candidates)
        }
        else if (item.shape_name === 'rectangle'){
            rectangles.push(item.candidates)
        }
        else if (item.shape_name === 'line'){
            lines.push(item.candidates)
        }
        
    }
    return [circles, rectangles, lines]
}


function change_to_edit_mode(canvas){
    remove_buttons_in_edit_mode();
    add_buttons_in_edit_mode();
    window.drawingEnabled = true;
    let svg = document.getElementById('svg');

    svg.style.display = 'none';
    canvas.style.display = 'block';
    // remove colors from paths and texts
    let paths = paper.project.getItems({class: paper.Path});
    for (let path of paths){
        path.strokeColor = 'black';
    }
    let texts = paper.project.getItems({class: paper.PointText});
    for (let text of texts){
        text.remove();
    }
}

export function get_candidate_colors(data){
    let circle_candidates = get_candidates(data.result)[0];
    let rectangle_candidates = get_candidates(data.result)[1];
    let line_candidates = get_candidates(data.result)[2];
    
    let circle_colors = []
    let rectangle_colors = []
    let line_colors = []
    for (let candidate of circle_candidates){
        let color = getRandomColor();
        circle_colors.push(color);
    }
    for (let candidate of rectangle_candidates){
        let color = getRandomColor();
        rectangle_colors.push(color);
    }
    for (let candidate of line_candidates){
        let color = getRandomColor();
        line_colors.push(color);
    }

    return [circle_colors, rectangle_colors, line_colors];

}

export function change_to_analyse_mode(data, traces, canvas, candidate_colors){
    
    remove_buttons_in_analyse_mode();
    add_buttons_in_analyse_mode();
    window.drawingEnabled = false;
    let svg = document.getElementById('svg');

    svg.style.display = 'none';
    canvas.style.display = 'block';
    
    let nextButton = document.getElementById('next');
    let backButton = document.getElementById('back');

    nextButton.addEventListener('click', function() {
        change_to_preview_mode(data, traces, canvas, candidate_colors);
    });

    backButton.addEventListener('click', function() {
        change_to_edit_mode(canvas);
    });

    let circle_candidates = get_candidates(data.result)[0];
    let rectangle_candidates = get_candidates(data.result)[1];
    let line_candidates = get_candidates(data.result)[2];
    for (let [idx,candidate] of circle_candidates.entries()) {
        // find corresponding traces
        
        for (let index of candidate){
           
            traces[index].path.strokeColor = candidate_colors[0][idx];
            let midpoint = traces[index].path.getPointAt(traces[index].path.length / 2);
         
            let text = new paper.PointText({
                point: midpoint.add([0, -10]), // Position the text above the middle segment
                content: '' + index, // The text content
                fillColor: candidate_colors[0][idx],
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 16
            });
        
            text.justification = 'center'; // Center the text horizontally
        }
    }
    for (let [idx,candidate] of rectangle_candidates.entries()) {
        // find corresponding traces
        for (let index of candidate){
            traces[index].path.strokeColor = candidate_colors[1][idx];
            let midpoint = traces[index].path.getPointAt(traces[index].path.length / 2);
         
            let text = new paper.PointText({
                point: midpoint.add([0, -10]), // Position the text above the middle segment
                content: '' + index, // The text content
                fillColor: candidate_colors[1][idx],
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 16
            });
        
            text.justification = 'center'; // Center the text horizontally

        }
    }

    for (let [idx,candidate] of line_candidates.entries()) {
        // find corresponding traces
        
        for (let index of candidate){
            traces[index].path.strokeColor = candidate_colors[2][idx];
            let midpoint = traces[index].path.getPointAt(traces[index].path.length / 2);
         
            let text = new paper.PointText({
                point: midpoint.add([0, -10]), // Position the text above the middle segment
                content: '' + index, // The text content
                fillColor: candidate_colors[2][idx],
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 16
            });
        
            text.justification = 'center'; // Center the text horizontally
        }
    }

   
    

}

function remove_buttons_in_edit_mode(){
    let backButton = document.getElementById('back');
    let nextButton = document.getElementById('next');
    let pnml_download_btn = document.getElementById('download_pnml_btn');
    backButton.style.display = 'none';
    nextButton.style.display = 'none';
    pnml_download_btn.style.visibility = 'hidden';

}

function add_buttons_in_edit_mode(){
    let upload_inkml_btn = document.getElementById('upload_inkml_btn');
    let download_inkml_btn = document.getElementById('download_inkml_btn');
    let previewButton = document.getElementById('wrapper');
    upload_inkml_btn.style.display = 'block';
    download_inkml_btn.style.display = 'block';
    previewButton.style.display = 'block';
    download_inkml_btn.addEventListener('click', function() {
        console.log('download inkml');
        let inkML = exportToInkML(traces);
        downloadInkml('drawing.inkml', inkML);
    });

}

function remove_buttons_in_analyse_mode(){
    let upload_inkml_btn = document.getElementById('upload_inkml_btn');
    let download_inkml_btn = document.getElementById('download_inkml_btn');
    let previewButton = document.getElementById('wrapper');
    let pnml_download_btn = document.getElementById('download_pnml_btn');
    upload_inkml_btn.style.display = 'none';
    download_inkml_btn.style.display = 'none';
    previewButton.style.display = 'none';
    pnml_download_btn.style.visibility = 'hidden';

}

function add_buttons_in_analyse_mode(){
    let backButton = document.getElementById('back');
    let nextButton = document.getElementById('next');
    nextButton.style.visibility = 'visible';
    backButton.style.display = 'block';
    nextButton.style.display = 'block';
}

function remove_buttons_in_preview_mode(){
    let nextButton = document.getElementById('next');
    let upload_inkml_btn = document.getElementById('upload_inkml_btn');
    let download_inkml_btn = document.getElementById('download_inkml_btn');
    let previewButton = document.getElementById('wrapper');
    nextButton.style.visibility = 'hidden';
    upload_inkml_btn.style.display = 'none';
    download_inkml_btn.style.display = 'none';
    previewButton.style.display = 'none';

}

function add_buttons_in_preview_mode(){
    let backButton = document.getElementById('back');
    let download_pnml_btn = document.getElementById('download_pnml_btn');
    backButton.style.display = 'block';
    download_pnml_btn.style.visibility = 'visible';
    download_pnml_btn.style.display = 'block';
}

export function change_to_preview_mode(data, traces, canvas, candidate_colors=undefined){
    console.log('change to preview mode', traces);

    remove_buttons_in_preview_mode();
    add_buttons_in_preview_mode();

    let shapes = get_shapes(data.result);
           
    let svg = document.getElementById('svg');
    
    let backButton = document.getElementById('back');

    let checkbox = document.getElementById('checkbox');
    
    backButton.addEventListener('click', function() {
        if(checkbox.checked){

            change_to_analyse_mode(data, traces, canvas, candidate_colors);
        }
        else{
            change_to_edit_mode(canvas);
        }
    });

    document.getElementById('download_pnml_btn').addEventListener('click', function() {
        console.log('download pnml');
        let pnml = exportToPnml(shapes);
        
        downloadInkml('petri-net.pnml', pnml);
    });

    svg.style.display = 'block';
    canvas.style.display = 'none';
                  
    // add shapes to svg

    for (let [index, line] of shapes[2].entries()) {
        console.log('for line');
        console.log(line);
        // Define the arrowhead marker
        let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '10');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        // Define the arrowhead shape
        let arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrowhead.setAttribute('points', '0 0, 10 3.5, 0 7');
        arrowhead.setAttribute('fill', 'black');
        marker.appendChild(arrowhead);

        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.appendChild(defs);
        }
        
        // Append marker to defs if not already present
        if (!document.getElementById('arrowhead')) {
            defs.appendChild(marker);
        }
       
        let lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        let center_source = {'x': (line.source_min_x + line.source_max_x) / 2, 'y': (line.source_min_y + line.source_max_y) / 2};
        let center_target = {'x': (line.target_min_x + line.target_max_x) / 2, 'y': (line.target_min_y + line.target_max_y) / 2};
        lineElement.setAttribute('x1', center_source.x);
        lineElement.setAttribute('y1', center_source.y);
        if (line.source_min_x < line.target_min_x){
            lineElement.setAttribute('x2', center_target.x - 40);
        }
        else{
            lineElement.setAttribute('x2', center_target.x + 40);
        }
        // lineElement.setAttribute('x2', center_target.x - 40);
        lineElement.setAttribute('y2', center_target.y);
        lineElement.setAttribute('stroke','black');
        lineElement.setAttribute('stroke-width', '1');
        lineElement.setAttribute('id', line.shape_id);
        lineElement.setAttribute('marker-end', 'url(#arrowhead)');
        svg.appendChild(lineElement);
    }
    
    for (let [index, circle] of shapes[0].entries()) {
       
        let circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        let center = {'x': (circle.min_x + circle.max_x) / 2, 'y': (circle.min_y + circle.max_y) / 2};
        circleElement.setAttribute('cx', center.x);
        circleElement.setAttribute('cy', center.y);
        circleElement.setAttribute('r', '40');
        circleElement.setAttribute('fill', 'white');
        circleElement.setAttribute('stroke',  candidate_colors ? '' + candidate_colors[0][index]: 'black');
        circleElement.id = circle.shape_id;
        svg.appendChild(circleElement);
        
        
    }
    for (let [index, rectangle] of shapes[1].entries()) {
       
        let rectangleElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        let center = {'x': (rectangle.min_x + rectangle.max_x) / 2, 'y': (rectangle.min_y + rectangle.max_y) / 2};
        rectangleElement.setAttribute('x', center.x - 40);
        rectangleElement.setAttribute('y', center.y - 40);
        rectangleElement.setAttribute('width', '80');
        rectangleElement.setAttribute('height', '80');
        rectangleElement.setAttribute('fill', 'white');
        rectangleElement.setAttribute('stroke', candidate_colors ? '' + candidate_colors[1][index]: 'black');
        rectangleElement.setAttribute('id', rectangle.shape_id);
        svg.appendChild(rectangleElement);

        
    }

    
}