import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DragControls} from 'three/examples/jsm/controls/DragControls.js';

import grid from '../img/Untitled.png';


const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene(); 

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth/innerHeight,
    0.1,
    1000
);

const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    grid,
    grid,
    grid,
    grid,
    grid,
    grid
]);
const orbit = new OrbitControls(camera, renderer.domElement);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.20);
scene.add(ambientLight);

// var light = new THREE.PointLight(0xffffff, 1.2, 10000);
// light.position.set(0,100,100);
// scene.add(light);

let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, -30);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -70;
dirLight.shadow.camera.right = 70;
dirLight.shadow.camera.top = 70;
dirLight.shadow.camera.bottom = -70;

const plateform = new THREE.BoxGeometry( 200, 2, 50 );
const plateformMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff} );
const cube = new THREE.Mesh( plateform, plateformMaterial );
scene.add( cube );

cube.castShadow = true;
cube.receiveShadow = true;
const stig1 = new THREE.CylinderGeometry( 5, 5, 30, 32 );
const stigMaterial1 = new THREE.MeshBasicMaterial( {color: 0x042940} );
const cylinder1 = new THREE.Mesh( stig1, stigMaterial1 );
scene.add( cylinder1 );
cylinder1.castShadow = true;
cylinder1.receiveShadow = true;
cylinder1.position.set(-75,15,0)

const stig2 = new THREE.CylinderGeometry( 5, 5, 30, 32 );
const stigMaterial2 = new THREE.MeshBasicMaterial( {color: 0x042940} );
const cylinder2 = new THREE.Mesh( stig2, stigMaterial2 );
scene.add( cylinder2 );
cylinder2.position.set(0,15,0)
cylinder2.castShadow = true;
cylinder2.receiveShadow = true;

const stig3 = new THREE.CylinderGeometry( 5, 5, 30, 32 );
const stigMaterial3 = new THREE.MeshBasicMaterial( {color: 0x042940} );
const cylinder3 = new THREE.Mesh( stig3, stigMaterial3 );
cylinder3.castShadow = true;
cylinder3.receiveShadow = true;
scene.add( cylinder3 );
cylinder3.position.set(75,15,0)

const ringGeo1 = new THREE.TorusGeometry(9,3,256,256);
const ringMat1 = new THREE.MeshBasicMaterial({color: 0xD6D58E});
const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
scene.add(ringMesh1);
ringMesh1.rotateX(3.14/2);
ringMesh1.position.set(0,15,0);

const ringGeo2 = new THREE.TorusGeometry(12,4,256,256);
const ringMat2 = new THREE.MeshBasicMaterial({color: 0x9FC131});
const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
scene.add(ringMesh2);
ringMesh2.rotateX(3.14/2);
ringMesh2.position.set(0,10,0);

const ringGeo3 = new THREE.TorusGeometry(15,4,256,256);
const ringMat3 = new THREE.MeshBasicMaterial({color: 0x005C53});
const ringMesh3 = new THREE.Mesh(ringGeo3, ringMat3);
scene.add(ringMesh3);
ringMesh3.rotateX(3.14/2);
ringMesh3.position.set(0,5,0);

var rings = []; 
rings.push(ringMesh1);
rings.push(ringMesh2);
rings.push(ringMesh3);
var cylinders = []; 
cylinders.push(cylinder1);
cylinders.push(cylinder2);
cylinders.push(cylinder3);

// console.log(cylinder1.position.x,cylinder1.position.y,cylinder1.position.z)
var ring = 0;
var stig = 0;

var selectedStig = cylinder2;
var ringsPositions = [1,1,1]
var NextRingsPositions = [1,1,1]
var ringsVerticalPositions = [15,10,5]
var stigsContent = [0,3,0]
var dprevious = [75,0,75]

// var objects = [];
// objects.push(ringMesh1)
// objects.push(ringMesh2)
// objects.push(ringMesh3)


class Ring {
    constructor(RingObject, Radius, stig = 0, Mouvment = false) {
      this.object = RingObject;
      this.radius = Radius;
      this.movement = Mouvment;
      this.stig = stig;
      this.z = 0
    }
    reposition(x,y,z){
        this.object.position.set(x,y,z)
    }
  }

class Stig {
    constructor(StigObject, StigId, AvailableSlots = []) {       
      this.object = StigObject;
      this.availableSlots = AvailableSlots;
      this.stigId = StigId;
    }

