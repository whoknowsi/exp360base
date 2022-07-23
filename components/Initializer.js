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
    InitGlobalConfigAfterCanvasIsCreated()
    
    document.querySelector("a-assets").addEventListener("loaded", () => {
        //InitImagesGPU()
        SetInitialPosition()
        SetInitialSky()
    })
}

const InitGlobalConfigAfterCanvasIsCreated = () => {
    const targetNode = document.querySelector("a-scene")
    const config = { childList: true, subtree: true }

    const callback = (mutationsList, observer) => {
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

const InitImagesGPU = async () => {
    let assets = Array.from(document.querySelector("a-assets").children)
    let renderer = document.querySelector("a-scene").renderer

    await Promise.all(assets.map(async (asset) => {
        if(asset.getAttribute("id").includes("-H")) { return }
        let fileName = asset.getAttribute("src")
        const texture = await new THREE.TextureLoader().loadAsync(fileName)
        await renderer.initTexture(texture) 
    }))
}


const CreateAframeHTML = (data) => {
    let scene = document.createElement("a-scene")
    scene.setAttribute("stats", "")
    if (device == "desktop") {
        scene.setAttribute("renderer", "antialias: true; precision: high; maxCanvasWidth: 1920; maxCanvasHeight: 1920")
    } else {
        scene.setAttribute("renderer", "antialias: false; precision: low; maxCanvasWidth: 720; maxCanvasHeight: 720")
    }

    let assetsContainer = CreateAssets(data)
    scene.appendChild(assetsContainer)

    let cameraContainer = CreateCamera()
    scene.appendChild(cameraContainer)

    if(device == "desktop") {
        let cursorVisualContainer = CreateVisualCursor()
        scene.appendChild(cursorVisualContainer)
    }

    let geometriesContainer = CreateGeometries(data)
    let skiesContainer = CreateSkies(currentSky.target)
    scene.appendChild(skiesContainer)
    scene.appendChild(geometriesContainer)

    let raycaster = CreateRaycaster()
    scene.appendChild(raycaster)

    document.body.appendChild(scene)
}

const SetInitialPosition = () => {
    let geometriesContainer = document.querySelector("#geometriesContainer")
    let position = new THREE.Vector3(-currentSky.position.x, -currentSky.position.y + SkyMiddleHeight(), -currentSky.position.z)
    geometriesContainer.setAttribute("position", position)
}

const SetInitialSky = () => {
    let sky1 = document.querySelector("#sky1")
    let sky2 = document.querySelector("#sky2")

    if(sky1 == null || sky2 == null) { return }

    sky1.setAttribute("src", "#" + currentSky.target)
    sky2.setAttribute("src", "#" + currentSky.target)

    sky1.setAttribute("rotation", currentSky.rotation)
    sky2.setAttribute("rotation", currentSky.rotation)

    let img = document.createElement("img")
    img.onload = () => {
        sky1.setAttribute("src","./img/skies/1664/" + currentSky.target + ".jpg")
        sky2.setAttribute("src", "./img/skies/1664/" + currentSky.target + ".jpg")
    } 
    img.onerror = () => {}
    img.src = "./img/skies/1664/" + currentSky.target + ".jpg"
}

const CreateAssets = (data) => {
    let assetContainer = document.createElement("a-assets")

    data.skyAssets.forEach(skyAsset => {
        let img = document.createElement("img")
        let fileName = "./img/skies/832/" + skyAsset

        img.setAttribute("id", skyAsset.split(".")[0])
        img.setAttribute("src", fileName)

        // let img2 = document.createElement("img")
        // let fileName2 = "./img/skies/1664/" + skyAsset

        // img2.setAttribute("id", skyAsset.split(".")[0] + "-H")
        // img2.setAttribute("src", fileName2)

        assetContainer.appendChild(img)
        //assetContainer.appendChild(img2)
    })


    
    return assetContainer
}

const CreateCamera = () => {
    let cameraContainer = document.createElement("a-entity")
    cameraContainer.setAttribute("camera-check", "")
    cameraContainer.setAttribute("id", "cameraContainer")
    cameraContainer.setAttribute("animation__inertia", "startEvents: inertia; property: rotation; dur: 1500; easing: easeOutQuint; pauseEvents: pause-anim")
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
    geometriesContainer.setAttribute("animation__move", "startEvents: move; property: position; dur: 1000; to: 0 0 0; from: 0 0 0; elasticity: 0; easing: easeOutSine")

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
    sky1.setAttribute("animation__move", "startEvents: move; property: position; dur: 1000; from: 0 0 0; to: 0 0 0; easing: easeOutSine")

    let sky2 = document.createElement("a-sky")
    sky2.setAttribute("geometry", {
        radius: 100
    })
    sky2.setAttribute("id", "sky2")
    sky2.setAttribute("src", "#" + currentSky)
    sky2.setAttribute("animation__fade", "startEvents: fade; property: material.opacity; dur: 1000; from: 1; to: 0; easing: easeOutSine")
    sky2.setAttribute("animation__move", "startEvents: move; property: position; dur: 1000; from: 0 0 0; to: 0 0 0; easing: easeOutSine")

    skyContainer.appendChild(sky1)
    skyContainer.appendChild(sky2)
    return skyContainer
}

const CreateStructures = (structures) => {

    let structureGeometries = []

    structures.forEach(structure => {
        let structureGeometry = CreateGeometry(structure)
        structureGeometries.push(structureGeometry)
    })

    let geometries = []
    structureGeometries.forEach(structure => {
        if (structure.type === "Mesh") {
            const geometry = structure.geometry.clone()
            geometry.translate(structure.position.x, structure.position.y, structure.position.z)
            geometries.push(geometry)
        }
    })

    const mergedGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
    const mergedMaterial = new THREE.MeshStandardMaterial({ opacity: 0, side: THREE.DoubleSide, transparent: true, color: "black" });

    let structureEl = document.createElement("a-entity")
    structureEl.setAttribute("id", "structureContainer")

    const mergedMesh = new THREE.Mesh(mergedGeo, mergedMaterial);
    structureEl.object3D.add(mergedMesh)
    structureEl.setAttribute("class", "structure")
    structureEl.setAttribute("raycaster-listener", "")

    return structureEl
}

const CreateGeometry = (structure) => {

    let geometry 
    if(structure.primitive == "box") {
        geometry = new THREE.BoxGeometry(structure.width, structure.height, structure.depth)
    } else if(structure.primitive == "cylinder") {
        geometry = new THREE.CylinderGeometry(structure.radius, structure.radius, structure.height)
    }
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(structure.position.x, structure.position.y, structure.position.z)

    return mesh
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
        radius: skyHeight
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