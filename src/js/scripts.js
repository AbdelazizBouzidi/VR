import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {DragControls} from 'three/examples/jsm/controls/DragControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import grid from '../img/Untitled.png';

let container;
			let camera, scene, scene2, renderer;
			let controller1, controller2;
			let controllerGrip1, controllerGrip2;

			let raycaster;

			const intersected = [];
			const tempMatrix = new THREE.Matrix4();

			let controls, group, groupprime, stigs, Stig1, Stig2, Stig3, Ring1, Ring2, Ring3, stigsPoses, selectionPhase;

			init();
			animate();

			function init() {

				selectionPhase = true
				container = document.createElement( 'div' );
				document.body.appendChild( container );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x808080 );

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
				camera.position.set( 0, 2, 6 );

				controls = new OrbitControls( camera, container );
				controls.target.set( 0, 1.6, 0 );
				controls.update();

				const floorGeometry = new THREE.PlaneGeometry( 400, 400 );
				const floorMaterial = new THREE.MeshStandardMaterial( {
					color: 0xeeeeee,
					roughness: 1.0,
					metalness: 0.0
				} );
				const floor = new THREE.Mesh( floorGeometry, floorMaterial );
				floor.rotation.x = - Math.PI / 2;
				floor.receiveShadow = true;
				floor.position.set(0,-50,0)
				scene.add( floor );

				scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

				const light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 0, 6, 0 );
				light.castShadow = true;
				light.shadow.camera.top = 2;
				light.shadow.camera.bottom = - 2;
				light.shadow.camera.right = 2;
				light.shadow.camera.left = - 2;
				light.shadow.mapSize.set( 4096, 4096 );
				scene.add( light );

				groupprime = new THREE.Group();
				scene.add( groupprime );
				// scene.add( floor );
                const ratio = 10
                const plateform = new THREE.BoxGeometry( 200/ratio, 2/ratio, 50/ratio );
                const plateformMaterial = new THREE.MeshStandardMaterial( {color: 0x000000} );
                const cube = new THREE.Mesh( plateform, plateformMaterial );
                cube.castShadow = true;
				cube.receiveShadow = true;
                groupprime.add( cube );

                const stig1 = new THREE.CylinderGeometry( 5/ratio, 5/ratio, 30/ratio, 32 );
                const stigMaterial1 = new THREE.MeshStandardMaterial( {color: 0x042940} );
                const cylinder1 = new THREE.Mesh( stig1, stigMaterial1 );
                cylinder1.castShadow = true;
				cylinder1.receiveShadow = true;
                groupprime.add( cylinder1 );
                cylinder1.position.set(-75/ratio,15/ratio,0)

                const stig2 = new THREE.CylinderGeometry( 5/ratio, 5/ratio, 30/ratio, 32 );
                const stigMaterial2 = new THREE.MeshStandardMaterial( {color: 0x042940} );
                const cylinder2 = new THREE.Mesh( stig2, stigMaterial2 );
                groupprime.add( cylinder2 );
                cylinder2.position.set(0,15/ratio,0)
                cylinder2.castShadow = true;
                cylinder2.receiveShadow = true;

                const stig3 = new THREE.CylinderGeometry( 5/ratio, 5/ratio, 30/ratio, 32 );
                const stigMaterial3 = new THREE.MeshStandardMaterial( {color: 0x042940} );
                const cylinder3 = new THREE.Mesh( stig3, stigMaterial3 );
                cylinder3.castShadow = true;
                cylinder3.receiveShadow = true;
                groupprime.add( cylinder3 );
                cylinder3.position.set(75/ratio,15/ratio,0)

				groupprime.position.set(0,-5,-15)

				scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

				group = new THREE.Group();
				groupprime.add( group );

				groupNonMoving = new THREE.Group();
				groupprime.add( groupNonMoving );

				const ringGeo1 = new THREE.TorusGeometry(9/ratio,3/ratio,256,256);
				const ringMat1 = new THREE.MeshStandardMaterial({color: 0xD6D58E});
				const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
				group.add(ringMesh1);
				ringMesh1.rotateX(3.14/2);
				ringMesh1.position.set(0,15/ratio,0);

				const ringGeo2 = new THREE.TorusGeometry(12/ratio,4/ratio,256,256);
				const ringMat2 = new THREE.MeshStandardMaterial({color: 0x9FC131});
				const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
				group.add(ringMesh2);
				ringMesh2.rotateX(3.14/2);
				ringMesh2.position.set(0,10/ratio,0);

				const ringGeo3 = new THREE.TorusGeometry(15/ratio,4/ratio,256,256);
				const ringMat3 = new THREE.MeshStandardMaterial({color: 0x005C53});
				const ringMesh3 = new THREE.Mesh(ringGeo3, ringMat3);
				group.add(ringMesh3);
				ringMesh3.rotateX(3.14/2);
				ringMesh3.position.set(0,5/ratio,0);

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
			stigsPoses = [[-75/ratio,15/ratio,0],[0,15/ratio,0],[75/ratio,15/ratio,0]] 
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
						ring.z = 5*this.availableSlots.lenght/ratio
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
						this.availableSlots[index].z = (index + 1) * 5 / ratio
						this.availableSlots[index].movement = false
					}
					if (this.availableSlots.length > 0) {
						this.availableSlots[this.availableSlots.length - 1].movement = true
					}
					
				} 

			}

			Ring1 = new Ring(ringMesh1, 0, 2, true)
			Ring2 = new Ring(ringMesh2, 1, 2,false)
			Ring3 = new Ring(ringMesh3, 2, 2,false)


			Stig1 = new Stig(cylinder1, 1)
			Stig1.init()
			Stig2 = new Stig(cylinder2, 2,[Ring3,Ring2,Ring1])
			Stig2.init()
			Stig3 = new Stig(cylinder3, 3)
			Stig3.init()

			stigs = [Stig1, Stig2, Stig3];



				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.outputEncoding = THREE.sRGBEncoding;
				renderer.shadowMap.enabled = true;
				renderer.xr.enabled = true;
				container.appendChild( renderer.domElement );

				document.body.appendChild( VRButton.createButton( renderer ) );

				// controllers

				controller1 = renderer.xr.getController( 0 );
				controller1.addEventListener( 'selectstart', onSelectStart );
				controller1.addEventListener( 'selectend', onSelectEnd );
				scene.add( controller1 );

				controller2 = renderer.xr.getController( 1 );
				controller2.addEventListener( 'selectstart', onSelectStart );
				controller2.addEventListener( 'selectend', onSelectEnd );
				scene.add( controller2 );

				const controllerModelFactory = new XRControllerModelFactory();

				controllerGrip1 = renderer.xr.getControllerGrip( 0 );
				controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
				scene.add( controllerGrip1 );

				controllerGrip2 = renderer.xr.getControllerGrip( 1 );
				controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
				scene.add( controllerGrip2 );


				const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

				const line = new THREE.Line( geometry );
				line.name = 'line';
				line.scale.z = 5;

				controller1.add( line.clone() );
				controller2.add( line.clone() );
				raycaster = new THREE.Raycaster();

				

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onSelectStart( event ) {

				const controller = event.target;
				selectionPhase= true
				const intersections = getIntersections( controller );

				if ( intersections.length > 0 ) {

					const intersection = intersections[ 0 ];

					const object = intersection.object;
					if ((Ring1.object === object && Ring1.movement) || (Ring2.object === object && Ring2.movement) || (Ring3.object === object && Ring3.movement)) {
						object.material.emissive.b = 1;
						controller.attach( object );
						controller.userData.selected = object;
					}
					

				}

			}

			function onSelectEnd( event ) {
				selectionPhase = false
				const controller = event.target;

				if ( controller.userData.selected !== undefined ) {

					const object = controller.userData.selected;
					object.material.emissive.b = 0;
					group.attach( object );

					controller.userData.selected = undefined;

				}


			}

			function getIntersections( controller ) {

				tempMatrix.identity().extractRotation( controller.matrixWorld );

				raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
				raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

				return raycaster.intersectObjects( group.children, false );

			}

			function intersectObjects( controller ) {

				// Do not highlight when already selected

				if ( controller.userData.selected !== undefined ) return;

				const line = controller.getObjectByName( 'line' );
				const intersections = getIntersections( controller );

				if ( intersections.length > 0 ) {

					const intersection = intersections[ 0 ];

					const object = intersection.object;
					object.material.emissive.r = 1;
					intersected.push( object );

					line.scale.z = intersection.distance;

				} else {

					line.scale.z = 5;

				}

			}

			function cleanIntersected() {

				while ( intersected.length ) {

					const object = intersected.pop();
					object.material.emissive.r = 0;

				}

			}

			//

			function animate() {

				

				renderer.setAnimationLoop( render );
				

			}

			function render() {

			
				// group.clear()
				// groupNonMoving.clear()
				// if (Ring1.movement) {
				// 	group.add(Ring1.object)
				// }
				// else{
				// 	groupNonMoving.add(Ring1.object)
				// }
				// if (Ring2.movement) {
				// 	group.add(Ring2.object)
				// }
				// else{
				// 	groupNonMoving.add(Ring2.object)
				// }
				// if (Ring3.movement) {
				// 	group.add(Ring3.object)
				// }
				// else{
				// 	groupNonMoving.add(Ring3.object)
				// }

				cleanIntersected();

				intersectObjects( controller1 );
				intersectObjects( controller2 );

				// console.log(selectionPhase)

				if (!selectionPhase) {
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
			console.log(actualPoses, mostSuitablePoses)
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
				}
				
			renderer.render( scene, camera );

			}


