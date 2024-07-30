
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
            lines.push(item.candidate)
        }
        
    }
    return [circles, rectangles, lines]
}


function change_to_edit_mode(canvas){
    console.log('change to edit mode');
    remove_buttons_in_edit_mode();
    add_buttons_in_edit_mode();
    window.drawingEnabled = true;
    
    // remove colors from paths and texts
    let paths = paper.project.getItems({class: paper.Path});
    for (let path of paths){
        path.strokeColor = 'black';
    }
    let texts = paper.project.getItems({class: paper.PointText});
    for (let text of texts){
        console.log(text);
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

function change_to_edge_analyse_mode(data, traces, canvas, candidate_colors){
    console.log('change to edge analyse mode');
    let line_candidates = get_candidates(data.result)[2];
   
   // Remove existing event listeners
   let nextButton = document.getElementById('next');
   let newNextButton = nextButton.cloneNode(true);
   nextButton.parentNode.replaceChild(newNextButton, nextButton);
   let backButton = document.getElementById('back');
   let newBackButton = backButton.cloneNode(true);
   backButton.parentNode.replaceChild(newBackButton, backButton);
  
    
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
    newNextButton.addEventListener('click', function() {
        
        change_to_preview_mode(data, traces, canvas, candidate_colors);
    });

    newBackButton.addEventListener('click', function() {
        change_to_analyse_mode(data, traces, canvas, candidate_colors);
    });
}

export function change_to_analyse_mode(data, traces, canvas, candidate_colors){
    console.log('change to analyse mode');
    remove_buttons_in_analyse_mode();
    add_buttons_in_analyse_mode();
    window.drawingEnabled = false;
    

    let texts = paper.project.getItems({class: paper.PointText});
    for (let text of texts){
        text.remove();
    }
    
    // Remove existing event listeners
    let nextButton = document.getElementById('next');
    let newNextButton = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    let backButton = document.getElementById('back');
    let newBackButton = backButton.cloneNode(true);
    backButton.parentNode.replaceChild(newBackButton, backButton);

    let circle_candidates = get_candidates(data.result)[0];
    let rectangle_candidates = get_candidates(data.result)[1];
    let line_candidates = get_candidates(data.result)[2];


    newNextButton.addEventListener('click', function() {
        change_to_edge_analyse_mode(data, traces, canvas, candidate_colors);
    });

    newBackButton.addEventListener('click', function() {
        change_to_edit_mode(canvas);
    });
    
    
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
            
            traces[index].path.strokeColor = 'black';
            let midpoint = traces[index].path.getPointAt(traces[index].path.length / 2);
         
            
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
    let undoButton = document.getElementById('reset');
    upload_inkml_btn.style.display = 'block';
    download_inkml_btn.style.display = 'block';
    previewButton.style.display = 'block';
    undoButton.style.display = 'block';
    download_inkml_btn.addEventListener('click', function() {
        let inkML = exportToInkML(traces);
        downloadInkml('drawing.inkml', inkML);
    });

}



function remove_buttons_in_analyse_mode(){
    let upload_inkml_btn = document.getElementById('upload_inkml_btn');
    let download_inkml_btn = document.getElementById('download_inkml_btn');
    let previewButton = document.getElementById('wrapper');
    let pnml_download_btn = document.getElementById('download_pnml_btn');
    let undoButton = document.getElementById('reset');
    upload_inkml_btn.style.display = 'none';
    download_inkml_btn.style.display = 'none';
    previewButton.style.display = 'none';
    pnml_download_btn.style.visibility = 'hidden';
    undoButton.style.display = 'none';

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
    let undoButton = document.getElementById('reset');
    nextButton.style.visibility = 'hidden';
    upload_inkml_btn.style.display = 'none';
    download_inkml_btn.style.display = 'none';
    previewButton.style.display = 'none';
    undoButton.style.display = 'none';

}

function add_buttons_in_preview_mode(){
    let backButton = document.getElementById('back');
    let download_pnml_btn = document.getElementById('download_pnml_btn');
    backButton.style.display = 'block';
    download_pnml_btn.style.visibility = 'visible';
    download_pnml_btn.style.display = 'block';
}

export function change_to_preview_mode(data, traces, canvas, candidate_colors=undefined){
    console.log('change to preview mode');
    remove_buttons_in_preview_mode();
    add_buttons_in_preview_mode();
    window.previewModeActive = true;
    let shapes = get_shapes(data.result);
    let texts = []; 
  
    let backButton = document.getElementById('back');
    
    let checkbox = document.getElementById('checkbox');
    
    backButton.addEventListener('click', function() {
        window.previewModeActive = false;
        if(checkbox.checked){
            for(let text of texts){
                text.remove();
            }
            change_to_edge_analyse_mode(data, traces, canvas, candidate_colors);
        }
        else{
            
            change_to_edit_mode(canvas);
        }
    });

    document.getElementById('download_pnml_btn').addEventListener('click', function() {
        let pnml = exportToPnml(shapes);
        
        downloadInkml('petri-net.pnml', pnml);
    });

                  
    // add shapes to svg

    // find all traces for shape and add textelement with id of shape

    for (let [index, line] of shapes[2].entries()) {
       
        let shape_traces = traces.filter((trace, idx) => line.candidate.includes(idx));
        console.log(line, shape_traces);
        // // Create a new text item and add it to the project
        let textItem = new paper.PointText({
            content: '' + line.source_id + ' to ' + line.target_id, // The text content
            point: shape_traces[0].path.segments[Math.floor(shape_traces[0].path.segments.length / 2)].point.add([10, -10]), // Starting position of the text
            fillColor: 'black',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 20,
            justification: 'center'
        });
        texts.push(textItem);
        // // Add everything to the paper.js project
        paper.view.draw();
     
    }
    
    for (let [index, circle] of shapes[0].entries()) {
        let shape_traces = traces.filter((trace, idx) => circle.candidates.includes(idx));
       
        // Create a new text item and add it to the project
        let textItem = new paper.PointText({
            content: '' + circle.shape_id,
            point: shape_traces[0].path.segments[0].point.add([0, -10]), // Starting position of the text
            fillColor: 'black',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 20,
            justification: 'center'
        });
        texts.push(textItem);
        // Add everything to the paper.js project
        paper.view.draw();
       
        
        
    }
    for (let [index, rectangle] of shapes[1].entries()) {
        let shape_traces = traces.filter((trace, idx) => rectangle.candidates.includes(idx));
        // Create a new text item and add it to the project
        let textItem = new paper.PointText({
            content: '' + rectangle.shape_id,
            point: shape_traces[0].path.segments[0].point.add([0, -10]), // Starting position of the text
            fillColor: 'black',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 20,
            justification: 'center'
        });
        texts.push(textItem);
        // Add everything to the paper.js project
        paper.view.draw();
        
    }

    const errors = data.result
    .filter(obj => 'error' in obj) // Filter objects that contain the key
    .map(obj => obj['error']); 
    
    if (errors.length > 0){
        let messages = ''
        for (let error of errors){
            messages += error + '\n';
        }
        
        alert(messages);
    }

    
}