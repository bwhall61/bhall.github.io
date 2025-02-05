var DEFAULT_FONT_SIZE = 30;
var LARGE_FONT_SIZE = 74;
var CUSTOM_COLOR_SCHEME = {
    // C: '#551393', // Carbon atoms will be green
    C: '#4F1E80',
    O: '#A90000',
    N: '#0021A3',
    Cl: '#00A11E',
    S: '#A7A32F',
    F: '#077DF2'
};
var BOND_COLOR = '#90959D';



let viewer = $3Dmol.createViewer("moleculeViewer",{
  disableFog: true,
  backgroundColor: '#151F32',
  antialias: false
});


var current_quaternion;
var current_position;
var current_conent;
var current_atom;
var first_click = false;

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

console.log(viewportWidth);
console.log(viewportHeight);

function dotProduct(v1, v2){
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
}

function scalarVecMult(s, v){
  return {x: v.x*s, y: v.y*s, z: v.z*s}
}

function vecMag(v){
  return Math.sqrt(v.x * v.x +  v.y * v.y + v.z * v.z)
}

function drawVector(viewer, start, end, color, radius) {
    // Define the arrow as a shape
    var arrow = {};
    arrow.start = start;
    arrow.end = end;

    // Create a cylinder representing the vector
    viewer.addCylinder({
        start: arrow.start,
        end: arrow.end,
        radius: radius || 0.1, // default radius if not provided
        color: color || "red", // default color if not provided
        fromCap: true,
        toCap: false
    });


    // Refresh the viewer to update the display
    viewer.render();
}

function calculateRotation(v1, v2) {
    // First, normalize the vectors
    const mag_v1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z);
    const mag_v2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y + v2.z*v2.z);

    const norm_v1 = { x: v1.x/mag_v1, y: v1.y/mag_v1, z: v1.z/mag_v1 };
    const norm_v2 = { x: v2.x/mag_v2, y: v2.y/mag_v2, z: v2.z/mag_v2 };

    // drawVector(viewer, {x: 0, y: 0, z:0}, v1, "red", 0.2);
    // drawVector(viewer, {x: 0, y: 0, z:0}, {x: -v2.x*100, y: -v2.y*100, z: -v2.z*100}, "blue", 0.2);

    // Compute the cross product to get the axis
    const axis = {
        x: norm_v1.y * norm_v2.z - norm_v1.z * norm_v2.y,
        y: norm_v1.z * norm_v2.x - norm_v1.x * norm_v2.z,
        z: norm_v1.x * norm_v2.y - norm_v1.y * norm_v2.x
    };

    // Normalize the axis
    const mag_axis = Math.sqrt(axis.x*axis.x + axis.y*axis.y + axis.z*axis.z);
    const norm_axis = { x: axis.x/mag_axis, y: axis.y/mag_axis, z: axis.z/mag_axis };

    // Compute the angle using dot product and inverse cosine
    const dot_product = norm_v1.x*norm_v2.x + norm_v1.y*norm_v2.y + norm_v1.z*norm_v2.z;
    const angleInRadians = Math.acos(dot_product);

    // Compute the quaternion
    const halfAngle = angleInRadians / 2;
    const q = {
        c: Math.cos(halfAngle),
        i: norm_axis.x * Math.sin(halfAngle),
        j: norm_axis.y * Math.sin(halfAngle),
        k: norm_axis.z * Math.sin(halfAngle)
    };

    return q;
}