    Add(ring){
        // console.log(this.availableSlots.length)
        if (this.availableSlots.length < 3) {
            this.availableSlots.push(ring)
            ring.z = 5*this.availableSlots.lenght
            this.init()
        }
        else {
            // console.log("No available slots");
        };
    }
    remove(){

            if (this.availableSlots.length > 0) {
                this.availableSlots.pop()
                if (this.availableSlots.length > 0) { 
                this.availableSlots[this.availableSlots.length-1].movement = true       
            }}
            
    }

    init(){
        for (let index = 0; index < this.availableSlots.length; index++) {
            this.availableSlots[index].stig =  this.stigId 
            this.availableSlots[index].z = (index + 1) * 5
            this.availableSlots[index].movement = false
        }
        if (this.availableSlots.length > 0) {
            this.availableSlots[this.availableSlots.length - 1].movement = true
        }
        // console.log(this.availableSlots)
        
    } 

  }

const Ring1 = new Ring(ringMesh1, 0, 2, true)
const Ring2 = new Ring(ringMesh2, 1, 2,false)
const Ring3 = new Ring(ringMesh3, 2, 2,false)


const Stig1 = new Stig(cylinder1, 1)
Stig1.init()
const Stig2 = new Stig(cylinder2, 2,[Ring3,Ring2,Ring1])
Stig2.init()
const Stig3 = new Stig(cylinder3, 3)
Stig3.init()

var objects = [];

var objects2 = [Ring1, Ring2, Ring3];
var stigs = [Stig1, Stig2, Stig3];



const controls1 = new DragControls( [Ring1.object], camera, renderer.domElement );
const controls2 = new DragControls( [Ring2.object], camera, renderer.domElement );
const controls3 = new DragControls( [Ring3.object], camera, renderer.domElement );


controls1.addEventListener( 'dragstart', function ( event ) {

    orbit.enabled = false;

} );


controls1.addEventListener( 'dragend', function ( event ) {

    orbit.enabled = true;

} );
controls2.addEventListener( 'dragstart', function ( event ) {

    orbit.enabled = false;

} );


controls2.addEventListener( 'dragend', function ( event ) {

    orbit.enabled = true;

} );
controls3.addEventListener( 'dragstart', function ( event ) {

    orbit.enabled = false;

} );


