// const structuresObj3D = []
// const raycaster = new THREE.Raycaster();

// AFRAME.registerComponent('raycaster-listener', {
//     init: function () {
//         camera = document.querySelector("a-camera").components.camera.camera
//         //document.querySelector(".a-canvas").addEventListener('touchstart', onMouseMove)

//         this.el.addEventListener('mousedown', () => OnMouseDown())
//         this.el.addEventListener('mouseup', (evt) => OnMouseUp(evt, this.el))
//     },
//     tick: function() {
//         raycaster.setFromCamera(pointer, camera)
//         console.log(document.querySelector("#structureContainer").children)
//         const intersects = raycaster.intersectObjects(document.querySelector("#structureContainer").children)

//         console.log(intersects)
//     }
// })