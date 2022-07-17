var _targetsInPool = [];

export function AddTarget(target) {
    _targetsInPool.push(target)
}

export function RemoveTarget(target) {
    var filtered = _targetsInPool.filter( _target => _target != target);
    _targetsInPool = filtered
}

export function GetCurrentTarget() {
    let raycasterEl = document.querySelector("#cursor-prev-raycast")
    let raycaster = raycasterEl.components.raycaster
    let intersection
    let previousDistance = 100000000
    let closestTarget

    _targetsInPool.forEach(target => {
        intersection = raycaster.getIntersection(target);
        if(intersection == null) return 
        if(intersection.distance < previousDistance) {
            previousDistance = intersection.distance
            closestTarget = target
        }
    });
    

    return closestTarget
}

export function MapInterval(val, srcMin, srcMax, dstMin, dstMax)
{
    if (val >= srcMax) return dstMax;
    if (val <= srcMin) return dstMin;
    return dstMin + (val - srcMin) / (srcMax - srcMin) * (dstMax - dstMin);
}

export function NormalizeAngleInRadians(cameraRotation) {
    let pi = Math.PI
    if(cameraRotation < 0) {
        while(cameraRotation < 0) {
            cameraRotation += 360
        }
    }

    if(cameraRotation > 360) {
        while(cameraRotation > 360) {
            cameraRotation -= 360;
        }
    }

    cameraRotation = (cameraRotation/180) * pi
    return cameraRotation
}