controls3.addEventListener( 'dragend', function ( event ) {

    orbit.enabled = true;

} );
var stigsPoses = [[-75,15,0],[0,15,0],[75,15,0]] 
var destinationStig        
        camera.position.set(200, 200, 200);
        orbit.update();
        function animate() {
            renderer.render(scene, camera);
            
            controls1.enabled = Ring1.movement
            
            controls2.enabled = Ring2.movement    
             
            controls3.enabled = Ring3.movement
                   
            dRing1 = [Math.sqrt(Math.pow(Stig1.object.position.x - Ring1.object.position.x,2)+ Math.pow(Stig1.object.position.y - Ring1.object.position.y,2) + Math.pow(Stig1.object.position.z - Ring1.object.position.z,2)),
                      Math.sqrt(Math.pow(Stig2.object.position.x - Ring1.object.position.x,2)+ Math.pow(Stig2.object.position.y - Ring1.object.position.y,2) + Math.pow(Stig2.object.position.z - Ring1.object.position.z,2)),
                      Math.sqrt(Math.pow(Stig3.object.position.x - Ring1.object.position.x,2)+ Math.pow(Stig3.object.position.y - Ring1.object.position.y,2) + Math.pow(Stig3.object.position.z - Ring1.object.position.z,2))]
            dRing2 = [Math.sqrt(Math.pow(Stig1.object.position.x - Ring2.object.position.x,2)+ Math.pow(Stig1.object.position.y - Ring2.object.position.y,2) + Math.pow(Stig1.object.position.z - Ring2.object.position.z,2)),
                      Math.sqrt(Math.pow(Stig2.object.position.x - Ring2.object.position.x,2)+ Math.pow(Stig2.object.position.y - Ring2.object.position.y,2) + Math.pow(Stig2.object.position.z - Ring2.object.position.z,2)),
                      Math.sqrt(Math.pow(Stig3.object.position.x - Ring2.object.position.x,2)+ Math.pow(Stig3.object.position.y - Ring2.object.position.y,2) + Math.pow(Stig3.object.position.z - Ring2.object.position.z,2))]
            dRing3 = [Math.sqrt(Math.pow(Stig1.object.position.x - Ring3.object.position.x,2)+ Math.pow(Stig1.object.position.y - Ring3.object.position.y,2) + Math.pow(Stig1.object.position.z - Ring3.object.position.z,2)),
                      Math.sqrt(Math.pow(Stig2.object.position.x - Ring3.object.position.x,2)+ Math.pow(Stig2.object.position.y - Ring3.object.position.y,2) + Math.pow(Stig2.object.position.z - Ring3.object.position.z,2)),
                      Math.sqrt(Math.pow(Stig3.object.position.x - Ring3.object.position.x,2)+ Math.pow(Stig3.object.position.y - Ring3.object.position.y,2) + Math.pow(Stig3.object.position.z - Ring3.object.position.z,2))]
            mostSuitablePoses = [dRing1.indexOf(Math.min(...dRing1))+1, dRing2.indexOf(Math.min(...dRing2))+1, dRing3.indexOf(Math.min(...dRing3))+1]
            actualPoses = [Ring1.stig, Ring2.stig, Ring3.stig]

            // GameCondition = 
            // console.log(GameCondition)
            if (actualPoses[0] != mostSuitablePoses[0] && Ring1.movement) {
                stigs[actualPoses[0]-1].remove()
                stigs[mostSuitablePoses[0] - 1].Add(Ring1)
            }
            if (actualPoses[1] != mostSuitablePoses[1] && Ring2.movement) {
                stigs[actualPoses[1]-1].remove()
                stigs[mostSuitablePoses[1] - 1].Add(Ring2)

            }
            if (actualPoses[2] != mostSuitablePoses[2] && Ring3.movement) {
                stigs[actualPoses[2]-1].remove()
                stigs[mostSuitablePoses[2] - 1].Add(Ring3)
            }
            if (Ring1.movement) {
                Ring1.object.position.set(stigsPoses[mostSuitablePoses[0]-1][0],Ring1.z,stigsPoses[mostSuitablePoses[0]-1][2])
            }
            if (Ring2.movement) {
                Ring2.object.position.set(stigsPoses[mostSuitablePoses[1]-1][0],Ring2.z,stigsPoses[mostSuitablePoses[1]-1][2])
            }
            if (Ring3.movement) {
                Ring3.object.position.set(stigsPoses[mostSuitablePoses[2]-1][0],Ring3.z,stigsPoses[mostSuitablePoses[2]-1][2])
            }
            console.log(Ring1.z,Ring2.z,Ring3.z)
                // if (d1-dprevious[0]) {
                    // if (d1 < d2 && d1 < d3) {
                    //     NextRingsPositions[i] = 0
                    //     ringsVerticalPositions[i] = NextRingsPositions[i] != ringsPositions[i] ?  5*stigsContent[0] + 5 : ringsVerticalPositions[i]
                    //     objects[i].position.set(cylinder1.position.x,ringsVerticalPositions[i],cylinder1.position.z)
                    //     ringsPositions[i] = 0
                        
                    // }
                    // else if (d2 < d1 && d2 < d3) {
                    //     NextRingsPositions[i] = 1
                    //     ringsVerticalPositions[i] = NextRingsPositions[i] != ringsPositions[i] ?  5*stigsContent[1] + 5 : ringsVerticalPositions[i] 
                    //     objects[i].position.set(cylinder2.position.x,ringsVerticalPositions[i],cylinder2.position.z)
                    //     ringsPositions[i] = 1
                    // }
                    // else {
                    //     NextRingsPositions[i] = 2
                    //     ringsVerticalPositions[i] = NextRingsPositions[i] != ringsPositions[i] ?  5*stigsContent[2] + 5 : ringsVerticalPositions[i]
                    //     objects[i].position.set(cylinder3.position.x,ringsVerticalPositions[i],cylinder3.position.z)
                    //     ringsPositions[i] = 2
    
                    // }
                    // if (d1 < d2 && d1 < d3) {
                    //     if (objects2[i].movement) {
                    //         destinationStig = 1
                    //         Stig1.Add(objects2[i])
                    //     }
                    // }
                    // else if (d2 < d1 && d2 < d3) {
                    //     if (objects2[i].movement) {
                    //         destinationStig = 2
                    //         Stig2.Add(objects2[i])
                    //     }
                    // }
                    // else if (d3 < d1 && d3 < d2){
                    //     if (objects2[i].movement) {
                    //         destinationStig = 3
                    //         Stig3.Add(objects2[i])
                    //     }         
                    // }

                    // if (previousS != destinationStig) {
                    //     stigs[previousS - 1].remove()
                    //     stigs[0].init()
                    //     stigs[1].init()
                    //     stigs[2].init()
                    // }
                    
                    // stigsContent[0] = ringsPositions.filter(x => x === 0).length
                    // stigsContent[1] = ringsPositions.filter(x => x === 1).length
                    // stigsContent[2] = ringsPositions.filter(x => x === 2).length
                    // console.log(ringsVerticalPositions)
                    // console.log(ringsVerticalPositions)
                // }
                

            }
    

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});