// const ringGeo1 = new THREE.TorusGeometry(9,3,256,256);
// const ringMat1 = new THREE.MeshBasicMaterial({color: 0xD6D58E});
// const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
// scene.add(ringMesh1);
// ringMesh1.rotateX(3.14/2);
// ringMesh1.position.set(0,15,0);

// const ringGeo2 = new THREE.TorusGeometry(12,4,256,256);
// const ringMat2 = new THREE.MeshBasicMaterial({color: 0x9FC131});
// const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
// scene.add(ringMesh2);
// ringMesh2.rotateX(3.14/2);
// ringMesh2.position.set(0,10,0);

// const ringGeo3 = new THREE.TorusGeometry(15,4,256,256);
// const ringMat3 = new THREE.MeshBasicMaterial({color: 0x005C53});
// const ringMesh3 = new THREE.Mesh(ringGeo3, ringMat3);
// scene.add(ringMesh3);
// ringMesh3.rotateX(3.14/2);
// ringMesh3.position.set(0,5,0);

// var rings = []; 
// rings.push(ringMesh1);
// rings.push(ringMesh2);
// rings.push(ringMesh3);
// var cylinders = []; 
// cylinders.push(cylinder1);
// cylinders.push(cylinder2);
// cylinders.push(cylinder3);

