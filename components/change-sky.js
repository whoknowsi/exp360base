let allSkies

AFRAME.registerComponent('change-sky', {
    schema: {
        target: {
            type: 'string'
        },
        rotation: {
            type: 'string'
        }
    },
    init: function () {
        let data = this.data;
        let el = this.el;
        let sky1 = document.querySelector("#sky1")
        let sky2 = document.querySelector("#sky2")
        el.addEventListener('click', evt => {
            ChangeSky(evt, data, el, sky1, sky2)
        })
        el.addEventListener('raycaster-intersected', evt => {
            if (device == "mobile" || device == "tablet") {
                ChangeSky(evt, data, el, sky1, sky2)
            }
            el.firstChild.setAttribute("material", "opacity", .6)
        })
        el.addEventListener('raycaster-intersected-cleared', evt => {
            el.firstChild.setAttribute("material", "opacity", .3)
        })
    }
})

function ChangeSky(evt, data, el, sky1, sky2) {
    if (IsMoving()) { return }
    if (sky1.getAttribute("src") == data.target || sky2.getAttribute("src") == data.target) { return }
    
    // let cameraContainer = document.querySelector("#cameraContainer")
    // console.log(cameraContainer.components.animation__moveNextSky)
    // cameraContainer.components.animation__moveNextSky.data.to = targetPoint
    // cameraContainer.components.animation__moveNextSky.data.from = document.querySelector("#cameraContainer").object3D.position
    // cameraContainer.emit("moveNextSky")

    let targetSkyPosition = evt.target.object3D.position
    let endPosition = targetSkyPosition.x + " " + (targetSkyPosition.y + Height()) + " " + targetSkyPosition.z 
    document.querySelector("#sky1").setAttribute("src", "#" + evt.target.getAttribute("id"))
    document.querySelector("#sky2").setAttribute("src", "#" + evt.target.getAttribute("id"))
    cameraContainer.setAttribute("position", endPosition)
    document.querySelector("#skyContainer").setAttribute("rotation", evt.target.getAttribute("change-sky").rotation)
    document.querySelector("#skyContainer").setAttribute("position", endPosition)
}

function MakeTransitionBetweenSkies(data, targetSkyPosition, texture) {
    let sky1 = document.querySelector("#sky1")
    let sky2 = document.querySelector("#sky2")

    sky2.components.animation__movein.data.from = targetSkyPosition.x + " " + targetSkyPosition.y + " " + targetSkyPosition.z
    sky2.emit("movein")
    sky1.emit("fadeout")

    if (data.rotation != "") {
        sky2.setAttribute("rotation", data.rotation)
    } else {
        sky2.setAttribute("rotation", "0 0 0")
    }

    setTimeout(() => {
        if (data.rotation != "") {
            sky1.setAttribute("rotation", data.rotation)
        } else {
            sky1.setAttribute("rotation", "0 0 0")
        }

        sky1.setAttribute("material", "src", "#" + data.target)
        sky1.object3D.children[0].material.map = texture
        sky1.object3D.children[0].material.opacity = 1

        sky1.object3D.children[0].material.needsUpdate = true;
        sky1.setAttribute("position", "0 0 0")

        //PreloadCloseSkies(data)

        UnsetMoving()
    }, 600)

}

function SetMoving() {
    let structureContainer = document.querySelector("#geometriesContainer")
    structureContainer.classList.add("moving")
}
function UnsetMoving() {
    let structureContainer = document.querySelector("#geometriesContainer")
    structureContainer.classList.remove("moving")
}
function IsMoving() {
    let structureContainer = document.querySelector("#geometriesContainer")
    return structureContainer.classList.contains("moving")
}

let InitAFrameSky = () => {
    let skySpots = document.querySelectorAll(".skyChanger")
    skySpots.forEach(spot => {
        spot.setAttribute("change-sky", "")
    })
}

// InitAFrameSky()

const PreloadCloseSkies = (data) => {
    let skies = JSON.parse(sessionStorage.getItem('skies'))
    let skiesToPreload = []
    let currentPosition = skies.filter(sky => sky.target == data.target)[0].position

    skies.forEach(sky => {
        let currentVectorPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
        let skyVectorPosition = new THREE.Vector3(sky.position.x, sky.position.y, sky.position.z)
        let distance = currentVectorPosition.distanceTo(skyVectorPosition)

        if(distance < 10 && !sky.loaded) skiesToPreload.push(sky)     
    })


    let interval = 200
    let promise = Promise.resolve();
    skiesToPreload.forEach(sky => {
        promise = promise.then(function () {
            PreloadSky(sky)
            return new Promise(function (resolve) {
                setTimeout(resolve, interval);
            })
        })
    })

    promise.then(function () {
        sessionStorage.setItem('skies', "[" + skies.map((sky) => {
            let skyObj = sky
            if(skiesToPreload.map(sky => sky.target).includes(sky.target)) {
                skyObj = {
                    target: sky.target,
                    position: sky.position,
                    loaded: true
                }
            }
            return JSON.stringify(skyObj)
        }) + "]")
    });
}

const PreloadSky = (sky) => {
    let sky2 = document.querySelector("#sky2")
    sky2.setAttribute("src", "#" + sky.target)
}