function openPanel(atom, labels, centerOfMass, content, labelsToIncrease, labelsToShrink, labelsToDefault){
    let atomToCenter = new $3Dmol.Vector3(atom.x, atom.y, atom.z);
    let upDirection;

    let proj = scalarVecMult(dotProduct(atomToCenter, centerOfMass) / dotProduct(centerOfMass, centerOfMass), centerOfMass)
    let projMag = vecMag(proj)

    if (projMag < vecMag(centerOfMass)){
        upDirection = new $3Dmol.Vector3(-1, -1, 0);

    } else {
        upDirection = new $3Dmol.Vector3(1, 1, 0);
    }

    if (!first_click){
      current_quaternion = {c: viewer.rotationGroup.quaternion.w,
         i: viewer.rotationGroup.quaternion.x,
         j: viewer.rotationGroup.quaternion.y,
         k: viewer.rotationGroup.quaternion.z};
      current_position = viewer.modelToScreen(atom);
      current_atom = atom;
      first_click = true;
    }

    let new_quaternion = calculateRotation(atomToCenter, upDirection);

    viewer.rotateWQ(new_quaternion, 50*viewportWidth/100, 10*viewportHeight/100, atom, 2000, labels,
      labelsToIncrease, labelsToShrink, labelsToDefault,
      LARGE_FONT_SIZE, DEFAULT_FONT_SIZE, fixedPath=1);

    document.getElementById('info-panel').classList.add('open');

    document.querySelectorAll('.btn').forEach(function(btn) {
      btn.classList.remove('highlight');
    });

    if (content == "Research"){
          current_content = 'research-content'
          document.querySelector('.open-research-content').classList.add('highlight');
          document.getElementById('research-content').classList.add('open');
    } else if (content == "Contact"){
          current_content = 'contact-content'
          document.querySelector('.open-contact-content').classList.add('highlight');
          document.getElementById('contact-content').classList.add('open');
    } else if (content == "About"){
          current_content = 'about-content'
          document.querySelector('.open-about-content').classList.add('highlight');
          document.getElementById('about-content').classList.add('open');
    } else if (content == "Projects"){
          current_content = 'projects-content'
          document.querySelector('.open-projects-content').classList.add('highlight');
          document.getElementById('projects-content').classList.add('open');
    }

}

function closePanel(){
    var panel = document.getElementById('info-panel');
    var content = document.getElementById(current_content);

    // Applying a different transition when closing the panel
    panel.style.transition = "right 2s 0.5s"; // Change the transition as needed
    content.style.transition = "right 2s"; // Change the transition and delay as needed

    panel.classList.remove('open');
    content.classList.remove('open');

    // Resetting the transition back to the original after the transition ends
    panel.addEventListener('transitionend', function() {
        panel.style.transition = "right 2s";
    });

    content.addEventListener('transitionend', function() {
        content.style.transition = "right 2s 0.5s";
    });
}

function getCOM(atoms){
     let totalMass = 0;
     let centerX = 0;
     let centerY = 0;
     let centerZ = 0;

     atoms.forEach(atom => {
         totalMass += 1;
         centerX += atom.x;
         centerY += atom.y;
         centerZ += atom.z;
     });

     centerX /= totalMass;
     centerY /= totalMass;
     centerZ /= totalMass;

     // drawVector(viewer, {x: 0, y: 0, z:0}, {x: centerX, y: centerY, z: centerZ}, "green", 0.2);
     return { x: centerX, y: centerY, z: centerZ };
}

function getKFurthestAtoms(k, point, n) {
    let atoms = viewer.selectedAtoms({});

    // Calculate distances and store atoms with their distances
    let distances = atoms.map(atom => {
        const distance = Math.sqrt(
            Math.pow(atom.x - point.x, 2) +
            Math.pow(atom.y - point.y, 2) +
            Math.pow(atom.z - point.z, 2)
        );
        return {atom, distance};
    });

    // Sort atoms based on distances in descending order
    distances.sort((a, b) => b.distance - a.distance);

    // Get the k furthest atoms
    let furthestAtoms = distances.slice(0, k).map(item => item.atom);

    // Function to calculate the distance between two atoms
    function distanceBetween(atom1, atom2) {
        return Math.sqrt(
            Math.pow(atom1.x - atom2.x, 2) +
            Math.pow(atom1.y - atom2.y, 2) +
            Math.pow(atom1.z - atom2.z, 2)
        );
    }

    // Select n atoms from the k furthest atoms that are maximally distant from each other
    let selectedAtoms = [];
    selectedAtoms.push(furthestAtoms[0]); // Start with the first atom

    for (let i = 1; i < n; i++) {
        let maxMinDistance = -Infinity;
        let nextAtom = null;

        for (let atom of furthestAtoms) {
            if (!selectedAtoms.includes(atom)) {
                // Calculate the minimum distance from this atom to all selected atoms
                let minDistance = Math.min(...selectedAtoms.map(selectedAtom => distanceBetween(atom, selectedAtom)));

                // Pick the atom that maximizes this minimum distance
                if (minDistance > maxMinDistance) {
                    maxMinDistance = minDistance;
                    nextAtom = atom;
                }
            }
        }

        if (nextAtom) {
            selectedAtoms.push(nextAtom);
        }
    }

    return selectedAtoms;

    // return furthestAtoms;
}


