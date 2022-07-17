var rotating
var animating
var widthRangeFromMinusOneToOne, heightRangeFromMinusOneToOne
var startPoint, endPoint
var prevRotation, newRotation, prevRotationContainer, newRotationContainer
var time, rotation
var cameraContainer = document.querySelector("#cameraContainer")
var myTimeOut

AFRAME.registerComponent('camera-check', {
    init: function () {
        var startTime, finalTime
        let camera = document.querySelector("#cameraContainer")

        document.addEventListener('mousedown', function(evt) {
            let isMouseEvent = evt.target.classList.contains("a-canvas")
            if(!isMouseEvent) { return }
            
            console.log("pressed")
            rotating = true
            if(animating) {
                cameraContainer.emit("pause-anim")
                animating = false
                clearTimeout(myTimeOut)
            }
            
            startPoint = {
                x: widthRangeFromMinusOneToOne,
                y: heightRangeFromMinusOneToOne
            }
            
            let cameraContainerRotation = cameraContainer.getAttribute("rotation")
            prevRotationContainer = {
                x: cameraContainerRotation.x, 
                y: cameraContainerRotation.y
            }

            time = Date.now()
            rotation = cameraContainerRotation
        })

        document.addEventListener('mouseup', function(evt) {
            let isMouseEvent = evt.target.classList.contains("a-canvas")
            if(!isMouseEvent) { return }

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

            
        })
        document.addEventListener("mousemove", (event) => {
            widthRangeFromMinusOneToOne = ((event.clientX / innerWidth) * 2 - 1)
            heightRangeFromMinusOneToOne = ((event.clientY / innerHeight) * 2 - 1)
        })
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
                x: prevRotationContainer.x + ((heightRangeFromMinusOneToOne-startPoint.y)*60),
                y: prevRotationContainer.y + ((widthRangeFromMinusOneToOne-startPoint.x)*60)
            }

            if(newRotation.x > 90) newRotation.x = 90
            if(newRotation.x < -90) newRotation.x = -90
            
            cameraContainer.setAttribute("rotation", newRotation.x + " " + newRotation.y + " 0")
        }
    }
});