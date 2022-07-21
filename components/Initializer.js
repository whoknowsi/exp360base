const Init = async () => {
    const results = await fetch("./data/data.json")
    const data = await results.json()

    document.readyState !== 'loading'
        ? InitCode(data)
        : document.addEventListener('DOMContentLoaded', InitCode(data))
}

Init()

const InitCode = (data) => {
    CreateAframeHTML(data)
    SetInitialPosition()
    SetInitialSky()
    InitGlobalConfigAfterCanvasIsCreated()
}

const InitGlobalConfigAfterCanvasIsCreated = () => {
    const targetNode = document.querySelector("a-scene")
    const config = { childList: true, subtree: true }

    const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                let mutationAddedNodes = Array.from(mutation.addedNodes)
                mutationAddedNodes.forEach(mutationAddedNode => {
                    if (mutationAddedNode.nodeName.toLowerCase() == "canvas") {
                        InitGlobalConfig()
                        observer.disconnect()
                    }

                })
            }
        }
    }

    const observer = new MutationObserver(callback)
    observer.observe(targetNode, config)
}

const CreateAframeHTML = (data) => {
    let scene = document.createElement("a-scene")
    scene.setAttribute("stats", "")
    if (device == "desktop") {
        scene.setAttribute("renderer", "antialias: true; precision: high; maxCanvasWidth: 1920; maxCanvasHeight: 1920")
    } else {
        scene.setAttribute("renderer", "antialias: false; precision: low; maxCanvasWidth: 1280; maxCanvasHeight: 1280")
    }

    let assetsContainer = CreateAssets(data)
    scene.appendChild(assetsContainer)

    let cameraContainer = CreateCamera()
    scene.appendChild(cameraContainer)

    if(device == "desktop") {
        let cursorVisualContainer = CreateVisualCursor()
        scene.appendChild(cursorVisualContainer)
    }

    let raycaster = CreateRaycaster()
    scene.appendChild(raycaster)

    let geometriesContainer = CreateGeometries(data)
    scene.appendChild(geometriesContainer)

    let skiesContainer = CreateSkies(currentSky.target)
    scene.appendChild(skiesContainer)

    document.body.appendChild(scene)
}

const SetInitialPosition = () => {
    let cameraContainer = document.querySelector("#cameraContainer")
    let position = new THREE.Vector3(currentSky.position.x, currentSky.position.y + Height(), currentSky.position.z)
    cameraContainer.setAttribute("position", position)
}

const SetInitialSky = () => {
    let sky1 = document.querySelector("#sky1")
    let sky2 = document.querySelector("#sky2")
    let skyConatiner = document.querySelector("#skyContainer")

    sky1.setAttribute("src", "#" + currentSky.target)
    sky2.setAttribute("src", "#" + currentSky.target)

    skyConatiner.setAttribute("position", currentSky.position)

    //let rotation = new THREE.Vector3(currentSky.rotation.split(" ")[0], currentSky.rotation.split(" ")[1], currentSky.rotation.split(" ")[2])
    skyConatiner.setAttribute("rotation", currentSky.rotation)

}

const CreateAssets = (data) => {
    let assetContainer = document.createElement("a-assets")

    data.skyAssets.forEach(skyAsset => {
        let img = document.createElement("img")

        img.setAttribute("id", skyAsset.split(".")[0])
        img.setAttribute("src", "./img/skies/" + skyAsset)

        assetContainer.appendChild(img)
    })

    return assetContainer
}

const CreateCamera = () => {
    let cameraContainer = document.createElement("a-entity")
    cameraContainer.setAttribute("camera-check", "")
    cameraContainer.setAttribute("id", "cameraContainer")
    cameraContainer.setAttribute("animation__inertia", "startEvents: inertia; property: rotation; dur: 1000; easing: easeOutQuint; pauseEvents: pause-anim")
    cameraContainer.setAttribute("animation__moveNextSky", "startEvents: moveNextSky; property: position; dur: 1000; to: 0 0 0; from: 0 0 0; easing: easeOutQuint")
    cameraContainer.setAttribute("position", "0 " + Height() + " 0")

    let camera = document.createElement("a-camera")
    camera.setAttribute("position", "0 0 0")
    camera.setAttribute("look-controls-enabled", "false")
    camera.setAttribute("wasd-controls-enabled", "false")

    cameraContainer.appendChild(camera)
    return cameraContainer
}

const CreateVisualCursor = () => {
    let cursorContainer = document.createElement("a-entity")
    cursorContainer.setAttribute("id", "cursor")

    let outterRing = document.createElement("a-ring")
    outterRing.setAttribute("geometry", {
        radiusInner: 0.2,
        radiusOuter: 0.19
    })
    outterRing.setAttribute("material", {
        opacity: .8,
        color: "white",
        side: "double",
        shader: "flat",
        alphaTest: .5
    })

    let innerRing = document.createElement("a-ring")
    innerRing.setAttribute("geometry", {
        radiusInner: 0.1825,
        radiusOuter: 0.13
    })
    innerRing.setAttribute("material", {
        opacity: .5,
        color: "white",
        side: "double",
        shader: "flat",
        alphaTest: .5
    })

    cursorContainer.appendChild(outterRing)
    cursorContainer.appendChild(innerRing)

    return cursorContainer
}