// // console.log(cylinder1.position.x,cylinder1.position.y,cylinder1.position.z)

// // var objects = [];
// // objects.push(ringMesh1)
// // objects.push(ringMesh2)
// // objects.push(ringMesh3)


// class Ring {
//     constructor(RingObject, Radius, stig = 0, Mouvment = false) {
//       this.object = RingObject;
//       this.radius = Radius;
//       this.movement = Mouvment;
//       this.stig = stig;
//       this.z = 0
//     }
//     reposition(x,y,z){
//         this.object.position.set(x,y,z)
//     }
//   }

// class Stig {
//     constructor(StigObject, StigId, AvailableSlots = []) {       
//       this.object = StigObject;
//       this.availableSlots = AvailableSlots;
//       this.stigId = StigId;
//     }

//     Add(ring){
//         // console.log(this.availableSlots.length)
//         if (this.availableSlots.length < 3) {
//             this.availableSlots.push(ring)
//             ring.z = 5*this.availableSlots.lenght
//             this.init()
//         }
//         else {
//             // console.log("No available slots");
//         };
//     }
//     remove(){

//             if (this.availableSlots.length > 0) {
//                 this.availableSlots.pop()
//                 if (this.availableSlots.length > 0) { 
//                 this.availableSlots[this.availableSlots.length-1].movement = true       
//             }}
            
//     }

//     init(){
//         for (let index = 0; index < this.availableSlots.length; index++) {
//             this.availableSlots[index].stig =  this.stigId 
//             this.availableSlots[index].z = (index + 1) * 5
//             this.availableSlots[index].movement = false
//         }
//         if (this.availableSlots.length > 0) {
//             this.availableSlots[this.availableSlots.length - 1].movement = true
//         }
//         // console.log(this.availableSlots)
        
//     } 

//   }

// const Ring1 = new Ring(ringMesh1, 0, 2, true)
// const Ring2 = new Ring(ringMesh2, 1, 2,false)
// const Ring3 = new Ring(ringMesh3, 2, 2,false)


