var currentSky

const Init = async () => {
    const results = await fetch("./data/data.json")
    const data = await results.json()

    await LoadStructures(data)
    await AddAssets(data)
    
    
    document.addEventListener("DOMContentLoaded", () => {
        let currentSky = GetCurrentSky(data)
        SetFirstSky(currentSky)
        PreloadAllSkies(data, currentSky.position)
    })
}

const PreloadAllSkies = (data, currentPosition) => {
    let skies = data.skySpots
    let skiesToPreload = []

    skies.forEach(sky => {
        let currentVectorPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z)
        let skyVectorPosition = new THREE.Vector3(sky.position.x, sky.position.y, sky.position.z)
        let distance = currentVectorPosition.distanceTo(skyVectorPosition)

        if(distance < 100) skiesToPreload.push(sky)     
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
        let skyEl = document.querySelector("#temporalSky")
        skyEl != null && skyEl.remove()
        var data = JSON.parse(sessionStorage.getItem('skies'))
        sessionStorage.setItem('skies', "[" + data.map((sky) => {
            let skyObj = sky
            if(skiesToPreload.map(sky => sky.target).includes(sky.target)) {
                console.log("here")
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
    let skyEl = document.querySelector("#temporalSky")
    if(skyEl == null) { 
        skyEl = document.createElement("a-sky")
        skyEl.setAttribute("id", "temporalSky")
        skyEl.setAttribute("material", "opacity", 0)
        document.querySelector("#scene").appendChild(skyEl)
    }
    skyEl.setAttribute("src", "#" + sky.target)
}


Init()

const AddAssets = async (data) => {
    let currentSky
    data.skySpots.forEach(skySpot => {
        if(skySpot.current) currentSky = skySpot.id.split("-pointer")[0]
    })

    sessionStorage.setItem('skies', "[" + data.skySpots.map((sky) => {

        let skyObj = {
            target: sky.target,
            position: sky.position,
            loaded: false
        }
        console.log(skyObj)
        return JSON.stringify(skyObj)
    }) + "]")

    await preloadImages(data.skyAssets)
}

async function preloadImages(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function(evt) {
            window.THREE.Cache.add(evt.path[0].getAttribute("src"), evt.path[0])
        }
        list.push(img);
        img.src = "./img/skies/" + array[i];
        img.id = array[i].split(".")[0]
        document.getElementById('assets').appendChild(img)
    }
}

const GetCurrentSky = (data) => {
    let currenSky 

    let skies = data.skySpots
    skies.forEach(sky => {
        if(sky.current) currenSky = sky
    })

    return currenSky
}

const SetFirstSky = (current) => {
    let sky1 = document.querySelector("#sky")
    let sky2 = document.querySelector("#sky2")
    let structureContainer = document.querySelector("#structure-container")
    console.log("./img/skies/" + current.target + ".jpg")

    sky1.object3D.children[0].material.map = new THREE.TextureLoader().load("./img/skies/" + current.target + ".jpg")
    sky1.object3D.children[0].material.needsUpdate = true;

    sky2.object3D.children[0].material.map = new THREE.TextureLoader().load("./img/skies/" + current.target + ".jpg")
    sky2.object3D.children[0].material.needsUpdate = true;
    console.log(THREE.Cache)
    // ESPERAR A QUE LA IMAGEN SE CARGUE ANTES DE PONERLA
    sky1.setAttribute("rotation", currentSky.rotation)
    sky2.setAttribute("rotation", currentSky.rotation)
    structureContainer.setAttribute("position", currentSky.position)
}

const LoadStructures = async (data) => {
    CreateSavedElements(data)
}


function CreateSavedElements(data) {
    let skySpots = data.skySpots
    let structures = data.structures
    let infoSpots = data.infoSpots
    let structureContainer = document.querySelector("#structure-container")


    let skySpotsContainer = document.createElement("a-entity")

    skySpots.forEach(spot => {
        skySpotsContainer.appendChild(CreateSkySpot(spot))
    });
    let elements = []
    structures.forEach(structure => {
        //geometries.push(CreateStructure(structure))
        //structureElements.push(CreateStructure(structure))
        let elem = CreateStructure(structure)
        elements.push(elem)
        structureContainer.appendChild(elem)
    })

    infoSpots.forEach(infoSpot => {
        structureContainer.appendChild(CreateInfoSpot(infoSpot))
    })

    // const mergedGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
    // const mergedMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, vertexColors: THREE.FaceColors });
    // const mergedMesh = new THREE.Mesh(mergedGeo, mergedMaterial);
    // let mergedMeshEl = document.createElement("a-box")
    let structuresEl = document.createElement("a-entity")
    structuresEl.setAttribute("class", "structure collidable")
    structureContainer.appendChild(skySpotsContainer)
    structureContainer.appendChild(structuresEl)

    let skyspots = document.querySelectorAll(".skyChanger")
    //structureContainer.appendChild(mergedMeshEl)

    setTimeout(function() {
        
        let geometries = []
        elements.forEach(x => {
            let node = x.object3D.children[0]
            if (node.type === "Mesh") {
                const geometry = node.geometry.clone();
                geometry.applyMatrix4(node.parent.matrix);
                geometries.push(geometry)

                node.parent.el.remove();
                node.geometry.dispose();
                node.material.dispose();
            }
        })

        const mergedGeo = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        const mergedMaterial = new THREE.MeshStandardMaterial({ opacity: 0, alphaTest: 0.5, color: "black" });

        const mergedMesh = new THREE.Mesh(mergedGeo, mergedMaterial);
        structuresEl.object3D.add(mergedMesh)
        structuresEl.setAttribute("raycaster-listener", "")
    }, 1000);

}

function CreateSkySpot(spot) {
    let spotEl = document.createElement("a-entity")
    spotEl.setAttribute("id", spot.id)
    spotEl.classList.add("skyChanger")
    if (spot.current) {
        spotEl.classList.add("current")
        currentSky = {
            id: spot.id,
            rotation: spot.rotation,
            position: (-spot.position.x) + " " + (-spot.position.y + .2 / 2) + " " + (-spot.position.z),
        }
    }
    spotEl.setAttribute("rotation", "90 0 0")
    spotEl.setAttribute("position", spot.position.x + " " + spot.position.y + " " + spot.position.z)
    spotEl.setAttribute("change-sky", "target: " + spot.target + "; rotation: " + spot.rotation)
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

function CreateStructure(structure) {

    const geometry = new THREE.BoxGeometry(structure.width, structure.height, structure.depth)
    const material = new THREE.MeshLambertMaterial({ opacity: 0, transparent: true })

    const mesh = new THREE.Mesh(geometry, material);
    // PONER PARA QUE HAYA CILINDROS


    let structureContainer = document.createElement("a-entity")
    structureContainer.setAttribute("id", "container-" + structure.id)



    let structureEl = document.createElement("a-" + structure.primitive)
    structureEl.setAttribute("id", structure.id)
    structureEl.setAttribute("class", "collidable structure")
    structureEl.setAttribute("radius", structure.radius)
    structureEl.setAttribute("color", "#7BC8A4")
    structureEl.setAttribute("opacity", "0")
    structureEl.setAttribute("rotate-corner", "all")
    structureEl.object3D.add(mesh)
    structureEl.setAttribute("position", structure.position.x + " " + structure.position.y + " " + structure.position.z)
    structureContainer.appendChild(structureEl)

    // modelElement.addEventListener('model-loaded', (e) => {
    //     var obj = modelElement.getObject3D('mesh');
    //     var bbox = new THREE.Box3().setFromObject(obj);
    // })

    // structureEl.object3D.traverse(node => {
    //     if (node.type === "Mesh") { 

    //         const geometry = node.geometry.clone();
    //         geometry.applyMatrix4(node.parent.matrix);
    //         mesh.push(geometry)
    //     }
    // })

    return structureEl
}

function CreateInfoSpot(infoSpot) {
    let radius = 0.1
    let infoSpotContainer = document.createElement("a-entity")
    infoSpotContainer.setAttribute("id", "container-" + infoSpot.id)

    let line = document.createElement("a-entity")
    line.setAttribute("line", {
        start: infoSpot.startPosition,
        end: infoSpot.endPosition,
        // opacity: 0.99,
        // alphaTest: .5,
        color: "white"
    })

    let pointer = document.createElement("a-image")
    pointer.setAttribute("id", infoSpot.id)
    pointer.setAttribute("position", infoSpot.position)
    pointer.setAttribute("geometry", {
        primitive: "circle",
        radius: radius
    })
    pointer.classList.add("infoSpot")
    pointer.setAttribute("material", {
        src: "#infoSpot-img",
        opacity: 0.5,
        alphaTest: .5
    })
    pointer.setAttribute("info-spot",
        "title: " + infoSpot.infoSpot.title +
        "; description: " + infoSpot.infoSpot.description +
        "; image: " + infoSpot.infoSpot.image
    )

    infoSpotContainer.appendChild(line)
    infoSpotContainer.appendChild(pointer)
    return infoSpotContainer
}

var textureManager = new THREE.LoadingManager();
textureManager.onProgress = function ( item, loaded, total ) {
    // this gets called after any item has been loaded
    
};

textureManager.onLoad = function () {
    SetFirstSky()
};

var textureLoader = new THREE.ImageLoader(textureManager)
var myTextureArray = [];
var myTexture = new THREE.Texture();
myTextureArray.push(myTexture);
