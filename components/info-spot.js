import { ShowPanelInfo, HidePanelInfo } from "./InfoSpotManagment.js"

const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "mobile";
    }
    return "desktop";
}

var device = deviceType()

AFRAME.registerComponent('info-spot', {
    schema: {
        title: {type: 'string'},
        description: {type: 'string'},
        image: {type: 'string'}
    },
    init: function () {
        
        this.el.addEventListener('raycaster-intersected', evt => {
            this.raycaster = evt.detail.el;
            
            if(this.raycaster.getAttribute("id") == "cursor-prev-raycast") {
                let intersection = this.raycaster.components.raycaster.getIntersection(this.el)
                ShowPanelInfo(this.el, intersection, this.data.title, this.data.description, this.data.image)
            }
        })

        this.el.addEventListener('raycaster-intersected-cleared', evt => {
            this.raycaster = null;
            if(device == "mobile" || device == "tablet") {
                document.querySelector(".a-canvas").addEventListener('touchstart', onMouseMove)
                return 
            }
            HidePanelInfo()
        })

    },
    tick: function () {
        let camera = document.querySelector("#camera")
        this.el.object3D.lookAt(camera.object3D.position)
    }
}); 

var onMouseMove = function(evt) {
    HidePanelInfo()
    document.querySelector(".a-canvas").removeEventListener('touchstart', onMouseMove)
}   


let infoSpotPointers = document.querySelectorAll(".infoSpot")
infoSpotPointers.forEach(spot => {
    spot.setAttribute("info-spot", "")
});