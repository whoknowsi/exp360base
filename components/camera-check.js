let rotating, animating
let widthRangeFromMinusOneToOne, heightRangeFromMinusOneToOne
let startPoint, prevRotationContainer, newRotationContainer
let time, rotation, deltaRotation, deltaTime
let cameraContainer 
let myTimeOut

AFRAME.registerComponent('camera-check', {
    init: function () {
        cameraContainer = document.querySelector("#cameraContainer")
        
        if(device == "desktop") {
            this.mouse = pointer
            document.querySelector("canvas").addEventListener('mousedown', (evt) => onDownHandler(evt, pointer))
            document.querySelector("canvas").addEventListener('mouseup', onUpHandler)
            
        }
        else if(device == "mobile" || "tablet") {
            this.mouse = touch
            document.querySelector("canvas").addEventListener('touchstart', (evt) => onDownHandler(evt, touch))
            document.querySelector("canvas").addEventListener('touchend', onUpHandler)
        }

        


    },
    tick: function() {
        if(rotating) {
            if(time < Date.now()-10) {            
                let cameraContainerRotation = cameraContainer.getAttribute("rotation")
                let newRotation = {
                    x: cameraContainerRotation.x, 
                    y: cameraContainerRotation.y,
                }
                let newTime = Date.now()
                deltaRotation = {
                    x: newRotation.x - rotation.x,
                    y: newRotation.y - rotation.y
                }
                deltaTime = newTime - time 
                rotation = newRotation
                time = newTime
            }

            
            let newRotation = {
                x: prevRotationContainer.x - ((this.mouse.y-startPoint.y)*60),
                y: prevRotationContainer.y + ((this.mouse.x-startPoint.x)*60)
            }
            
            if(newRotation.x > 90) newRotation.x = 90
            if(newRotation.x < -90) newRotation.x = -90

            cameraContainer.setAttribute("rotation", newRotation.x + " " + newRotation.y + " 0")
        }
    }
});

const onDownHandler = (evt, mouse) => {
    if(device == "mobile" || device == "tablet")
        onTouchMove(evt)
        
    rotating = true
    if(animating) {
        cameraContainer.emit("pause-anim")
        animating = false
        clearTimeout(myTimeOut)
    }
    
    startPoint = {
        x: mouse.x,
        y: mouse.y
    }
    
    let cameraContainerRotation = cameraContainer.getAttribute("rotation")
    prevRotationContainer = {
        x: cameraContainerRotation.x, 
        y: cameraContainerRotation.y
    }

    time = Date.now()
    rotation = cameraContainerRotation
}

const onUpHandler = () => {
    rotating = false
    let cameraContainerRotation = cameraContainer.getAttribute("rotation")
    newRotationContainer = {
        x: cameraContainerRotation.x,
        y: cameraContainerRotation.y,
        z: cameraContainerRotation.z,
    }
    let duration = cameraContainer.components.animation__inertia.data.dur
    let from = { 
        x: newRotationContainer.x,
        y: newRotationContainer.y,
    }
    let to = {
        x: from.x + 90*deltaRotation.x/deltaTime,
        y: from.y + 90*deltaRotation.y/deltaTime,
    }

    if(to.x > 90) to.x = 90   
    if(to.x < -90) to.x = -90

    cameraContainer.components.animation__inertia.data.from = from.x + " " + from.y + " 0"
    cameraContainer.components.animation__inertia.data.to = to.x + " " + to.y + " 0"
    cameraContainer.emit('inertia');

    animating = true
    myTimeOut = setTimeout(() => {
        animating = false
    }, duration);
}