// const Stig1 = new Stig(cylinder1, 1)
// Stig1.init()
// const Stig2 = new Stig(cylinder2, 2,[Ring3,Ring2,Ring1])
// Stig2.init()
// const Stig3 = new Stig(cylinder3, 3)
// Stig3.init()

// var stigs = [Stig1, Stig2, Stig3];



// const controls1 = new DragControls( [Ring1.object], camera, renderer.domElement );
// const controls2 = new DragControls( [Ring2.object], camera, renderer.domElement );
// const controls3 = new DragControls( [Ring3.object], camera, renderer.domElement );


// controls1.addEventListener( 'dragstart', function ( event ) {

//     orbit.enabled = false;

// } );


// controls1.addEventListener( 'dragend', function ( event ) {

//     orbit.enabled = true;

// } );
// controls2.addEventListener( 'dragstart', function ( event ) {

//     orbit.enabled = false;

// } );


// controls2.addEventListener( 'dragend', function ( event ) {

//     orbit.enabled = true;

// } );
// controls3.addEventListener( 'dragstart', function ( event ) {

//     orbit.enabled = false;

// } );


// controls3.addEventListener( 'dragend', function ( event ) {

//     orbit.enabled = true;

// } );





// var stigsPoses = [[-75,15,0],[0,15,0],[75,15,0]] 

//         camera.position.set(0,200,200)    
//         orbit.target.set(0, 3.5, 0);
//         orbit.update();
//         function animate() {
//             renderer.render(scene, camera);
            
//             controls1.enabled = Ring1.movement
            
//             controls2.enabled = Ring2.movement    
             
//             controls3.enabled = Ring3.movement
                   
//             dRing1 = [Math.sqrt(Math.pow(Stig1.object.position.x - Ring1.object.position.x,2)+ Math.pow(Stig1.object.position.y - Ring1.object.position.y,2) + Math.pow(Stig1.object.position.z - Ring1.object.position.z,2)),
//                       Math.sqrt(Math.pow(Stig2.object.position.x - Ring1.object.position.x,2)+ Math.pow(Stig2.object.position.y - Ring1.object.position.y,2) + Math.pow(Stig2.object.position.z - Ring1.object.position.z,2)),
//                       Math.sqrt(Math.pow(Stig3.object.position.x - Ring1.object.position.x,2)+ Math.pow(Stig3.object.position.y - Ring1.object.position.y,2) + Math.pow(Stig3.object.position.z - Ring1.object.position.z,2))]
//             dRing2 = [Math.sqrt(Math.pow(Stig1.object.position.x - Ring2.object.position.x,2)+ Math.pow(Stig1.object.position.y - Ring2.object.position.y,2) + Math.pow(Stig1.object.position.z - Ring2.object.position.z,2)),
//                       Math.sqrt(Math.pow(Stig2.object.position.x - Ring2.object.position.x,2)+ Math.pow(Stig2.object.position.y - Ring2.object.position.y,2) + Math.pow(Stig2.object.position.z - Ring2.object.position.z,2)),
//                       Math.sqrt(Math.pow(Stig3.object.position.x - Ring2.object.position.x,2)+ Math.pow(Stig3.object.position.y - Ring2.object.position.y,2) + Math.pow(Stig3.object.position.z - Ring2.object.position.z,2))]
//             dRing3 = [Math.sqrt(Math.pow(Stig1.object.position.x - Ring3.object.position.x,2)+ Math.pow(Stig1.object.position.y - Ring3.object.position.y,2) + Math.pow(Stig1.object.position.z - Ring3.object.position.z,2)),
//                       Math.sqrt(Math.pow(Stig2.object.position.x - Ring3.object.position.x,2)+ Math.pow(Stig2.object.position.y - Ring3.object.position.y,2) + Math.pow(Stig2.object.position.z - Ring3.object.position.z,2)),
//                       Math.sqrt(Math.pow(Stig3.object.position.x - Ring3.object.position.x,2)+ Math.pow(Stig3.object.position.y - Ring3.object.position.y,2) + Math.pow(Stig3.object.position.z - Ring3.object.position.z,2))]
//             mostSuitablePoses = [dRing1.indexOf(Math.min(...dRing1))+1, dRing2.indexOf(Math.min(...dRing2))+1, dRing3.indexOf(Math.min(...dRing3))+1]
//             actualPoses = [Ring1.stig, Ring2.stig, Ring3.stig]