const CreateRaycaster = () => {
    let raycaster = document.createElement("a-entity")

    raycaster.setAttribute("raycaster-element", "")
    raycaster.setAttribute("cursor", "rayOrigin: mouse")
    raycaster.setAttribute("id", "raycaster")
    raycaster.setAttribute("raycaster", "objects: .structure, .skySpot, .hotSpot")
    raycaster.setAttribute("position", "0 " + Height() + " 0")

    return raycaster
}

const CreateGeometries = (data) => {
    let geometriesContainer = document.createElement("a-entity")
    geometriesContainer.setAttribute("id", "geometriesContainer")

    let structuresEl = CreateStructures(data.structures)
    geometriesContainer.appendChild(structuresEl)

    let skySpotsEl = CreateSkySpots(data.skySpots)
    geometriesContainer.appendChild(skySpotsEl)

    let hotSpotsEl = CreateHotSpots(data.hotSpots)
    geometriesContainer.appendChild(hotSpotsEl)

    return geometriesContainer
}

const CreateSkies = (currentSky) => {
    let skyContainer = document.createElement("a-entity")
    skyContainer.setAttribute("id", "skyContainer")

    let sky1 = document.createElement("a-sky")
    sky1.setAttribute("geometry", {
        radius: 100
    })
    sky1.setAttribute("id", "sky1")
    sky1.setAttribute("src", "#" + currentSky)

    let sky2 = document.createElement("a-sky")
    sky2.setAttribute("geometry", {
        radius: 100
    })
    sky2.setAttribute("id", "sky2")
    sky2.setAttribute("src", "#" + currentSky)

    skyContainer.appendChild(sky1)
    skyContainer.appendChild(sky2)
    return skyContainer
}

const CreateStructures = (structures) => {
    let structureContainer = document.createElement("a-entity")
    structureContainer.setAttribute("id", "structureContainer")

    structures.forEach(structure => {
        let structureEl = CreateStructure(structure)
        structureContainer.appendChild(structureEl)
    })

    return structureContainer
}

const CreateStructure = (structure) => {
    let structureEl = document.createElement("a-" + structure.primitive)

    structureEl.setAttribute("id", structure.id)
    structureEl.setAttribute("geometry", {
        radius: structure.radius,
        width: structure.width,
        height: structure.height,
        depth: structure.depth
    })
    structureEl.setAttribute("material", {
        opacity: 0
    })
    structureEl.setAttribute("class", "structure")
    structureEl.setAttribute("position", structure.position.x + " " + structure.position.y + " " + structure.position.z)
    structureEl.setAttribute("raycaster-listener", "")

    return structureEl
}

const CreateSkySpots = (skySpots) => {
    let skySpotsContainer = document.createElement("a-entity")

    skySpots.forEach(skySpot => {
        let skySpotEl = CreateSkySpot(skySpot)
        skySpotsContainer.appendChild(skySpotEl)
    })

    return skySpotsContainer
}

const CreateSkySpot = (skySpot) => {
    let spotEl = document.createElement("a-entity")
    spotEl.setAttribute("id", skySpot.target)
    spotEl.classList.add("skySpot")
    if (skySpot.current) {
        currentSky = skySpot
        spotEl.classList.add("current")
    }
    spotEl.setAttribute("rotation", "90 0 0")
    spotEl.setAttribute("position", skySpot.position.x + " " + skySpot.position.y + " " + skySpot.position.z)
    spotEl.setAttribute("change-sky", "target: " + skySpot.target + "; rotation: " + skySpot.rotation)
    spotEl.setAttribute("geometry", {
        primitive: "circle",
        radius: .2
    })
    spotEl.setAttribute("material", {
        opacity: "0",
        side: "double"
    })

    let spotInnerRing = document.createElement("a-entity")
    spotInnerRing.setAttribute("geometry", {
        primitive: "ring",
        radiusInner: .1825,
        radiusOuter: .13
    })
    spotInnerRing.setAttribute("material", {
        opacity: ".3",
        side: "double",
        shader: "flat"
    })

    spotEl.appendChild(spotInnerRing)

    return spotEl
}

const CreateHotSpots = (hotSpots) => {
    let hotSpotsContainer = document.createElement("a-entity")

    hotSpots.forEach(hotSpot => {
        let hotSpotEl = CreateHotSpot(hotSpot)
        hotSpotsContainer.appendChild(hotSpotEl)
    })

    return hotSpotsContainer
}

const CreateHotSpot = (hotSpot) => {
    let hotSpotContainer = document.createElement("a-entity")

    let line = document.createElement("a-entity")
    line.setAttribute("line", {
        start: hotSpot.startPosition,
        end: hotSpot.endPosition,
        color: "white",
        opacity: 0.99
    })

    let target = document.createElement("a-image")
    target.setAttribute("id", hotSpot.id)
    target.setAttribute("position", hotSpot.position)
    target.setAttribute("geometry", {
        primitive: "circle",
        radius: .1
    })
    target.classList.add("hotSpot")
    target.setAttribute("material", {
        color: "white"
    })
    target.setAttribute("hot-spot",
        "title: " + hotSpot.title +
        "; description: " + hotSpot.description +
        "; image: " + hotSpot.image
    )

    hotSpotContainer.appendChild(line)
    hotSpotContainer.appendChild(target)

    return hotSpotContainer
}