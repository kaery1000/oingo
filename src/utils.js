
export function getLocation() {
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  var crd;

  function setVal(crdVal) {
    crd = crdVal;
    console.log('in setVal', crd);
  }

  function success(pos) {
    setVal(pos.coords);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  window.navigator.geolocation.getCurrentPosition(success, error, options);

  return crd;
};