//             // GameCondition = 
//             // console.log(GameCondition)
//             if (actualPoses[0] != mostSuitablePoses[0] && Ring1.movement) {
//                 stigs[actualPoses[0]-1].remove()
//                 stigs[mostSuitablePoses[0] - 1].Add(Ring1)
//             }
//             if (actualPoses[1] != mostSuitablePoses[1] && Ring2.movement) {
//                 stigs[actualPoses[1]-1].remove()
//                 stigs[mostSuitablePoses[1] - 1].Add(Ring2)

//             }
//             if (actualPoses[2] != mostSuitablePoses[2] && Ring3.movement) {
//                 stigs[actualPoses[2]-1].remove()
//                 stigs[mostSuitablePoses[2] - 1].Add(Ring3)
//             }
//             if (Ring1.movement) {
//                 Ring1.object.position.set(stigsPoses[mostSuitablePoses[0]-1][0],Ring1.z,stigsPoses[mostSuitablePoses[0]-1][2])
//             }
//             if (Ring2.movement) {
//                 Ring2.object.position.set(stigsPoses[mostSuitablePoses[1]-1][0],Ring2.z,stigsPoses[mostSuitablePoses[1]-1][2])
//             }
//             if (Ring3.movement) {
//                 Ring3.object.position.set(stigsPoses[mostSuitablePoses[2]-1][0],Ring3.z,stigsPoses[mostSuitablePoses[2]-1][2])
//             }
//             console.log(Ring1.z,Ring2.z,Ring3.z)
//                 // if (d1-dprevious[0]) {
//                     // if (d1 < d2 && d1 < d3) {
//                     //     NextRingsPositions[i] = 0
//                     //     ringsVerticalPositions[i] = NextRingsPositions[i] != ringsPositions[i] ?  5*stigsContent[0] + 5 : ringsVerticalPositions[i]
//                     //     objects[i].position.set(cylinder1.position.x,ringsVerticalPositions[i],cylinder1.position.z)
//                     //     ringsPositions[i] = 0
                        
//                     // }
//                     // else if (d2 < d1 && d2 < d3) {
//                     //     NextRingsPositions[i] = 1
//                     //     ringsVerticalPositions[i] = NextRingsPositions[i] != ringsPositions[i] ?  5*stigsContent[1] + 5 : ringsVerticalPositions[i] 
//                     //     objects[i].position.set(cylinder2.position.x,ringsVerticalPositions[i],cylinder2.position.z)
//                     //     ringsPositions[i] = 1
//                     // }
//                     // else {
//                     //     NextRingsPositions[i] = 2
//                     //     ringsVerticalPositions[i] = NextRingsPositions[i] != ringsPositions[i] ?  5*stigsContent[2] + 5 : ringsVerticalPositions[i]
//                     //     objects[i].position.set(cylinder3.position.x,ringsVerticalPositions[i],cylinder3.position.z)
//                     //     ringsPositions[i] = 2
    
//                     // }
//                     // if (d1 < d2 && d1 < d3) {
//                     //     if (objects2[i].movement) {
//                     //         destinationStig = 1
//                     //         Stig1.Add(objects2[i])
//                     //     }
//                     // }
//                     // else if (d2 < d1 && d2 < d3) {
//                     //     if (objects2[i].movement) {
//                     //         destinationStig = 2
//                     //         Stig2.Add(objects2[i])
//                     //     }
//                     // }
//                     // else if (d3 < d1 && d3 < d2){
//                     //     if (objects2[i].movement) {
//                     //         destinationStig = 3
//                     //         Stig3.Add(objects2[i])
//                     //     }         
//                     // }

//                     // if (previousS != destinationStig) {
//                     //     stigs[previousS - 1].remove()
//                     //     stigs[0].init()
//                     //     stigs[1].init()
//                     //     stigs[2].init()
//                     // }
                    
//                     // stigsContent[0] = ringsPositions.filter(x => x === 0).length
//                     // stigsContent[1] = ringsPositions.filter(x => x === 1).length
//                     // stigsContent[2] = ringsPositions.filter(x => x === 2).length
//                     // console.log(ringsVerticalPositions)
//                     // console.log(ringsVerticalPositions)
//                 // }
                

//             }
    

// renderer.setAnimationLoop(animate);

// window.addEventListener('resize', function() {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
// });