let seed = 3;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


let randomMol = Math.floor(Math.random() * 15);

$.get(`sdfs/${randomMol}.sdf`, function(data) {
    viewer.addModel(data, 'sdf');
    viewer.zoomTo();

    // viewer.translate(150/1440 * viewportWidth, 35/812 * viewportHeight);


    let style = {
        stick: {radius: 0.2, color: BOND_COLOR},
        sphere: {radius: 0.5, colorscheme: CUSTOM_COLOR_SCHEME}
    };
    viewer.setStyle(style);

    let allatoms = viewer.selectedAtoms({});
    const centerOfMass = getCOM(allatoms);
    let atoms = getKFurthestAtoms(10, centerOfMass, 4);


    let selectedAtoms = [];
    let labels = [];
    let labelNames = ["Research", "About", "Contact", "Projects"];
    let randomIndex;
    while (selectedAtoms.length < 4) {
        randomIndex = Math.floor(random() * atoms.length);
        // Ensure the atom is not already selected
        if (!selectedAtoms.includes(atoms[randomIndex])) {
            selectedAtoms.push(atoms[randomIndex]);
        }
    }

    for (let i = 0; i < selectedAtoms.length; i++) {
        let atomLabel = viewer.addLabel(labelNames[i], {
            font: 'Arial',
            position: selectedAtoms[i],
            showBackground: false,
            fontSize: DEFAULT_FONT_SIZE,
            alignment: "center"
        });

        labels.push(atomLabel)

        viewer.setClickable({serial: selectedAtoms[i].serial}, true, function(atom) {
            openPanel(atom, labels, centerOfMass, labelNames[i], [i], [0, 1, 2, 3].filter(element => element !== i), []);
        });
    }

    document.querySelectorAll('.close-panel').forEach(function(element) {
        element.addEventListener('click', function() {
          document.querySelectorAll('.btn').forEach(function(btn) {
            btn.classList.remove('highlight');
          });
          closePanel();
          viewer.rotateWQ(current_quaternion, current_position.x, current_position.y, current_atom, 2000, labels,
             [], [], [0,1,2,3], LARGE_FONT_SIZE, DEFAULT_FONT_SIZE, fixedPath=1);
        });
    });

    document.querySelectorAll('.open-research-content').forEach(function(element) {
        element.addEventListener('click', function() {
            document.querySelectorAll('.btn').forEach(function(btn) {
              btn.classList.remove('highlight');
            });

            // Highlight the clicked button
            this.classList.add('highlight');
            closePanel();
            openPanel(selectedAtoms[0], labels, centerOfMass, labelNames[0], [0], [1,2,3], []);
        });
    });

    document.querySelectorAll('.open-about-content').forEach(function(element) {
        element.addEventListener('click', function() {
            document.querySelectorAll('.btn').forEach(function(btn) {
              btn.classList.remove('highlight');
            });

            // Highlight the clicked button
            this.classList.add('highlight');
            closePanel();
            openPanel(selectedAtoms[1], labels, centerOfMass, labelNames[1], [1], [0,2,3], [] );
        });
    });

    document.querySelectorAll('.open-contact-content').forEach(function(element) {
        element.addEventListener('click', function() {
            document.querySelectorAll('.btn').forEach(function(btn) {
              btn.classList.remove('highlight');
            });

            // Highlight the clicked button
            this.classList.add('highlight');
            closePanel();
            openPanel(selectedAtoms[2], labels, centerOfMass, labelNames[2], [2], [0,1,3], [] );
        });
    });

    document.querySelectorAll('.open-projects-content').forEach(function(element) {
        element.addEventListener('click', function() {
            document.querySelectorAll('.btn').forEach(function(btn) {
              btn.classList.remove('highlight');
            });

            // Highlight the clicked button
            this.classList.add('highlight');
            closePanel();
            openPanel(selectedAtoms[3], labels, centerOfMass, labelNames[3], [3], [0,1,2], [])
        });
    });


    viewer.render();

});


// window.addEventListener('resize', function() {
//     viewer.resize();
// });
