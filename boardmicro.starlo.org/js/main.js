chrome.app.runtime.onLaunched.addListener(function() {
  var width = 320;
  var height = 480;

  chrome.app.window.create('index.html', {
    id: "BoardMicroID",
    bounds: {
      width: width,
      height: height,
    }
  });
});
