var fs = require('fs');
var Chrome = require('chrome-remote-interface');

var TRACE_CATEGORIES = ["-*", "devtools.timeline", "disabled-by-default-devtools.timeline", "disabled-by-default-devtools.timeline.frame", "toplevel", "blink.console", "disabled-by-default-devtools.timeline.stack", "disabled-by-default-devtools.screenshot", "disabled-by-default-v8.cpu_profile", "disabled-by-default-v8.cpu_profiler", "disabled-by-default-v8.cpu_profiler.hires"];

var rawEvents = [];

var url = process.argv.slice(2)[0]

Chrome(function (chrome) {
    with (chrome) {
        Page.enable();
        Network.enable();

        // Disable cache (wonder if this works better than the browser...) 
        // Answer: it seems to work better from the eye ball test
        Network.setCacheDisabled({cacheDisabled: true});

        Tracing.start({
            "categories":   TRACE_CATEGORIES.join(','),
            "options":      "sampling-frequency=10000"  // 1000 is default and too slow.
        });

        Page.navigate({'url': url});

        Page.loadEventFired(function () {
           Tracing.end()
        });

        Tracing.tracingComplete(function () {
            var file = 'traces/profile-' + url.replace(/(^\w+:|^)\/\//, '') + "-" + Date.now() + '.devtools.trace';
            fs.writeFileSync(file, JSON.stringify(rawEvents, null, 2));
            console.log('Trace file: ' + file);

            chrome.close();
        });

        Tracing.dataCollected(function(data){
            var events = data.value;
            rawEvents = rawEvents.concat(events);
        });

    }
}).on('error', function (e) {
    console.error('Cannot connect to Chrome', e);
});